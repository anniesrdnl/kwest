-- =============================================================================
-- Kwest · 0012_rival_achievement.sql
-- Replaces "Decorator" (place 5 items in your room), which can't be earned since
-- rooms were removed, with "Friendly Rival": a friend finishes a game on your
-- challenge link. Same reward and place in the list. Safe to run again.
-- =============================================================================

insert into public.achievements (key, name, description, icon_key, xp_reward, coin_reward, sort)
values ('rival', 'Friendly Rival', 'Have a friend play your challenge link.', 'badge-rival', 30, 20, 6)
on conflict (key) do update set
  name = excluded.name, description = excluded.description, icon_key = excluded.icon_key,
  xp_reward = excluded.xp_reward, coin_reward = excluded.coin_reward, sort = excluded.sort;

-- Rooms are gone: stop the old trigger from granting Decorator, then remove it.
drop trigger if exists room_placements_after_insert on public.room_placements;
drop function if exists private.room_placements_after_insert();
delete from public.user_achievements where achievement_key = 'decorator';
delete from public.achievements where key = 'decorator';

-- Same as 0010, plus the Friendly Rival award for the link owner.
create or replace function public.finish_challenge_attempt(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_attempt public.challenge_attempts%rowtype;
  v_owner   public.study_sessions%rowtype;
  v_ms      integer;
  v_owner_ms integer;
  v_won     boolean;
  v_owner_won boolean;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  update public.challenge_attempts
  set status = 'completed', ended_at = now()
  where id = p_attempt_id and user_id = v_uid and status = 'active'
  returning * into v_attempt;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  select s.* into v_owner
  from public.challenge_links l join public.study_sessions s on s.id = l.session_id
  where l.id = v_attempt.link_id;

  -- Someone else finished a game on this link: the owner earns Friendly Rival.
  if v_attempt.user_id <> v_owner.user_id then
    perform private.grant_achievement(v_owner.user_id, 'rival');
  end if;

  v_ms        := round(extract(epoch from (v_attempt.ended_at - v_attempt.started_at)) * 1000);
  v_owner_ms  := round(extract(epoch from (v_owner.ended_at - v_owner.started_at)) * 1000);
  v_won       := private.challenge_won(v_attempt.correct, v_attempt.incorrect);
  v_owner_won := private.challenge_won(v_owner.correct, v_owner.incorrect);

  return jsonb_build_object(
    'correct', v_attempt.correct,
    'incorrect', v_attempt.incorrect,
    'timeMs', v_ms,
    'won', v_won,
    -- Same order as the scoreboard: a win, then more right, then fewer misses, then faster.
    'beatOwner', (v_won, v_attempt.correct, -v_attempt.incorrect, -v_ms)
                 > (v_owner_won, v_owner.correct, -v_owner.incorrect, -v_owner_ms)
  );
end;
$$;

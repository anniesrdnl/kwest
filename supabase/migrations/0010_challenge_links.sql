-- =============================================================================
-- Kwest · 0010_challenge_links.sql
-- "Beat my score" links. After a challenge game, a player can share a link.
-- Friends who open it play the same deck under the same rules (8 right before
-- 3 misses), and a scoreboard on the link shows everyone's best try.
--
-- Friends can't read the owner's deck (RLS), so everything goes through the
-- security definer functions below. The tables have no policies: direct reads
-- and writes are denied. Playing a link earns no XP or coins, so links can't be
-- used to farm rewards, and the friend's own card progress is never touched.
-- =============================================================================

create table public.challenge_links (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique check (code ~ '^[a-z0-9]{8}$'),
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  set_id     uuid not null references public.study_sets (id) on delete cascade,
  -- The owner's game. Its score is the one to beat.
  session_id uuid not null unique references public.study_sessions (id) on delete cascade,
  timer      boolean not null default true,
  created_at timestamptz not null default now()
);
create index challenge_links_owner_idx on public.challenge_links (owner_id, created_at desc);

create table public.challenge_attempts (
  id         uuid primary key default gen_random_uuid(),
  link_id    uuid not null references public.challenge_links (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  status     public.session_status not null default 'active',
  correct    integer not null default 0,
  incorrect  integer not null default 0,
  started_at timestamptz not null default now(),
  ended_at   timestamptz
);
create index challenge_attempts_link_idx on public.challenge_attempts (link_id, status);
create index challenge_attempts_user_idx on public.challenge_attempts (user_id, started_at desc);

alter table public.challenge_links enable row level security;
alter table public.challenge_attempts enable row level security;
revoke all on public.challenge_links, public.challenge_attempts from anon, authenticated;

-- -----------------------------------------------------------------------------
-- Rules (keep in sync with src/features/study/challenge.ts and finish_session)
-- -----------------------------------------------------------------------------
create or replace function private.challenge_won(p_correct integer, p_incorrect integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_correct >= 8 and p_incorrect <= 2;
$$;

-- -----------------------------------------------------------------------------
-- create_challenge_link: share a finished challenge game. Returns the code.
-- Sharing the same game twice returns the same code.
-- -----------------------------------------------------------------------------
create or replace function public.create_challenge_link(p_session_id uuid, p_timer boolean default true)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_session public.study_sessions%rowtype;
  v_code    text;
  v_chars   constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_session from public.study_sessions where id = p_session_id and user_id = v_uid;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if v_session.mode <> 'game' or v_session.game_key <> 'dust-duel' or v_session.status <> 'completed' then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  select code into v_code from public.challenge_links where session_id = p_session_id;
  if found then
    return v_code;
  end if;

  loop
    select string_agg(substr(v_chars, 1 + floor(random() * length(v_chars))::integer, 1), '')
      into v_code
    from generate_series(1, 8);
    begin
      insert into public.challenge_links (code, owner_id, set_id, session_id, timer)
      values (v_code, v_uid, v_session.set_id, p_session_id, coalesce(p_timer, true));
      return v_code;
    exception when unique_violation then
      -- Another link has this code, or the same game was shared at the same moment.
      select code into v_code from public.challenge_links where session_id = p_session_id;
      if found then
        return v_code;
      end if;
    end;
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- get_challenge_link: everything the link page needs, or null if it's gone.
-- Cards include answers so the browser can build multiple-choice options (same
-- as solo study); grading still happens in submit_challenge_answer.
-- -----------------------------------------------------------------------------
create or replace function public.get_challenge_link(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_link  public.challenge_links%rowtype;
  v_set   public.study_sets%rowtype;
  v_cards jsonb;
  v_board jsonb;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_link from public.challenge_links where code = lower(trim(p_code));
  if not found then
    return null;
  end if;
  select * into v_set from public.study_sets where id = v_link.set_id;

  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'kind', kind, 'prompt', prompt, 'answer', answer)
                            order by position, created_at), '[]'::jsonb)
    into v_cards
  from public.cards where set_id = v_link.set_id;

  -- Everyone's best finished game: the owner's shared game plus each player's best try.
  with games as (
    select s.user_id, s.correct, s.incorrect,
           extract(epoch from (s.ended_at - s.started_at)) * 1000 as time_ms,
           true as is_owner
    from public.study_sessions s where s.id = v_link.session_id
    union all
    select a.user_id, a.correct, a.incorrect,
           extract(epoch from (a.ended_at - a.started_at)) * 1000,
           false
    from public.challenge_attempts a
    where a.link_id = v_link.id and a.status = 'completed'
  ),
  best as (
    select distinct on (user_id, is_owner) *
    from games
    order by user_id, is_owner,
             private.challenge_won(correct, incorrect) desc, correct desc, incorrect asc, time_ms asc
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'name', p.display_name,
           'icon', p.avatar_icon, 'color', p.avatar_color, 'frame', p.avatar_frame,
           'correct', b.correct, 'incorrect', b.incorrect,
           'timeMs', round(b.time_ms)::integer,
           'won', private.challenge_won(b.correct, b.incorrect),
           'isOwner', b.is_owner,
           'isYou', b.user_id = v_uid)
         order by private.challenge_won(b.correct, b.incorrect) desc, b.correct desc, b.incorrect asc, b.time_ms asc), '[]'::jsonb)
    into v_board
  from (select * from best
        order by private.challenge_won(correct, incorrect) desc, correct desc, incorrect asc, time_ms asc
        limit 20) b
  join public.profiles p on p.id = b.user_id;

  return jsonb_build_object(
    'code', v_link.code,
    'timer', v_link.timer,
    'isOwner', v_link.owner_id = v_uid,
    'ownerName', (select display_name from public.profiles where id = v_link.owner_id),
    'deck', jsonb_build_object('title', v_set.title, 'colorKey', v_set.color_key),
    'cards', v_cards,
    'board', v_board
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- start_challenge_attempt: begin a try at a link. Returns the attempt id.
-- -----------------------------------------------------------------------------
create or replace function public.start_challenge_attempt(p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_link public.challenge_links%rowtype;
  v_id   uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  select * into v_link from public.challenge_links where code = lower(trim(p_code));
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if (select count(*) from public.cards where set_id = v_link.set_id) < 4 then
    raise exception 'no_cards' using errcode = 'P0001';
  end if;

  -- Drop this player's unfinished tries on the link.
  update public.challenge_attempts set status = 'abandoned', ended_at = now()
  where link_id = v_link.id and user_id = v_uid and status = 'active';

  insert into public.challenge_attempts (link_id, user_id) values (v_link.id, v_uid) returning id into v_id;
  return v_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- submit_challenge_answer: grade one answer. Multiple choice or typed only.
-- Returns the same shape as submit_answer (no XP, no card progress).
-- -----------------------------------------------------------------------------
create or replace function public.submit_challenge_answer(
  p_attempt_id    uuid,
  p_card_id       uuid,
  p_question_type public.question_type,
  p_given         text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid        uuid := auth.uid();
  v_attempt    public.challenge_attempts%rowtype;
  v_link       public.challenge_links%rowtype;
  v_card       public.cards%rowtype;
  v_given      text := left(coalesce(p_given, ''), 500);
  v_expected   text;
  v_is_correct boolean;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_attempt from public.challenge_attempts where id = p_attempt_id and user_id = v_uid for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002', detail = 'attempt';
  end if;
  -- A game ends at 8 right or 3 misses; nothing counts after that.
  if v_attempt.status <> 'active' or v_attempt.correct >= 8 or v_attempt.incorrect >= 3 then
    raise exception 'not_active' using errcode = 'P0001';
  end if;

  select * into v_link from public.challenge_links where id = v_attempt.link_id;
  select * into v_card from public.cards where id = p_card_id and set_id = v_link.set_id;
  if not found then
    raise exception 'not_found' using errcode = 'P0002', detail = 'card';
  end if;

  case p_question_type
    when 'mc' then
      v_expected   := v_card.answer;
      v_is_correct := private.normalize_answer(v_given) = private.normalize_answer(v_card.answer);
    when 'id' then
      v_expected   := case when v_card.kind = 'term' then v_card.prompt else v_card.answer end;
      v_is_correct := private.answers_match(v_given, v_expected);
    else
      raise exception 'invalid_input' using errcode = '22023';
  end case;

  update public.challenge_attempts
  set correct   = correct + case when v_is_correct then 1 else 0 end,
      incorrect = incorrect + case when v_is_correct then 0 else 1 end
  where id = p_attempt_id;

  return jsonb_build_object(
    'isCorrect', v_is_correct,
    'expected', v_expected,
    'explanation', v_card.explanation,
    'pickedPrompt', null,
    'xp', 0,
    'box', 0,
    'masteredNow', false,
    'levelBefore', 0,
    'levelAfter', 0
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- finish_challenge_attempt: end a try. Returns its score and the score to beat.
-- -----------------------------------------------------------------------------
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

revoke all on function private.challenge_won(integer, integer) from public, anon, authenticated;
revoke all on function public.create_challenge_link(uuid, boolean)                                 from public, anon;
revoke all on function public.get_challenge_link(text)                                             from public, anon;
revoke all on function public.start_challenge_attempt(text)                                        from public, anon;
revoke all on function public.submit_challenge_answer(uuid, uuid, public.question_type, text)      from public, anon;
revoke all on function public.finish_challenge_attempt(uuid)                                       from public, anon;
grant execute on function public.create_challenge_link(uuid, boolean)                              to authenticated;
grant execute on function public.get_challenge_link(text)                                          to authenticated;
grant execute on function public.start_challenge_attempt(text)                                     to authenticated;
grant execute on function public.submit_challenge_answer(uuid, uuid, public.question_type, text)   to authenticated;
grant execute on function public.finish_challenge_attempt(uuid)                                    to authenticated;

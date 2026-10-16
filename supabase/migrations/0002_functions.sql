-- =============================================================================
-- Kwest · 0002_functions.sql
-- Game rules that must run on the server: grading, spaced repetition, XP,
-- coins, levels, achievements, purchases. The client never writes XP/coins.
--
-- Public RPCs (callable by signed-in users):
--   start_session, submit_answer, finish_session, buy_item
-- Everything in schema "private" is internal.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Pure helpers
-- -----------------------------------------------------------------------------

-- XP needed to go from level L to L+1 is 100 + 25·(L−1).
-- Keep in sync with src/lib/game/levels.ts.
create or replace function private.level_for_xp(p_xp integer)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_level     integer := 1;
  v_need      integer := 100;
  v_remaining integer := greatest(p_xp, 0);
begin
  while v_remaining >= v_need loop
    v_remaining := v_remaining - v_need;
    v_level := v_level + 1;
    v_need := 100 + 25 * (v_level - 1);
  end loop;
  return v_level;
end;
$$;

-- Days until a card is due again after landing in p_new_box.
create or replace function private.srs_interval(p_new_box smallint, p_old_box smallint)
returns interval
language sql
immutable
set search_path = ''
as $$
  select case p_new_box
    when 1 then interval '1 day'
    when 2 then interval '2 days'
    when 3 then interval '4 days'
    when 4 then interval '7 days'
    when 5 then case when p_old_box = 5 then interval '30 days' else interval '14 days' end
    else interval '0'
  end;
$$;

-- Lowercase, strip punctuation, collapse whitespace.
create or replace function private.normalize_answer(p_text text)
returns text
language sql
immutable
set search_path = ''
as $$
  select lower(trim(regexp_replace(
           regexp_replace(coalesce(p_text, ''), '[^[:alnum:][:space:]]', '', 'g'),
           '\s+', ' ', 'g')));
$$;

-- Typed answers allow small typos on longer answers.
create or replace function private.answers_match(p_given text, p_expected text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_given    text := private.normalize_answer(p_given);
  v_expected text := private.normalize_answer(p_expected);
begin
  if v_given = '' then
    return false;
  end if;
  if v_given = v_expected then
    return true;
  end if;
  if char_length(v_expected) < 6 or char_length(v_expected) > 255 or char_length(v_given) > 255 then
    return false;
  end if;
  return extensions.levenshtein(v_given, v_expected)
         <= case when char_length(v_expected) >= 12 then 2 else 1 end;
end;
$$;

create or replace function private.local_today(p_uid uuid)
returns date
language sql
stable
security definer
set search_path = ''
as $$
  select (now() at time zone coalesce(
            (select timezone from public.profiles where id = p_uid), 'UTC'))::date;
$$;

-- Free items (price 0) are owned automatically once the level allows it.
create or replace function private.owns_item(p_uid uuid, p_item_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.inventory where user_id = p_uid and item_key = p_item_key)
      or exists (
           select 1
           from public.items i
           join public.player_stats s on s.user_id = p_uid
           where i.key = p_item_key and i.price = 0 and i.unlock_level <= s.level
         );
$$;

-- -----------------------------------------------------------------------------
-- Reward plumbing (internal)
-- -----------------------------------------------------------------------------

-- Single entry point for changing XP / coins. Writes the ledger, updates the
-- cached totals and level, and tracks daily XP.
create or replace function private.apply_rewards(
  p_uid        uuid,
  p_xp         integer,
  p_coins      integer,
  p_source     public.xp_source,
  p_session_id uuid,
  p_meta       jsonb default '{}'::jsonb
)
returns integer -- new level
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_xp_total integer;
  v_level    integer;
begin
  if coalesce(p_xp, 0) = 0 and coalesce(p_coins, 0) = 0 then
    select level into v_level from public.player_stats where user_id = p_uid;
    return v_level;
  end if;

  update public.player_stats
     set xp_total = xp_total + p_xp,
         coins    = coins + p_coins
   where user_id = p_uid
  returning xp_total into v_xp_total;

  v_level := private.level_for_xp(v_xp_total);
  update public.player_stats set level = v_level where user_id = p_uid and level <> v_level;

  insert into public.xp_events (user_id, session_id, source, xp, coins, meta)
  values (p_uid, p_session_id, p_source, p_xp, p_coins, coalesce(p_meta, '{}'::jsonb));

  if p_xp > 0 then
    insert into public.daily_activity (user_id, day, xp)
    values (p_uid, private.local_today(p_uid), p_xp)
    on conflict (user_id, day) do update
      set xp = public.daily_activity.xp + excluded.xp;
  end if;

  if v_level >= 5 then
    perform private.grant_achievement(p_uid, 'level_5');
  end if;

  return v_level;
end;
$$;

-- Idempotent. Returns true only the first time.
create or replace function private.grant_achievement(p_uid uuid, p_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inserted boolean;
  v_xp       integer;
  v_coins    integer;
begin
  insert into public.user_achievements (user_id, achievement_key)
  values (p_uid, p_key)
  on conflict do nothing
  returning true into v_inserted;

  if not coalesce(v_inserted, false) then
    return false;
  end if;

  select xp_reward, coin_reward into v_xp, v_coins from public.achievements where key = p_key;
  perform private.apply_rewards(p_uid, coalesce(v_xp, 0), coalesce(v_coins, 0),
                                'achievement', null, jsonb_build_object('achievement', p_key));
  return true;
end;
$$;

-- Counts reviewed cards toward the daily lantern goal.
create or replace function private.bump_daily_cards(p_uid uuid, p_count integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day      date := private.local_today(p_uid);
  v_cards    integer;
  v_goal_met boolean;
  v_goal     integer;
  v_days     integer;
  v_total    integer;
begin
  insert into public.daily_activity (user_id, day, cards_reviewed)
  values (p_uid, v_day, p_count)
  on conflict (user_id, day) do update
    set cards_reviewed = public.daily_activity.cards_reviewed + excluded.cards_reviewed
  returning cards_reviewed, goal_met into v_cards, v_goal_met;

  select daily_goal into v_goal from public.player_stats where user_id = p_uid;

  if not v_goal_met and v_cards >= v_goal then
    update public.daily_activity set goal_met = true where user_id = p_uid and day = v_day;
    select count(*) into v_days from public.daily_activity where user_id = p_uid and goal_met;
    if v_days >= 7 then
      perform private.grant_achievement(p_uid, 'lantern_7');
    end if;
  end if;

  select coalesce(sum(cards_reviewed), 0) into v_total from public.daily_activity where user_id = p_uid;
  if v_total >= 100 then
    perform private.grant_achievement(p_uid, 'cards_100');
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Public RPC: start_session
-- -----------------------------------------------------------------------------
create or replace function public.start_session(
  p_set_id   uuid,
  p_mode     public.study_mode,
  p_game_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_count integer;
  v_id    uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select card_count into v_count
  from public.study_sets
  where id = p_set_id and owner_id = v_uid;

  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if v_count = 0 then
    raise exception 'no_cards' using errcode = 'P0001';
  end if;

  if p_mode = 'game' and coalesce(p_game_key, '') not in ('dust-duel') then
    raise exception 'invalid_input' using errcode = '22023', detail = 'unknown game_key';
  end if;

  insert into public.study_sessions (user_id, set_id, mode, game_key)
  values (v_uid, p_set_id, p_mode, case when p_mode = 'game' then p_game_key end)
  returning id into v_id;

  return v_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Public RPC: submit_answer
--   p_question_type:
--     'mc'    p_given = chosen answer text
--     'tf'    p_given = 'true' | 'false', p_shown_answer = answer text shown
--     'id'    p_given = typed text. Term cards: user types the TERM (prompt).
--                                   Question cards: user types the ANSWER.
--     'flash' p_given = 'known' | 'learning' (self-report: never changes box)
-- -----------------------------------------------------------------------------
create or replace function public.submit_answer(
  p_session_id    uuid,
  p_card_id       uuid,
  p_question_type public.question_type,
  p_given         text,
  p_response_ms   integer,
  p_shown_answer  text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid             uuid := auth.uid();
  v_session         public.study_sessions%rowtype;
  v_card            public.cards%rowtype;
  v_progress        public.card_progress%rowtype;
  v_given           text := left(coalesce(p_given, ''), 500);
  v_ms              integer := greatest(0, least(coalesce(p_response_ms, 0), 600000));
  v_is_flash        boolean := p_question_type = 'flash';
  v_expected        text;
  v_is_correct      boolean;
  v_fresh           boolean;
  v_old_box         smallint;
  v_new_box         smallint;
  v_due             timestamptz;
  v_recent_wrong    smallint;
  v_first_in_sess   boolean;
  v_already_paid    boolean;
  v_wrong_earlier   boolean;
  v_xp              integer := 0;
  v_mastered_now    boolean := false;
  v_picked_prompt   text;
  v_level_before    integer;
  v_level_after     integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_session
  from public.study_sessions
  where id = p_session_id and user_id = v_uid
  for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002', detail = 'session';
  end if;
  if v_session.status <> 'active' then
    raise exception 'not_active' using errcode = 'P0001';
  end if;

  select * into v_card from public.cards where id = p_card_id and set_id = v_session.set_id;
  if not found then
    raise exception 'not_found' using errcode = 'P0002', detail = 'card';
  end if;

  -- ---- Grade ---------------------------------------------------------------
  case p_question_type
    when 'mc' then
      v_expected   := v_card.answer;
      v_is_correct := private.normalize_answer(v_given) = private.normalize_answer(v_card.answer);
    when 'tf' then
      if lower(v_given) not in ('true', 'false') or p_shown_answer is null then
        raise exception 'invalid_input' using errcode = '22023';
      end if;
      v_expected   := v_card.answer;
      v_is_correct := (private.normalize_answer(p_shown_answer) = private.normalize_answer(v_card.answer))
                      = (lower(v_given) = 'true');
    when 'id' then
      v_expected   := case when v_card.kind = 'term' then v_card.prompt else v_card.answer end;
      v_is_correct := private.answers_match(v_given, v_expected);
    when 'flash' then
      if lower(v_given) not in ('known', 'learning') then
        raise exception 'invalid_input' using errcode = '22023';
      end if;
      v_expected   := v_card.answer;
      v_is_correct := lower(v_given) = 'known';
  end case;

  select not exists (select 1 from public.answers where session_id = p_session_id and card_id = v_card.id),
         exists (select 1 from public.answers where session_id = p_session_id and card_id = v_card.id and xp_awarded > 0),
         exists (select 1 from public.answers where session_id = p_session_id and card_id = v_card.id and not is_correct)
    into v_first_in_sess, v_already_paid, v_wrong_earlier;

  -- ---- Spaced repetition -----------------------------------------------------
  select * into v_progress
  from public.card_progress
  where user_id = v_uid and card_id = v_card.id
  for update;

  v_old_box      := coalesce(v_progress.box, 0);
  v_fresh        := v_progress.due_at is null or v_progress.due_at <= now();
  v_recent_wrong := coalesce(v_progress.recent_wrong, 0);

  if v_is_flash then
    -- Self-report never moves a card between boxes; it only flags weak cards.
    v_new_box := v_old_box;
    v_due     := v_progress.due_at;
    if not v_is_correct then
      v_recent_wrong := least(5, v_recent_wrong + 1);
    end if;
  elsif v_is_correct and v_wrong_earlier then
    -- Recovered after a miss in this session: stay in box 1, see it tomorrow.
    v_new_box      := 1;
    v_due          := now() + private.srs_interval(1::smallint, v_old_box);
    v_recent_wrong := greatest(0, v_recent_wrong - 1);
  elsif v_is_correct then
    v_new_box      := case when v_fresh then least(5, v_old_box + 1) else v_old_box end;
    v_due          := case when v_fresh then now() + private.srs_interval(v_new_box, v_old_box)
                           else v_progress.due_at end;
    v_recent_wrong := greatest(0, v_recent_wrong - 1);
    v_mastered_now := v_old_box < 5 and v_new_box = 5;
  else
    v_new_box      := 1;
    v_due          := now();
    v_recent_wrong := least(5, v_recent_wrong + 1);
  end if;

  insert into public.card_progress as cp
    (user_id, card_id, set_id, box, times_correct, times_wrong, recent_wrong, last_seen_at, due_at)
  values
    (v_uid, v_card.id, v_card.set_id, v_new_box,
     case when not v_is_flash and v_is_correct then 1 else 0 end,
     case when not v_is_flash and not v_is_correct then 1 else 0 end,
     v_recent_wrong, now(), v_due)
  on conflict (user_id, card_id) do update set
    box           = excluded.box,
    times_correct = cp.times_correct + excluded.times_correct,
    times_wrong   = cp.times_wrong + excluded.times_wrong,
    recent_wrong  = excluded.recent_wrong,
    last_seen_at  = excluded.last_seen_at,
    due_at        = excluded.due_at;

  -- ---- XP (anti click-through) ---------------------------------------------------
  if v_is_correct and not v_already_paid and v_ms >= 700 then
    v_xp := case p_question_type
              when 'flash' then case when v_fresh then 2  else 0 end
              when 'tf'    then case when v_fresh then 6  else 2 end
              when 'mc'    then case when v_fresh then 10 else 3 end
              when 'id'    then case when v_fresh then 15 else 5 end
            end;
    -- "Fix" bonus: got it right after getting it wrong.
    if not v_is_flash and (v_wrong_earlier or coalesce(v_progress.recent_wrong, 0) > 0) then
      v_xp := greatest(v_xp, 12);
    end if;
  end if;
  if v_mastered_now then
    v_xp := v_xp + 20;
  end if;

  insert into public.answers (session_id, user_id, card_id, question_type, given, is_correct, response_ms, xp_awarded)
  values (p_session_id, v_uid, v_card.id, p_question_type, v_given, v_is_correct, v_ms, v_xp);

  update public.study_sessions
     set correct   = correct   + case when v_is_correct then 1 else 0 end,
         incorrect = incorrect + case when v_is_correct then 0 else 1 end,
         xp_earned = xp_earned + v_xp
   where id = p_session_id;

  select level into v_level_before from public.player_stats where user_id = v_uid;
  v_level_after := private.apply_rewards(v_uid, v_xp, 0, 'answer', p_session_id,
                                         jsonb_build_object('card_id', v_card.id));

  if v_first_in_sess and v_ms >= 700 then
    perform private.bump_daily_cards(v_uid, 1);
  end if;

  -- Feedback: "You picked X, which is the answer for Y."
  if p_question_type = 'mc' and not v_is_correct then
    select prompt into v_picked_prompt
    from public.cards
    where set_id = v_card.set_id
      and id <> v_card.id
      and private.normalize_answer(answer) = private.normalize_answer(v_given)
    limit 1;
  end if;

  return jsonb_build_object(
    'isCorrect',    v_is_correct,
    'expected',     v_expected,
    'explanation',  v_card.explanation,
    'pickedPrompt', v_picked_prompt,
    'xp',           v_xp,
    'box',          v_new_box,
    'masteredNow',  v_mastered_now,
    'levelBefore',  v_level_before,
    'levelAfter',   v_level_after
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- Public RPC: finish_session
-- -----------------------------------------------------------------------------
create or replace function public.finish_session(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid          uuid := auth.uid();
  v_s            public.study_sessions%rowtype;
  v_tz           text;
  v_day_start    timestamptz;
  v_set_cards    integer;
  v_required     integer;
  v_meaningful   integer;
  v_graded       integer;
  v_accuracy     numeric;
  v_repeats      integer;
  v_bonus        integer := 0;
  v_game_xp      integer := 0;
  v_won          boolean := false;
  v_coins        integer := 0;
  v_total_cards  integer;
  v_strong_cards integer;
  v_new_mastery  boolean;
  v_mastery_xp   integer := 0;
  v_mastery_c    integer := 0;
  v_stats        public.player_stats%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_s from public.study_sessions where id = p_session_id and user_id = v_uid for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if v_s.status <> 'active' then
    raise exception 'not_active' using errcode = 'P0001';
  end if;

  select timezone into v_tz from public.profiles where id = v_uid;
  v_day_start := (private.local_today(v_uid)::timestamp) at time zone coalesce(v_tz, 'UTC');

  -- Only distinct cards answered with real thought count toward bonuses.
  select count(distinct card_id) filter (where response_ms >= 700)
    into v_meaningful
  from public.answers where session_id = p_session_id;

  select card_count into v_set_cards from public.study_sets where id = v_s.set_id;
  v_required := greatest(5, least(10, v_set_cards));
  v_graded   := v_s.correct + v_s.incorrect;
  v_accuracy := case when v_graded > 0 then v_s.correct::numeric / v_graded else 0 end;

  -- 3rd+ completed run of the same tome today earns half bonuses.
  select count(*) into v_repeats
  from public.study_sessions
  where user_id = v_uid and set_id = v_s.set_id and status = 'completed' and ended_at >= v_day_start;

  if v_set_cards >= 5 and v_meaningful >= v_required then
    v_bonus := case when v_repeats >= 2 then 15 else 30 end;
    if v_s.mode <> 'flashcards' and v_accuracy >= 0.8 then
      v_bonus := v_bonus + case when v_repeats >= 2 then 10 else 20 end;
    end if;
  end if;

  -- Dust Duel win rule (keep in sync with src/features/games/dust-duel/rules.ts):
  -- 8 hits defeat the mite; the 3rd wrong answer loses.
  if v_s.mode = 'game' and v_s.game_key = 'dust-duel' and v_s.correct >= 8 and v_s.incorrect <= 2 then
    v_won     := true;
    v_game_xp := case when v_repeats >= 2 then 20 else 40 end;
  end if;

  v_coins := (v_s.xp_earned + v_bonus + v_game_xp) / 10
           + case when v_bonus > 0 then 10 else 0 end;

  if v_bonus > 0 or v_coins > 0 then
    perform private.apply_rewards(v_uid, v_bonus, v_coins, 'session', p_session_id, '{}'::jsonb);
  end if;
  if v_game_xp > 0 then
    perform private.apply_rewards(v_uid, v_game_xp, 0, 'game', p_session_id,
                                  jsonb_build_object('game', v_s.game_key));
  end if;

  -- Tome mastery: ≥5 cards, every card in box 4+.
  select count(*), count(*) filter (where cp.box >= 4)
    into v_total_cards, v_strong_cards
  from public.cards c
  left join public.card_progress cp on cp.card_id = c.id and cp.user_id = v_uid
  where c.set_id = v_s.set_id;

  if v_total_cards >= 5 and v_total_cards = v_strong_cards then
    insert into public.set_masteries (user_id, set_id) values (v_uid, v_s.set_id)
    on conflict do nothing
    returning true into v_new_mastery;
    if coalesce(v_new_mastery, false) then
      v_mastery_xp := 100;
      v_mastery_c  := 50;
      perform private.apply_rewards(v_uid, v_mastery_xp, v_mastery_c, 'mastery', p_session_id,
                                    jsonb_build_object('set_id', v_s.set_id));
      perform private.grant_achievement(v_uid, 'first_mastery');
    end if;
  end if;

  perform private.grant_achievement(v_uid, 'first_session');
  if v_s.mode = 'quiz' and v_graded >= 10 and v_s.incorrect = 0 then
    perform private.grant_achievement(v_uid, 'perfect_quiz');
  end if;
  if v_won then
    perform private.grant_achievement(v_uid, 'dust_buster');
  end if;

  update public.study_sessions
     set status       = 'completed',
         ended_at     = now(),
         xp_earned    = xp_earned + v_bonus + v_game_xp + v_mastery_xp,
         coins_earned = v_coins + v_mastery_c
   where id = p_session_id
  returning * into v_s;

  update public.study_sets set last_studied_at = now() where id = v_s.set_id;

  select * into v_stats from public.player_stats where user_id = v_uid;

  return jsonb_build_object(
    'sessionId',    v_s.id,
    'mode',         v_s.mode,
    'correct',      v_s.correct,
    'incorrect',    v_s.incorrect,
    'accuracy',     round(v_accuracy, 3),
    'xpEarned',     v_s.xp_earned,
    'coinsEarned',  v_s.coins_earned,
    'sessionBonus', v_bonus,
    'won',          v_won,
    'masteredSet',  coalesce(v_new_mastery, false),
    'xpTotal',      v_stats.xp_total,
    'level',        v_stats.level,
    'coins',        v_stats.coins
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- Public RPC: buy_item
-- -----------------------------------------------------------------------------
create or replace function public.buy_item(p_item_key text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_item  public.items%rowtype;
  v_stats public.player_stats%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_item from public.items where key = p_item_key;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if v_item.price = 0 then
    raise exception 'invalid_input' using errcode = '22023', detail = 'free items are not purchased';
  end if;

  select * into v_stats from public.player_stats where user_id = v_uid for update;
  if v_stats.level < v_item.unlock_level then
    raise exception 'level_locked' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.inventory where user_id = v_uid and item_key = p_item_key) then
    raise exception 'already_owned' using errcode = 'P0001';
  end if;
  if v_stats.coins < v_item.price then
    raise exception 'insufficient_coins' using errcode = 'P0001';
  end if;

  update public.player_stats set coins = coins - v_item.price where user_id = v_uid
  returning * into v_stats;

  insert into public.inventory (user_id, item_key) values (v_uid, p_item_key);

  insert into public.xp_events (user_id, source, xp, coins, meta)
  values (v_uid, 'purchase', 0, -v_item.price, jsonb_build_object('item', p_item_key));

  return jsonb_build_object('itemKey', p_item_key, 'coins', v_stats.coins);
end;
$$;

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

-- New auth user → profile, stats, avatar, starter furniture.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
                  split_part(new.email, '@', 1),
                  'Student'), 40)
  );
  insert into public.player_stats (user_id) values (new.id);
  insert into public.avatars (user_id) values (new.id);

  insert into public.room_placements (user_id, room_key, item_key, x, y, layer)
  select new.id, 'dorm', v.item_key, v.x, v.y, v.layer
  from (values ('bookshelf', 0, 1, 0),
               ('bed',       2, 3, 0),
               ('desk',      6, 3, 0),
               ('chair',     7, 4, 1)) as v(item_key, x, y, layer)
  where exists (select 1 from public.items i where i.key = v.item_key);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Cards inherit owner_id from their set; enforce a 500-card limit.
create or replace function private.cards_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.set_id <> old.set_id then
    raise exception 'invalid_input' using errcode = '22023', detail = 'cards cannot move between sets';
  end if;

  select owner_id into new.owner_id from public.study_sets where id = new.set_id;
  if new.owner_id is null then
    raise exception 'not_found' using errcode = 'P0002', detail = 'set';
  end if;

  if tg_op = 'INSERT' and (select card_count from public.study_sets where id = new.set_id) >= 500 then
    raise exception 'set_full' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger cards_before_write
  before insert or update on public.cards
  for each row execute function private.cards_before_write();

create or replace function private.cards_after_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_set_id uuid := coalesce(new.set_id, old.set_id);
begin
  update public.study_sets
     set card_count = (select count(*) from public.cards where set_id = v_set_id)
   where id = v_set_id;
  return null;
end;
$$;

create trigger cards_after_change
  after insert or delete on public.cards
  for each row execute function private.cards_after_change();

create or replace function private.study_sets_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.grant_achievement(new.owner_id, 'first_tome');
  return null;
end;
$$;

create trigger study_sets_after_insert
  after insert on public.study_sets
  for each row execute function private.study_sets_after_insert();

-- Avatar parts must be owned and in the right category.
create or replace function private.avatars_validate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_part record;
begin
  for v_part in
    select * from (values ('hair', new.hair_style),
                          ('shirt', new.shirt),
                          ('pants', new.pants),
                          ('accessory', new.accessory)) as p(category, item_key)
    where p.item_key is not null
  loop
    if not exists (select 1 from public.items where key = v_part.item_key and category::text = v_part.category) then
      raise exception 'invalid_input' using errcode = '22023', detail = 'wrong item category';
    end if;
    if not private.owns_item(new.user_id, v_part.item_key) then
      raise exception 'not_owned' using errcode = 'P0001';
    end if;
  end loop;
  return new;
end;
$$;

create trigger avatars_validate
  before update on public.avatars
  for each row execute function private.avatars_validate();

-- Room items must be owned, placeable and inside the 10 × 6 grid.
create or replace function private.room_placements_validate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.items%rowtype;
begin
  select * into v_item from public.items where key = new.item_key;
  if not found or v_item.category not in ('furniture', 'decor', 'wall', 'floor') then
    raise exception 'invalid_input' using errcode = '22023', detail = 'item is not placeable';
  end if;
  if new.x + v_item.footprint_w > 10 or new.y + v_item.footprint_h > 6 then
    raise exception 'invalid_input' using errcode = '22023', detail = 'out of bounds';
  end if;
  if not private.owns_item(new.user_id, new.item_key) then
    raise exception 'not_owned' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger room_placements_validate
  before insert or update on public.room_placements
  for each row execute function private.room_placements_validate();

create or replace function private.room_placements_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*)
      from public.room_placements rp
      join public.items i on i.key = rp.item_key
      where rp.user_id = new.user_id and i.price > 0) >= 5 then
    perform private.grant_achievement(new.user_id, 'decorator');
  end if;
  return null;
end;
$$;

create trigger room_placements_after_insert
  after insert on public.room_placements
  for each row execute function private.room_placements_after_insert();

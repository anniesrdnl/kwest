-- =============================================================================
-- Kwest · 0001_schema.sql
-- Tables, enums, indexes and simple housekeeping triggers.
-- Run order: 0001_schema → 0002_functions → 0003_security → seed.sql
-- =============================================================================

create extension if not exists fuzzystrmatch with schema extensions;

-- Internal schema: NOT exposed through the Data API. Holds helpers that only
-- trusted (security definer) code may call.
create schema if not exists private;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.card_kind      as enum ('term', 'question');
create type public.set_visibility as enum ('private', 'unlisted', 'public');
create type public.study_mode     as enum ('flashcards', 'quiz', 'practice', 'game');
create type public.question_type  as enum ('mc', 'tf', 'id', 'flash');
create type public.session_status as enum ('active', 'completed', 'abandoned');
create type public.item_category  as enum ('hair', 'shirt', 'pants', 'accessory', 'furniture', 'decor', 'wall', 'floor');
create type public.xp_source      as enum ('answer', 'session', 'game', 'mastery', 'achievement', 'purchase', 'adjustment');

-- -----------------------------------------------------------------------------
-- Profiles & player state
-- -----------------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  username        text check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  display_name    text not null check (char_length(display_name) between 1 and 40),
  onboarding_step smallint not null default 0 check (onboarding_step between 0 and 10),
  timezone        text not null default 'UTC',
  theme           text not null default 'system' check (theme in ('system', 'light', 'dark')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index profiles_username_lower_key on public.profiles (lower(username));

create table public.player_stats (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  xp_total   integer  not null default 0  check (xp_total >= 0),
  level      integer  not null default 1  check (level >= 1),
  coins      integer  not null default 0  check (coins >= 0),
  daily_goal smallint not null default 20 check (daily_goal between 5 and 200),
  updated_at timestamptz not null default now()
);

-- Catalog of everything that can be owned: cosmetics and room items.
create table public.items (
  key          text primary key check (key ~ '^[a-z0-9-]{2,40}$'),
  name         text not null,
  category     public.item_category not null,
  price        integer  not null default 0 check (price >= 0),
  unlock_level integer  not null default 1 check (unlock_level >= 1),
  sprite_key   text not null,
  footprint_w  smallint not null default 1 check (footprint_w between 1 and 10),
  footprint_h  smallint not null default 1 check (footprint_h between 1 and 6),
  sort         integer  not null default 0
);

create table public.avatars (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  skin_tone  text not null default 'skin-3'   check (skin_tone ~ '^skin-[1-6]$'),
  hair_color text not null default 'hc-brown' check (hair_color ~ '^hc-[a-z]{2,12}$'),
  hair_style text not null default 'hair-short'  references public.items (key) deferrable initially deferred,
  shirt      text not null default 'shirt-tee'   references public.items (key) deferrable initially deferred,
  pants      text not null default 'pants-jeans' references public.items (key) deferrable initially deferred,
  accessory  text references public.items (key) deferrable initially deferred,
  updated_at timestamptz not null default now()
);

create table public.inventory (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  item_key    text not null references public.items (key),
  acquired_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

-- Room grid is 10 × 6 tiles (each tile 16 px of art).
create table public.room_placements (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  room_key   text not null default 'dorm' check (room_key in ('dorm', 'library')),
  item_key   text not null references public.items (key),
  x          smallint not null check (x between 0 and 9),
  y          smallint not null check (y between 0 and 5),
  layer      smallint not null default 0 check (layer between 0 and 9),
  flipped    boolean  not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, room_key, item_key)
);

-- -----------------------------------------------------------------------------
-- Study content
-- -----------------------------------------------------------------------------
create table public.study_sets (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title           text not null check (char_length(title) between 1 and 120),
  subject         text check (char_length(subject) <= 60),
  description     text check (char_length(description) <= 1000),
  color_key       text not null default 'spine-1' check (color_key ~ '^spine-[1-8]$'),
  visibility      public.set_visibility not null default 'private',
  card_count      integer not null default 0,
  last_studied_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index study_sets_owner_updated_idx on public.study_sets (owner_id, updated_at desc);

-- term:     prompt = term,     answer = definition
-- question: prompt = question, answer = answer
create table public.cards (
  id          uuid primary key default gen_random_uuid(),
  set_id      uuid not null references public.study_sets (id) on delete cascade,
  owner_id    uuid not null references public.profiles (id) on delete cascade, -- copied from set by trigger
  position    integer not null default 0,
  kind        public.card_kind not null default 'term',
  prompt      text not null check (char_length(prompt) between 1 and 500),
  answer      text not null check (char_length(answer) between 1 and 500),
  explanation text check (char_length(explanation) <= 1000),
  distractors text[] check (distractors is null or cardinality(distractors) <= 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index cards_set_position_idx on public.cards (set_id, position);
create index cards_owner_idx on public.cards (owner_id);

-- Per-user spaced-repetition state (Leitner boxes 0–5).
create table public.card_progress (
  user_id       uuid not null references public.profiles (id) on delete cascade,
  card_id       uuid not null references public.cards (id) on delete cascade,
  set_id        uuid not null references public.study_sets (id) on delete cascade,
  box           smallint not null default 0 check (box between 0 and 5),
  times_correct integer  not null default 0,
  times_wrong   integer  not null default 0,
  recent_wrong  smallint not null default 0 check (recent_wrong between 0 and 5),
  last_seen_at  timestamptz,
  due_at        timestamptz,
  primary key (user_id, card_id)
);
create index card_progress_due_idx on public.card_progress (user_id, set_id, due_at);

-- A quiz attempt is a study_session with mode = 'quiz'.
create table public.study_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  set_id       uuid not null references public.study_sets (id) on delete cascade,
  mode         public.study_mode not null,
  game_key     text,
  status       public.session_status not null default 'active',
  correct      integer not null default 0,
  incorrect    integer not null default 0,
  xp_earned    integer not null default 0,
  coins_earned integer not null default 0,
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,
  check ((mode = 'game') = (game_key is not null))
);
create index study_sessions_user_started_idx on public.study_sessions (user_id, started_at desc);
create index study_sessions_user_set_idx on public.study_sessions (user_id, set_id, status);

create table public.answers (
  id            bigint generated always as identity primary key,
  session_id    uuid not null references public.study_sessions (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  card_id       uuid not null references public.cards (id) on delete cascade,
  question_type public.question_type not null,
  given         text not null,
  is_correct    boolean not null,
  response_ms   integer not null,
  xp_awarded    integer not null default 0,
  created_at    timestamptz not null default now()
);
create index answers_session_card_idx on public.answers (session_id, card_id);
create index answers_user_idx on public.answers (user_id);

-- -----------------------------------------------------------------------------
-- Rewards & progress history
-- -----------------------------------------------------------------------------
-- Append-only reward history. player_stats is a cached total of this table.
create table public.xp_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  session_id uuid references public.study_sessions (id) on delete set null,
  source     public.xp_source not null,
  xp         integer not null default 0,
  coins      integer not null default 0,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index xp_events_user_created_idx on public.xp_events (user_id, created_at desc);

create table public.daily_activity (
  user_id        uuid not null references public.profiles (id) on delete cascade,
  day            date not null,
  cards_reviewed integer not null default 0,
  xp             integer not null default 0,
  goal_met       boolean not null default false,
  primary key (user_id, day)
);

create table public.set_masteries (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  set_id      uuid not null references public.study_sets (id) on delete cascade,
  mastered_at timestamptz not null default now(),
  primary key (user_id, set_id)
);

create table public.achievements (
  key         text primary key,
  name        text not null,
  description text not null,
  icon_key    text not null,
  xp_reward   integer not null default 0,
  coin_reward integer not null default 0,
  sort        integer not null default 0
);

create table public.user_achievements (
  user_id         uuid not null references public.profiles (id) on delete cascade,
  achievement_key text not null references public.achievements (key),
  earned_at       timestamptz not null default now(),
  primary key (user_id, achievement_key)
);

-- -----------------------------------------------------------------------------
-- Housekeeping triggers
-- -----------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at     before update on public.profiles     for each row execute function private.set_updated_at();
create trigger player_stats_updated_at before update on public.player_stats for each row execute function private.set_updated_at();
create trigger avatars_updated_at      before update on public.avatars      for each row execute function private.set_updated_at();
create trigger study_sets_updated_at   before update on public.study_sets   for each row execute function private.set_updated_at();
create trigger cards_updated_at        before update on public.cards        for each row execute function private.set_updated_at();

-- Reject unknown time zones (raises "time zone ... not recognized").
create or replace function private.validate_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform now() at time zone new.timezone;
  return new;
end;
$$;

create trigger profiles_validate_timezone
  before insert or update of timezone on public.profiles
  for each row execute function private.validate_timezone();

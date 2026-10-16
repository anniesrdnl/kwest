-- =============================================================================
-- Kwest · 0003_security.sql
-- Row Level Security + explicit privileges.
-- Rule: users read their own rows; they may only write content they author
-- (profile fields, sets, cards, avatar, room layout). XP, coins, levels,
-- progress, sessions and inventory change ONLY through the RPCs in 0002.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Lock down the private schema and all functions first
-- -----------------------------------------------------------------------------
revoke all on schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
alter default privileges in schema private revoke execute on functions from public, anon, authenticated;

revoke all on function public.start_session(uuid, public.study_mode, text)                                  from public, anon;
revoke all on function public.submit_answer(uuid, uuid, public.question_type, text, integer, text)          from public, anon;
revoke all on function public.finish_session(uuid)                                                           from public, anon;
revoke all on function public.buy_item(text)                                                                 from public, anon;
grant execute on function public.start_session(uuid, public.study_mode, text)                               to authenticated;
grant execute on function public.submit_answer(uuid, uuid, public.question_type, text, integer, text)       to authenticated;
grant execute on function public.finish_session(uuid)                                                        to authenticated;
grant execute on function public.buy_item(text)                                                              to authenticated;

-- -----------------------------------------------------------------------------
-- Table privileges: start from nothing, then grant exactly what's needed
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;

grant select on
  public.profiles, public.player_stats, public.avatars, public.items, public.inventory,
  public.room_placements, public.study_sets, public.cards, public.card_progress,
  public.study_sessions, public.answers, public.xp_events, public.daily_activity,
  public.set_masteries, public.achievements, public.user_achievements
to authenticated;

grant update (username, display_name, onboarding_step, timezone, theme) on public.profiles to authenticated;
grant update (daily_goal)                                                on public.player_stats to authenticated;
grant update (skin_tone, hair_color, hair_style, shirt, pants, accessory) on public.avatars to authenticated;

grant insert (title, subject, description, color_key) on public.study_sets to authenticated;
grant update (title, subject, description, color_key) on public.study_sets to authenticated;
grant delete                                           on public.study_sets to authenticated;

grant insert (set_id, position, kind, prompt, answer, explanation, distractors) on public.cards to authenticated;
grant update (position, kind, prompt, answer, explanation, distractors)         on public.cards to authenticated;
grant delete                                                                     on public.cards to authenticated;

grant insert (room_key, item_key, x, y, layer, flipped) on public.room_placements to authenticated;
grant update (x, y, layer, flipped)                     on public.room_placements to authenticated;
grant delete                                            on public.room_placements to authenticated;

-- -----------------------------------------------------------------------------
-- Enable RLS everywhere
-- -----------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.player_stats      enable row level security;
alter table public.avatars           enable row level security;
alter table public.items             enable row level security;
alter table public.inventory         enable row level security;
alter table public.room_placements   enable row level security;
alter table public.study_sets        enable row level security;
alter table public.cards             enable row level security;
alter table public.card_progress     enable row level security;
alter table public.study_sessions    enable row level security;
alter table public.answers           enable row level security;
alter table public.xp_events         enable row level security;
alter table public.daily_activity    enable row level security;
alter table public.set_masteries     enable row level security;
alter table public.achievements      enable row level security;
alter table public.user_achievements enable row level security;

-- -----------------------------------------------------------------------------
-- Policies  ((select auth.uid()) is evaluated once per query, not per row)
-- -----------------------------------------------------------------------------
-- Catalogs: readable by any signed-in user.
create policy "items: read"        on public.items        for select to authenticated using (true);
create policy "achievements: read" on public.achievements for select to authenticated using (true);

-- Profile / stats / avatar
create policy "profiles: read own"   on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "player_stats: read own"   on public.player_stats for select to authenticated using (user_id = (select auth.uid()));
create policy "player_stats: update own" on public.player_stats for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "avatars: read own"   on public.avatars for select to authenticated using (user_id = (select auth.uid()));
create policy "avatars: update own" on public.avatars for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Study sets
create policy "study_sets: read own"   on public.study_sets for select to authenticated using (owner_id = (select auth.uid()));
create policy "study_sets: insert own" on public.study_sets for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "study_sets: update own" on public.study_sets for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "study_sets: delete own" on public.study_sets for delete to authenticated using (owner_id = (select auth.uid()));

-- Cards (owner_id is copied from the set by trigger)
create policy "cards: read own"   on public.cards for select to authenticated using (owner_id = (select auth.uid()));
create policy "cards: insert own" on public.cards for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "cards: update own" on public.cards for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "cards: delete own" on public.cards for delete to authenticated using (owner_id = (select auth.uid()));

-- Room layout
create policy "room_placements: read own"   on public.room_placements for select to authenticated using (user_id = (select auth.uid()));
create policy "room_placements: insert own" on public.room_placements for insert to authenticated with check (user_id = (select auth.uid()));
create policy "room_placements: update own" on public.room_placements for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "room_placements: delete own" on public.room_placements for delete to authenticated using (user_id = (select auth.uid()));

-- Read-only (written by RPCs only)
create policy "inventory: read own"         on public.inventory         for select to authenticated using (user_id = (select auth.uid()));
create policy "card_progress: read own"     on public.card_progress     for select to authenticated using (user_id = (select auth.uid()));
create policy "study_sessions: read own"    on public.study_sessions    for select to authenticated using (user_id = (select auth.uid()));
create policy "answers: read own"           on public.answers           for select to authenticated using (user_id = (select auth.uid()));
create policy "xp_events: read own"         on public.xp_events         for select to authenticated using (user_id = (select auth.uid()));
create policy "daily_activity: read own"    on public.daily_activity    for select to authenticated using (user_id = (select auth.uid()));
create policy "set_masteries: read own"     on public.set_masteries     for select to authenticated using (user_id = (select auth.uid()));
create policy "user_achievements: read own" on public.user_achievements for select to authenticated using (user_id = (select auth.uid()));

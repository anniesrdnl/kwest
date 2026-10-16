-- =============================================================================
-- Kwest · 0004_dashboard.sql
-- Read-only summary of "dust" (cards due for review) per tome, for the dashboard.
-- Run after 0001–0003 and seed.sql.
-- =============================================================================

-- One row per tome the caller owns:
--   due_count   cards with a progress row that is due now (due_at null or in the past)
--   new_count   cards the caller has never answered (no progress row yet)
--   next_due_at earliest future review, for the "all dusted" state
--
-- security invoker: runs as the caller, so Row Level Security still applies.
-- It only reads; rewards and progress are still written only by the RPCs in 0002.
create or replace function public.tome_dust()
returns table (set_id uuid, due_count integer, new_count integer, next_due_at timestamptz)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    s.id,
    (select count(*)::integer
       from public.card_progress p
      where p.user_id = (select auth.uid())
        and p.set_id = s.id
        and (p.due_at is null or p.due_at <= now())),
    (select count(*)::integer
       from public.cards c
      where c.set_id = s.id
        and not exists (
          select 1 from public.card_progress p
           where p.user_id = (select auth.uid()) and p.card_id = c.id)),
    (select min(p.due_at)
       from public.card_progress p
      where p.user_id = (select auth.uid())
        and p.set_id = s.id
        and p.due_at > now())
  from public.study_sets s
  where s.owner_id = (select auth.uid());
$$;

revoke all on function public.tome_dust() from public, anon;
grant execute on function public.tome_dust() to authenticated;

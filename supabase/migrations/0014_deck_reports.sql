-- =============================================================================
-- Kwest · 0014_deck_reports.sql
-- Report a shared deck. Each person can report a deck once (reporting again
-- updates the reason). A deck with 3 or more open reports is hidden from
-- Explore. Its link still works for people the owner sent it to.
--
-- There is no admin screen. To review, run in the SQL Editor:
--
--   -- Reported decks, most reports first
--   select s.id, s.title, s.visibility, p.display_name as owner,
--          count(*) as reports, array_agg(r.reason) as reasons, array_agg(r.note) as notes
--   from public.deck_reports r
--   join public.study_sets s on s.id = r.set_id
--   join public.profiles p on p.id = s.owner_id
--   group by s.id, p.display_name
--   order by reports desc;
--
--   -- Deck is fine: clear its reports (it shows in Explore again)
--   delete from public.deck_reports where set_id = '<deck id>';
--
--   -- Deck is not okay: make it private (link and Explore both stop working)
--   update public.study_sets set visibility = 'private' where id = '<deck id>';
--   delete from public.deck_reports where set_id = '<deck id>';
--
-- Safe to run again.
-- =============================================================================

create table if not exists public.deck_reports (
  set_id      uuid not null references public.study_sets (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason      text not null check (reason in ('wrong', 'offensive', 'spam', 'other')),
  note        text check (char_length(note) <= 300),
  created_at  timestamptz not null default now(),
  primary key (set_id, reporter_id)
);

alter table public.deck_reports enable row level security;
revoke all on public.deck_reports from anon, authenticated;

-- 3 reports from different people hide a deck from Explore.
create or replace function private.deck_hidden(p_set_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select count(*) >= 3 from public.deck_reports where set_id = p_set_id;
$$;
revoke all on function private.deck_hidden(uuid) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- report_deck: report a deck someone else shared.
-- -----------------------------------------------------------------------------
create or replace function public.report_deck(p_set_id uuid, p_reason text, p_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_set public.study_sets%rowtype;
  v_note text := nullif(trim(left(coalesce(p_note, ''), 300)), '');
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_reason not in ('wrong', 'offensive', 'spam', 'other') then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  select * into v_set from public.study_sets where id = p_set_id;
  -- Only decks you can see, and never your own.
  if not found or v_set.visibility = 'private' or v_set.owner_id = v_uid then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  insert into public.deck_reports (set_id, reporter_id, reason, note)
  values (p_set_id, v_uid, p_reason, v_note)
  on conflict (set_id, reporter_id) do update
    set reason = excluded.reason, note = excluded.note, created_at = now();
end;
$$;

-- -----------------------------------------------------------------------------
-- deck_hidden_from_explore: for the owner's Share box. False for other people's decks.
-- -----------------------------------------------------------------------------
create or replace function public.deck_hidden_from_explore(p_set_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.study_sets
    where id = p_set_id and owner_id = auth.uid() and private.deck_hidden(id)
  );
$$;

-- -----------------------------------------------------------------------------
-- get_shared_deck: same as 0011, plus whether you already reported it.
-- -----------------------------------------------------------------------------
create or replace function public.get_shared_deck(p_set_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_set public.study_sets%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_set from public.study_sets where id = p_set_id;
  if not found or (v_set.visibility = 'private' and v_set.owner_id <> v_uid) then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_set.id,
    'title', v_set.title,
    'subject', v_set.subject,
    'description', v_set.description,
    'colorKey', v_set.color_key,
    'shared', v_set.visibility <> 'private',
    'isOwner', v_set.owner_id = v_uid,
    'ownerName', (select display_name from public.profiles where id = v_set.owner_id),
    'reportedByYou', exists (select 1 from public.deck_reports where set_id = v_set.id and reporter_id = v_uid),
    'cards', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'id', id, 'kind', kind, 'prompt', prompt, 'answer', answer, 'explanation', explanation)
             order by position, created_at), '[]'::jsonb)
      from public.cards where set_id = v_set.id
    )
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- list_public_decks: same as 0013, minus decks hidden by reports.
-- -----------------------------------------------------------------------------
create or replace function public.list_public_decks(p_query text default '', p_limit integer default 60)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_words text[];
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  -- Split the search into words; escape LIKE wildcards so they match literally.
  select coalesce(array_agg(replace(replace(replace(w, '\', '\\'), '%', '\%'), '_', '\_')), '{}')
    into v_words
  from regexp_split_to_table(lower(trim(left(coalesce(p_query, ''), 100))), '\s+') as w
  where w <> '';

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
             'id', s.id,
             'title', s.title,
             'subject', s.subject,
             'colorKey', s.color_key,
             'cardCount', s.card_count,
             'ownerName', p.display_name,
             'isOwner', s.owner_id = v_uid)
           order by s.updated_at desc), '[]'::jsonb)
    from (
      select * from public.study_sets s
      where s.visibility = 'public'
        and s.card_count > 0
        and not private.deck_hidden(s.id)
        and not exists (
          select 1 from unnest(v_words) as w
          where lower(s.title || ' ' || coalesce(s.subject, '')) not like '%' || w || '%'
        )
      order by s.updated_at desc
      limit greatest(1, least(coalesce(p_limit, 60), 100))
    ) s
    join public.profiles p on p.id = s.owner_id
  );
end;
$$;

revoke all on function public.report_deck(uuid, text, text)           from public, anon;
revoke all on function public.deck_hidden_from_explore(uuid)           from public, anon;
grant execute on function public.report_deck(uuid, text, text)        to authenticated;
grant execute on function public.deck_hidden_from_explore(uuid)        to authenticated;

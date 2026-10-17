-- =============================================================================
-- Kwest · 0015_explore_sort_copies.sql
-- Explore: count how many people copied a deck, sort by "Most copied",
-- and let the list grow with a "Load more" button.
--
-- A copy counts once per person, and never counts the deck's owner.
-- Safe to run again.
-- =============================================================================

create table if not exists public.deck_copies (
  set_id    uuid not null references public.study_sets (id) on delete cascade,
  copier_id uuid not null references public.profiles (id) on delete cascade,
  copied_at timestamptz not null default now(),
  primary key (set_id, copier_id)
);

alter table public.deck_copies enable row level security;
revoke all on public.deck_copies from anon, authenticated;

-- -----------------------------------------------------------------------------
-- copy_deck: same as 0011, plus it records the copy.
-- -----------------------------------------------------------------------------
create or replace function public.copy_deck(p_set_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_set    public.study_sets%rowtype;
  v_new_id uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_set from public.study_sets where id = p_set_id;
  if not found or (v_set.visibility = 'private' and v_set.owner_id <> v_uid) then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  insert into public.study_sets (owner_id, title, subject, description, color_key)
  values (v_uid, v_set.title, v_set.subject, v_set.description, v_set.color_key)
  returning id into v_new_id;

  insert into public.cards (set_id, position, kind, prompt, answer, explanation, distractors)
  select v_new_id, position, kind, prompt, answer, explanation, distractors
  from public.cards
  where set_id = p_set_id
  order by position, created_at;

  if v_set.owner_id <> v_uid then
    insert into public.deck_copies (set_id, copier_id)
    values (p_set_id, v_uid)
    on conflict do nothing;
  end if;

  return v_new_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- list_public_decks: same as 0014, plus copyCount and a sort.
-- p_sort is 'new' (default) or 'copied'.
-- -----------------------------------------------------------------------------
drop function if exists public.list_public_decks(text, integer);

create or replace function public.list_public_decks(
  p_query text default '',
  p_sort  text default 'new',
  p_limit integer default 24
)
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
             'id', t.id,
             'title', t.title,
             'subject', t.subject,
             'colorKey', t.color_key,
             'cardCount', t.card_count,
             'copyCount', t.copy_count,
             'ownerName', p.display_name,
             'isOwner', t.owner_id = v_uid)
           order by t.rn), '[]'::jsonb)
    from (
      select s.*,
             (select count(*)::int from public.deck_copies c where c.set_id = s.id) as copy_count,
             row_number() over (
               order by
                 case when p_sort = 'copied'
                      then (select count(*) from public.deck_copies c where c.set_id = s.id) end desc nulls last,
                 s.updated_at desc, s.id
             ) as rn
      from public.study_sets s
      where s.visibility = 'public'
        and s.card_count > 0
        and not private.deck_hidden(s.id)
        and not exists (
          select 1 from unnest(v_words) as w
          where lower(s.title || ' ' || coalesce(s.subject, '')) not like '%' || w || '%'
        )
      order by rn
      limit greatest(1, least(coalesce(p_limit, 24), 200))
    ) t
    join public.profiles p on p.id = t.owner_id
  );
end;
$$;

revoke all on function public.copy_deck(uuid)                       from public, anon;
revoke all on function public.list_public_decks(text, text, integer) from public, anon;
grant execute on function public.copy_deck(uuid)                       to authenticated;
grant execute on function public.list_public_decks(text, text, integer) to authenticated;

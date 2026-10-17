-- =============================================================================
-- Kwest · 0013_explore_decks.sql
-- Explore: a list of decks their owners made public (visibility 'public').
-- Public decks also work by link like 'unlisted' ones (see 0011), so viewing and
-- copying them reuses get_shared_deck and copy_deck. Safe to run again.
-- =============================================================================

create index if not exists study_sets_public_idx
  on public.study_sets (updated_at desc)
  where visibility = 'public';

-- -----------------------------------------------------------------------------
-- list_public_decks: public decks with at least one card, newest first.
-- p_query matches words in the title or subject (all words must match).
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

revoke all on function public.list_public_decks(text, integer) from public, anon;
grant execute on function public.list_public_decks(text, integer) to authenticated;

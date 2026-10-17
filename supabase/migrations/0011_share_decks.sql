-- =============================================================================
-- Kwest · 0011_share_decks.sql
-- Share a deck with a link. The owner turns sharing on (visibility 'unlisted');
-- anyone signed in who has the link can see the cards and copy the deck into
-- their own decks. Turning sharing off (visibility 'private') stops the link.
--
-- RLS on study_sets and cards stays "own rows only". Shared decks are read and
-- copied through the security definer functions below. 'public' is treated
-- like 'unlisted' here; there is no public deck list yet.
-- =============================================================================

-- Owners change sharing with a plain update (the "update own" policy applies).
grant update (visibility) on public.study_sets to authenticated;

-- -----------------------------------------------------------------------------
-- get_shared_deck: a shared deck and its cards, or null if it doesn't exist or
-- isn't shared. Owners always see their own deck.
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
-- copy_deck: copy a shared deck (or your own) into your decks. Returns the new
-- deck's id. The copy is private and starts with no study progress.
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

  return v_new_id;
end;
$$;

revoke all on function public.get_shared_deck(uuid) from public, anon;
revoke all on function public.copy_deck(uuid)       from public, anon;
grant execute on function public.get_shared_deck(uuid) to authenticated;
grant execute on function public.copy_deck(uuid)       to authenticated;

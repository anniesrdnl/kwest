-- =============================================================================
-- Kwest · 0006_save_deck.sql
-- Save a deck and all its cards in one step. Run after 0005.
--
-- Why one function: saving can add, change, reorder and delete many cards.
-- Inside one function it all happens in one transaction, so a save either
-- finishes completely or changes nothing (no half-saved decks).
--
-- security invoker: runs as the signed-in user, so Row Level Security and the
-- column permissions from 0003 still apply. It can't do anything the user
-- couldn't already do with normal requests.
-- =============================================================================

-- p_deck_id: null to create a new deck, or the id of a deck to update.
-- p_cards:   ordered JSON array of
--            {"id": uuid|null, "kind": "term"|"question", "prompt": text,
--             "answer": text, "explanation": text|null}
--            Cards with an id are updated; cards without one are added;
--            the deck's other cards are deleted. Order = array order.
create or replace function public.save_deck(
  p_deck_id     uuid,
  p_title       text,
  p_subject     text,
  p_description text,
  p_color_key   text,
  p_cards       jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_deck_id uuid;
  v_card    jsonb;
  v_pos     integer := 0;
  v_keep    uuid[];
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_cards is null or jsonb_typeof(p_cards) <> 'array' then
    raise exception 'invalid_input' using errcode = '22023', detail = 'cards';
  end if;
  if jsonb_array_length(p_cards) > 500 then
    raise exception 'set_full' using errcode = 'P0001';
  end if;

  if p_deck_id is null then
    insert into public.study_sets (title, subject, description, color_key)
    values (p_title, nullif(p_subject, ''), nullif(p_description, ''), p_color_key)
    returning id into v_deck_id;
  else
    update public.study_sets
       set title = p_title,
           subject = nullif(p_subject, ''),
           description = nullif(p_description, ''),
           color_key = p_color_key
     where id = p_deck_id
    returning id into v_deck_id;
    if v_deck_id is null then
      raise exception 'not_found' using errcode = 'P0002', detail = 'deck';
    end if;
  end if;

  -- Delete cards that are no longer in the list (first, so the 500 limit counts correctly).
  select coalesce(array_agg((c ->> 'id')::uuid), '{}')
    into v_keep
    from jsonb_array_elements(p_cards) c
   where c ->> 'id' is not null;
  delete from public.cards where set_id = v_deck_id and not (id = any (v_keep));

  for v_card in select value from jsonb_array_elements(p_cards) loop
    v_pos := v_pos + 1;
    if v_card ->> 'id' is not null then
      update public.cards
         set position    = v_pos,
             kind        = (v_card ->> 'kind')::public.card_kind,
             prompt      = v_card ->> 'prompt',
             answer      = v_card ->> 'answer',
             explanation = nullif(v_card ->> 'explanation', '')
       where id = (v_card ->> 'id')::uuid and set_id = v_deck_id;
      if not found then
        raise exception 'not_found' using errcode = 'P0002', detail = 'card';
      end if;
    else
      insert into public.cards (set_id, position, kind, prompt, answer, explanation)
      values (v_deck_id, v_pos, (v_card ->> 'kind')::public.card_kind,
              v_card ->> 'prompt', v_card ->> 'answer', nullif(v_card ->> 'explanation', ''));
    end if;
  end loop;

  return v_deck_id;
end;
$$;

revoke all on function public.save_deck(uuid, text, text, text, text, jsonb) from public, anon;
grant execute on function public.save_deck(uuid, text, text, text, text, jsonb) to authenticated;

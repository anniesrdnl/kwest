import "server-only";
import { cache } from "react";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { CardKind, PublicDeck, SetVisibility, SharedDeck } from "@/lib/types/database";

export type Deck = {
  id: string;
  title: string;
  subject: string | null;
  colorKey: string;
  cardCount: number;
  lastStudiedAt: string | null;
  /** Studied cards that are due for review now. */
  due: number;
  /** Cards never studied yet. */
  fresh: number;
  /** Earliest upcoming review, when nothing is due now. */
  nextDueAt: string | null;
  /** private: only the owner. unlisted: anyone with the link. public: also listed in Explore. */
  visibility: SetVisibility;
  /** Anyone with the link can see and copy it (unlisted or public). */
  shared: boolean;
};

/** The player's decks with review counts, most recently studied first. */
export const getDecks = cache(async (): Promise<Deck[]> => {
  await requireUser();
  const supabase = await createClient();

  const [sets, reviews] = await Promise.all([
    supabase
      .from("study_sets")
      .select("id, title, subject, color_key, card_count, last_studied_at, visibility")
      .order("last_studied_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false }),
    supabase.rpc("deck_dust"),
  ]);
  if (sets.error) throw new Error(`Could not load decks: ${sets.error.message}`);
  if (reviews.error) throw new Error(`Could not load review counts: ${reviews.error.message}`);

  const reviewsBySet = new Map(reviews.data.map((row) => [row.set_id, row]));
  return sets.data.map((set) => {
    const d = reviewsBySet.get(set.id);
    return {
      id: set.id,
      title: set.title,
      subject: set.subject,
      colorKey: set.color_key,
      cardCount: set.card_count,
      lastStudiedAt: set.last_studied_at,
      due: d?.due_count ?? 0,
      fresh: d?.new_count ?? 0,
      nextDueAt: d?.next_due_at ?? null,
      visibility: set.visibility,
      shared: set.visibility !== "private",
    };
  });
});

export type DeckCard = {
  id: string;
  kind: CardKind;
  prompt: string;
  answer: string;
  explanation: string | null;
};

export type DeckDetail = Deck & { description: string | null; cards: DeckCard[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One deck with its cards in order, or null if it doesn't exist or isn't the player's. */
export const getDeck = cache(async (id: string): Promise<DeckDetail | null> => {
  if (!UUID.test(id)) return null;
  await requireUser();
  const supabase = await createClient();

  const [decks, set, cards] = await Promise.all([
    getDecks(),
    supabase.from("study_sets").select("description").eq("id", id).maybeSingle(),
    supabase
      .from("cards")
      .select("id, kind, prompt, answer, explanation")
      .eq("set_id", id)
      .order("position")
      .order("created_at"),
  ]);
  if (set.error) throw new Error(`Could not load deck: ${set.error.message}`);
  if (cards.error) throw new Error(`Could not load cards: ${cards.error.message}`);

  const deck = decks.find((d) => d.id === id);
  if (!deck || !set.data) return null;
  return { ...deck, description: set.data.description, cards: cards.data };
});

/** A deck someone shared by link (or your own), or null if it isn't shared. */
export const getSharedDeck = cache(async (id: string): Promise<SharedDeck | null> => {
  if (!UUID.test(id)) return null;
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_deck", { p_set_id: id });
  if (error) throw new Error(`Could not load shared deck: ${error.message}`);
  return (data as unknown as SharedDeck | null) ?? null;
});

/** Public decks for Explore, newest first. `query` matches words in the title or subject. */
export async function listPublicDecks(query: string): Promise<PublicDeck[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_public_decks", { p_query: query.slice(0, 100) });
  if (error) throw new Error(`Could not load public decks: ${error.message}`);
  return data as unknown as PublicDeck[];
}

/** Owner only: true when reports have hidden this deck from Explore. */
export async function isHiddenFromExplore(id: string): Promise<boolean> {
  if (!UUID.test(id)) return false;
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("deck_hidden_from_explore", { p_set_id: id });
  if (error) throw new Error(`Could not load deck status: ${error.message}`);
  return Boolean(data);
}

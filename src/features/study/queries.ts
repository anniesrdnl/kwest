import "server-only";
import { getDeck, type DeckDetail } from "@/features/decks/queries";
import { createClient } from "@/lib/supabase/server";
import type { StudyCard } from "./logic";

export type StudyDeck = { deck: DeckDetail; cards: StudyCard[] };

/** A deck's cards with the player's progress on each, or null if the deck isn't theirs. */
export async function getStudyDeck(id: string): Promise<StudyDeck | null> {
  // One round trip, not two: progress is asked for while the deck loads. A bad id makes the
  // progress query fail, but then getDeck gives null, so that error is only used for real decks.
  const supabase = await createClient();
  const [deck, { data, error }] = await Promise.all([
    getDeck(id),
    supabase.from("card_progress").select("card_id, box, due_at, recent_wrong").eq("set_id", id),
  ]);
  if (!deck) return null;
  if (error) throw new Error(`Could not load progress: ${error.message}`);

  const progress = new Map(data.map((p) => [p.card_id, p]));
  const cards = deck.cards.map((c): StudyCard => {
    const p = progress.get(c.id);
    return {
      id: c.id,
      kind: c.kind,
      prompt: c.prompt,
      answer: c.answer,
      explanation: c.explanation,
      box: p?.box ?? null,
      dueAt: p?.due_at ?? null,
      recentWrong: p?.recent_wrong ?? 0,
    };
  });
  return { deck, cards };
}

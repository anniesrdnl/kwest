import "server-only";
import { getDeck, type DeckDetail } from "@/features/decks/queries";
import { createClient } from "@/lib/supabase/server";
import type { StudyCard } from "./logic";

export type StudyDeck = { deck: DeckDetail; cards: StudyCard[] };

/** A deck's cards with the player's progress on each, or null if the deck isn't theirs. */
export async function getStudyDeck(id: string): Promise<StudyDeck | null> {
  const deck = await getDeck(id);
  if (!deck) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("card_progress")
    .select("card_id, box, due_at, recent_wrong")
    .eq("set_id", id);
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

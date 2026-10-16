import "server-only";
import { cache } from "react";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type Deck = {
  id: string;
  title: string;
  subject: string | null;
  colorKey: string;
  cardCount: number;
  lastStudiedAt: string | null;
  /** Reviewed cards whose review is due now ("dust"). */
  due: number;
  /** Cards never studied yet. */
  fresh: number;
  /** Earliest upcoming review, when nothing is due now. */
  nextDueAt: string | null;
};

/** The player's decks with dust counts, most recently studied first. */
export const getDecks = cache(async (): Promise<Deck[]> => {
  await requireUser();
  const supabase = await createClient();

  const [sets, dust] = await Promise.all([
    supabase
      .from("study_sets")
      .select("id, title, subject, color_key, card_count, last_studied_at")
      .order("last_studied_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false }),
    supabase.rpc("deck_dust"),
  ]);
  if (sets.error) throw new Error(`Could not load decks: ${sets.error.message}`);
  if (dust.error) throw new Error(`Could not load review counts: ${dust.error.message}`);

  const dustBySet = new Map(dust.data.map((row) => [row.set_id, row]));
  return sets.data.map((set) => {
    const d = dustBySet.get(set.id);
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
    };
  });
});

import "server-only";
import { getPlayer, type Player } from "@/features/profile/queries";
import { getDecks, type Deck } from "@/features/decks/queries";
import { createClient } from "@/lib/supabase/server";
import { localDate } from "@/lib/time";

/** Rough pace for the "~M min" estimate: one card every 10 seconds. */
const SECONDS_PER_CARD = 10;

export type NextUp = { deck: Deck; cards: number; minutes: number };

export type Lantern = { reviewed: number; goal: number; lit: boolean };

export type Dashboard = {
  player: Player;
  decks: Deck[];
  /** Deck with the most due + new cards, or null when nothing needs attention. */
  nextUp: NextUp | null;
  lantern: Lantern;
};

export function pickNextUp(decks: Deck[]): NextUp | null {
  let best: Deck | null = null;
  for (const deck of decks) {
    const score = deck.due + deck.fresh;
    if (score === 0) continue;
    // Most cards wins; ties go to the one with more dust (reviews before new cards).
    if (!best || score > best.due + best.fresh || (score === best.due + best.fresh && deck.due > best.due)) {
      best = deck;
    }
  }
  if (!best) return null;
  const cards = best.due + best.fresh;
  return { deck: best, cards, minutes: Math.max(1, Math.ceil((cards * SECONDS_PER_CARD) / 60)) };
}

export async function getDashboard(): Promise<Dashboard> {
  const player = await getPlayer();
  const supabase = await createClient();
  const today = localDate(player.profile.timezone);

  const [decks, activity] = await Promise.all([
    getDecks(),
    supabase.from("daily_activity").select("cards_reviewed, goal_met").eq("user_id", player.id).eq("day", today).maybeSingle(),
  ]);
  if (activity.error) throw new Error(`Could not load today's activity: ${activity.error.message}`);

  const goal = player.stats.daily_goal;
  const reviewed = activity.data?.cards_reviewed ?? 0;

  return {
    player,
    decks,
    nextUp: pickNextUp(decks),
    lantern: { reviewed, goal, lit: Boolean(activity.data?.goal_met) || reviewed >= goal },
  };
}

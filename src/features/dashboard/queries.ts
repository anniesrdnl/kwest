import "server-only";
import { requireUser } from "@/lib/auth/session";
import { getPlayer, type Player } from "@/features/profile/queries";
import { getDecks, type Deck } from "@/features/decks/queries";
import { createClient } from "@/lib/supabase/server";
import { localDate } from "@/lib/time";

/** Rough pace for the "~M min" estimate: one card every 10 seconds. */
const SECONDS_PER_CARD = 10;

export type NextUp = { deck: Deck; cards: number; minutes: number };

/** Today's cards reviewed (player's time zone) against player_stats.daily_goal. */
export type DailyGoal = { reviewed: number; goal: number; met: boolean };

export type Dashboard = {
  player: Player;
  decks: Deck[];
  /** Deck with the most due + new cards, or null when nothing needs attention. */
  nextUp: NextUp | null;
  dailyGoal: DailyGoal;
};

export function pickNextUp(decks: Deck[]): NextUp | null {
  let best: Deck | null = null;
  for (const deck of decks) {
    const score = deck.due + deck.fresh;
    if (score === 0) continue;
    // Most cards wins; ties go to the one with more reviews due (before new cards).
    if (!best || score > best.due + best.fresh || (score === best.due + best.fresh && deck.due > best.due)) {
      best = deck;
    }
  }
  if (!best) return null;
  const cards = best.due + best.fresh;
  return { deck: best, cards, minutes: Math.max(1, Math.ceil((cards * SECONDS_PER_CARD) / 60)) };
}

export async function getDashboard(): Promise<Dashboard> {
  const user = await requireUser();
  const supabase = await createClient();

  // One round trip, not two: the player's own "today" depends on their time zone, which is
  // not known yet. Every time zone is within a day of UTC, so ask for those three days and pick one after.
  const nearDays = [-1, 0, 1].map((offset) => localDate("UTC", new Date(Date.now() + offset * 86_400_000)));
  const [player, decks, activity] = await Promise.all([
    getPlayer(),
    getDecks(),
    supabase.from("daily_activity").select("day, cards_reviewed, goal_met").eq("user_id", user.id).in("day", nearDays),
  ]);
  if (activity.error) throw new Error(`Could not load today's activity: ${activity.error.message}`);

  const today = localDate(player.profile.timezone);
  const todays = activity.data.find((row) => row.day === today);
  const goal = player.stats.daily_goal;
  const reviewed = todays?.cards_reviewed ?? 0;

  return {
    player,
    decks,
    nextUp: pickNextUp(decks),
    dailyGoal: { reviewed, goal, met: Boolean(todays?.goal_met) || reviewed >= goal },
  };
}

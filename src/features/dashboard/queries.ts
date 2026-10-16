import "server-only";
import { getPlayer, type Player } from "@/features/profile/queries";
import { getTomes, type Tome } from "@/features/tomes/queries";
import { createClient } from "@/lib/supabase/server";
import { localDate } from "@/lib/time";

/** Rough pace for the "~M min" estimate: one card every 10 seconds. */
const SECONDS_PER_CARD = 10;

export type NextUp = { tome: Tome; cards: number; minutes: number };

export type Lantern = { reviewed: number; goal: number; lit: boolean };

export type Dashboard = {
  player: Player;
  tomes: Tome[];
  /** Tome with the most due + new cards, or null when nothing needs attention. */
  nextUp: NextUp | null;
  lantern: Lantern;
};

export function pickNextUp(tomes: Tome[]): NextUp | null {
  let best: Tome | null = null;
  for (const tome of tomes) {
    const score = tome.due + tome.fresh;
    if (score === 0) continue;
    // Most cards wins; ties go to the one with more dust (reviews before new cards).
    if (!best || score > best.due + best.fresh || (score === best.due + best.fresh && tome.due > best.due)) {
      best = tome;
    }
  }
  if (!best) return null;
  const cards = best.due + best.fresh;
  return { tome: best, cards, minutes: Math.max(1, Math.ceil((cards * SECONDS_PER_CARD) / 60)) };
}

export async function getDashboard(): Promise<Dashboard> {
  const player = await getPlayer();
  const supabase = await createClient();
  const today = localDate(player.profile.timezone);

  const [tomes, activity] = await Promise.all([
    getTomes(),
    supabase.from("daily_activity").select("cards_reviewed, goal_met").eq("user_id", player.id).eq("day", today).maybeSingle(),
  ]);
  if (activity.error) throw new Error(`Could not load today's activity: ${activity.error.message}`);

  const goal = player.stats.daily_goal;
  const reviewed = activity.data?.cards_reviewed ?? 0;

  return {
    player,
    tomes,
    nextUp: pickNextUp(tomes),
    lantern: { reviewed, goal, lit: Boolean(activity.data?.goal_met) || reviewed >= goal },
  };
}

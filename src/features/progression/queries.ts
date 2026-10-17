import "server-only";
import { getPlayer } from "@/features/profile/queries";
import { createClient } from "@/lib/supabase/server";
import { localDate } from "@/lib/time";

export type Achievement = {
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  earnedAt: string | null;
  /** Measurable progress toward a locked achievement, e.g. 42 of 100 cards. */
  progress: { value: number; target: number } | null;
  /** The feature that unlocks it isn't built yet. */
  comingLater: boolean;
};

export type DayActivity = { day: string; label: string; cards: number; goalMet: boolean; isToday: boolean };

export type ProgressOverview = {
  cardsReviewed: number;
  sessions: number;
  decksMastered: number;
  goalDays: number;
  week: DayActivity[];
  achievements: Achievement[];
};

// Achievements for features that don't exist yet (study game, room decorating).
const COMING_LATER = new Set(["dust_buster", "decorator"]);

/** Stats, the last 7 days and achievements for the profile page. */
export async function getProgressOverview(): Promise<ProgressOverview> {
  const { id, profile, stats } = await getPlayer();
  const supabase = await createClient();

  const [catalog, earned, activity, sessions, masteries] = await Promise.all([
    supabase.from("achievements").select("*").order("sort"),
    supabase.from("user_achievements").select("achievement_key, earned_at").eq("user_id", id),
    supabase.from("daily_activity").select("day, cards_reviewed, goal_met").eq("user_id", id),
    supabase.from("study_sessions").select("id", { count: "exact", head: true }).eq("user_id", id).eq("status", "completed"),
    supabase.from("set_masteries").select("set_id", { count: "exact", head: true }).eq("user_id", id),
  ]);
  for (const r of [catalog, earned, activity, sessions, masteries]) {
    if (r.error) throw new Error(`Could not load progress: ${r.error.message}`);
  }

  const days = activity.data ?? [];
  const cardsReviewed = days.reduce((sum, d) => sum + d.cards_reviewed, 0);
  const goalDays = days.filter((d) => d.goal_met).length;
  const byDay = new Map(days.map((d) => [d.day, d]));

  // The last 7 days in the player's time zone, oldest first.
  const today = localDate(profile.timezone);
  const week: DayActivity[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - (6 - i));
    const day = date.toISOString().slice(0, 10);
    const row = byDay.get(day);
    return {
      day,
      label: date.toLocaleDateString("en", { weekday: "short", timeZone: "UTC" }),
      cards: row?.cards_reviewed ?? 0,
      goalMet: row?.goal_met ?? false,
      isToday: i === 6,
    };
  });

  const earnedAt = new Map((earned.data ?? []).map((e) => [e.achievement_key, e.earned_at]));
  const progressFor = (key: string): Achievement["progress"] => {
    if (key === "cards_100") return { value: Math.min(cardsReviewed, 100), target: 100 };
    if (key === "lantern_7") return { value: Math.min(goalDays, 7), target: 7 };
    if (key === "level_5") return { value: Math.min(stats.level, 5), target: 5 };
    return null;
  };

  const achievements = (catalog.data ?? []).map(
    (a): Achievement => ({
      key: a.key,
      name: a.name,
      description: a.description,
      icon: a.icon_key,
      xpReward: a.xp_reward,
      coinReward: a.coin_reward,
      earnedAt: earnedAt.get(a.key) ?? null,
      progress: earnedAt.has(a.key) ? null : progressFor(a.key),
      comingLater: !earnedAt.has(a.key) && COMING_LATER.has(a.key),
    }),
  );

  return {
    cardsReviewed,
    sessions: sessions.count ?? 0,
    decksMastered: masteries.count ?? 0,
    goalDays,
    week,
    achievements,
  };
}

// Mirrors private.level_for_xp in supabase/migrations/0002_functions.sql.
// The database is the source of truth; this is for display only.

/** XP needed to go from `level` to `level + 1`. */
export function xpForNextLevel(level: number): number {
  return 100 + 25 * (level - 1);
}

/** Total XP required to reach `level`. */
export function totalXpForLevel(level: number): number {
  const steps = level - 1;
  return 100 * steps + (25 * steps * (steps - 1)) / 2;
}

export function levelForXp(xp: number): number {
  let level = 1;
  let remaining = Math.max(0, xp);
  while (remaining >= xpForNextLevel(level)) {
    remaining -= xpForNextLevel(level);
    level += 1;
  }
  return level;
}

export type LevelProgress = {
  level: number;
  xpIntoLevel: number;
  xpNeeded: number;
  /** 0–1 */
  ratio: number;
};

export function levelProgress(xpTotal: number): LevelProgress {
  const level = levelForXp(xpTotal);
  const xpIntoLevel = xpTotal - totalXpForLevel(level);
  const xpNeeded = xpForNextLevel(level);
  return { level, xpIntoLevel, xpNeeded, ratio: xpIntoLevel / xpNeeded };
}

const TITLES: ReadonlyArray<[minLevel: number, title: string]> = [
  [20, "Scholar"],
  [15, "Senior Reader"],
  [10, "Knowledge Seeker"],
  [5, "Study Explorer"],
  [1, "New Student"],
];

export function titleForLevel(level: number): string {
  return TITLES.find(([min]) => level >= min)?.[1] ?? "New Student";
}

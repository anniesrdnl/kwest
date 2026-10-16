import { levelProgress, titleForLevel } from "@/lib/game/levels";

/** Level and a thin progress bar toward the next level. */
export function XpBar({ xpTotal, compact = false }: { xpTotal: number; compact?: boolean }) {
  const { level, xpIntoLevel, xpNeeded, ratio } = levelProgress(xpTotal);

  const bar = (
    <div
      role="progressbar"
      aria-label={`Level ${level} progress`}
      aria-valuemin={0}
      aria-valuemax={xpNeeded}
      aria-valuenow={xpIntoLevel}
      aria-valuetext={`${xpIntoLevel} of ${xpNeeded} XP to level ${level + 1}`}
      className={`h-2 overflow-hidden rounded-full bg-surface-2 ${compact ? "w-16" : "w-full"}`}
    >
      <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(ratio * 100)}%` }} />
    </div>
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium whitespace-nowrap">Level {level}</span>
        {bar}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-semibold">
          Level {level} <span className="font-normal text-text-muted">· {titleForLevel(level)}</span>
        </span>
        <span className="text-sm text-text-muted tabular-nums">
          {xpIntoLevel} / {xpNeeded} XP
        </span>
      </div>
      {bar}
    </div>
  );
}

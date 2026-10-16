import { levelProgress, titleForLevel } from "@/lib/game/levels";

const SEGMENTS = 10;

/** Segmented XP bar. Shows level, title and XP toward the next level. */
export function XpBar({ xpTotal, compact = false }: { xpTotal: number; compact?: boolean }) {
  const { level, xpIntoLevel, xpNeeded, ratio } = levelProgress(xpTotal);
  const filled = Math.floor(ratio * SEGMENTS);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="font-pixel text-sm whitespace-nowrap">Lv {level}</span>
      <div
        role="progressbar"
        aria-label={`Level ${level} progress`}
        aria-valuemin={0}
        aria-valuemax={xpNeeded}
        aria-valuenow={xpIntoLevel}
        aria-valuetext={`${xpIntoLevel} of ${xpNeeded} XP to level ${level + 1}`}
        className="flex gap-0.5"
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={`h-3 w-2.5 ${i < filled ? "bg-accent" : "bg-surface-2"} pixel-border`} />
        ))}
      </div>
      {!compact && (
        <span className="text-sm text-text-muted">
          {titleForLevel(level)} · {xpIntoLevel}/{xpNeeded} XP
        </span>
      )}
    </div>
  );
}

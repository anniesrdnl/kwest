import { PixelBar } from "@/components/ui/pixel-bar";
import { levelProgress, titleForLevel } from "@/lib/game/levels";

/** Level and a block progress bar toward the next level. */
export function XpBar({ xpTotal, compact = false }: { xpTotal: number; compact?: boolean }) {
  const { level, xpIntoLevel, xpNeeded, ratio } = levelProgress(xpTotal);

  const bar = (
    <PixelBar
      ratio={ratio}
      label={`Level ${level} progress`}
      max={xpNeeded}
      now={xpIntoLevel}
      valueText={`${xpIntoLevel} of ${xpNeeded} XP to level ${level + 1}`}
      segments={compact ? 5 : 10}
      size={compact ? "sm" : "md"}
      animate={!compact}
      className={compact ? "w-16" : "w-full"}
    />
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-display text-base whitespace-nowrap">Level {level}</span>
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

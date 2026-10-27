import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PixelIcon } from "@/components/brand/pixel";
import { PixelBar } from "@/components/ui/pixel-bar";
import { levelProgress, titleForLevel } from "@/lib/game/levels";
import type { DailyGoal } from "../queries";

/**
 * A stat tile that opens the page where you can act on it. It rises in after `delay` seconds,
 * tints on hover (an arrow slides in) and sinks a little when pressed.
 */
function Tile({ href, label, delay, children }: { href: string; label: string; delay: number; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rise group block transition-[translate] duration-150 active:translate-y-0.5"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="pixel-lift h-full">
        <div className="pixel-frame h-full space-y-3 p-5 group-hover:[--frame-bg:var(--accent-soft)]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-text-muted">{label}</p>
            <ArrowRight
              size={16}
              aria-hidden
              className="-translate-x-1 text-text-muted opacity-0 transition-[opacity,translate] duration-150 group-hover:translate-x-0 group-hover:opacity-100"
            />
          </div>
          {children}
        </div>
      </div>
    </Link>
  );
}

/** Cards reviewed today against the daily goal. Missing a day resets nothing. */
export function GoalTile({ dailyGoal, delay }: { dailyGoal: DailyGoal; delay: number }) {
  const { reviewed, goal, met } = dailyGoal;
  const ratio = met ? 1 : Math.min(reviewed, goal) / goal;

  return (
    <Tile href="/profile#settings-heading" label="Daily goal" delay={delay}>
      <p className="flex items-baseline gap-2">
        <span className="font-display text-[2rem] leading-none tabular-nums">{reviewed}</span>
        <span className="text-text-muted">/ {goal} cards today</span>
      </p>
      <PixelBar
        animate
        ratio={ratio}
        label="Daily goal"
        max={goal}
        now={Math.min(reviewed, goal)}
        valueText={met ? `Goal reached: ${reviewed} cards today` : `${reviewed} of ${goal} cards today`}
      />
      {met ? (
        <p className="inline-flex items-center gap-1.5 bg-secondary px-2 py-0.5 font-display text-base text-secondary-fg">
          <PixelIcon name="check" scale={2} />
          Goal reached
        </p>
      ) : (
        <p className="text-sm text-text-muted">Missing a day is fine. Nothing resets.</p>
      )}
    </Tile>
  );
}

/** Level, its title and XP toward the next level. */
export function LevelTile({ xpTotal, delay }: { xpTotal: number; delay: number }) {
  const { level, xpIntoLevel, xpNeeded, ratio } = levelProgress(xpTotal);

  return (
    <Tile href="/profile" label="Level" delay={delay}>
      <p className="flex items-baseline gap-2">
        <span className="font-display text-[2rem] leading-none">LV {level}</span>
        <span className="text-text-muted">{titleForLevel(level)}</span>
      </p>
      <PixelBar
        animate
        ratio={ratio}
        label={`Level ${level} progress`}
        max={xpNeeded}
        now={xpIntoLevel}
        valueText={`${xpIntoLevel} of ${xpNeeded} XP to level ${level + 1}`}
      />
      <p className="text-sm text-text-muted tabular-nums">
        {xpIntoLevel} / {xpNeeded} XP
      </p>
    </Tile>
  );
}

/** Coins to spend in the shop. */
export function CoinsTile({ coins, delay }: { coins: number; delay: number }) {
  return (
    <Tile href="/shop" label="Coins" delay={delay}>
      <p className="flex items-center gap-3">
        <PixelIcon name="coin" scale={4} className="bob-sm text-gold" />
        <span className="font-display text-[2rem] leading-none tabular-nums">{coins}</span>
      </p>
      <p className="text-sm text-text-muted">Spend them on avatar icons, colors and frames.</p>
    </Tile>
  );
}

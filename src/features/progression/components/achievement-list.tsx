import {
  Compass,
  Footprints,
  Layers,
  Library,
  Medal,
  Star,
  Swords,
  Target,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PixelIcon } from "@/components/brand/pixel";
import { PixelBar } from "@/components/ui/pixel-bar";
import type { Achievement } from "../queries";

const ICONS: Record<string, LucideIcon> = {
  "badge-tome": Layers,
  "badge-steps": Footprints,
  "badge-star": Star,
  "badge-broom": Swords,
  "badge-gold": Medal,
  "badge-rival": Users,
  "badge-compass": Compass,
  "badge-stack": Library,
  "badge-lantern": Target,
};

/** All achievements in one soft frame. Earned ones have a blush icon; locked ones show a lock. */
export function AchievementList({ achievements, timeZone }: { achievements: Achievement[]; timeZone: string }) {
  const earnedCount = achievements.filter((a) => a.earnedAt).length;
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric", timeZone });
    } catch {
      return new Date(iso).toDateString();
    }
  };

  return (
    <section aria-labelledby="achievements-heading" className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="achievements-heading" className="text-2xl">
          Achievements
        </h2>
        <span className="text-sm text-text-muted tabular-nums">
          {earnedCount} of {achievements.length}
        </span>
      </div>
      <div className="pixel-lift">
        <ul className="pixel-frame divide-y-2 divide-border">
          {achievements.map((a) => {
            const Icon = ICONS[a.icon] ?? Trophy;
            const earned = Boolean(a.earnedAt);
            return (
              <li key={a.key} className="group flex gap-3 p-4 transition-colors duration-150 hover:bg-accent-soft">
                <span
                  className={`inline-flex size-12 shrink-0 items-center justify-center transition-[translate,background-color] duration-150 group-hover:-translate-y-0.5 ${
                    earned ? "bg-accent text-accent-fg group-hover:bg-accent-hover" : "bg-surface-2 text-text-muted group-hover:bg-track"
                  }`}
                >
                  {earned ? <Icon size={22} aria-hidden /> : <PixelIcon name="lock" scale={3} />}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium">
                    {a.name}
                    <span className="sr-only">{earned ? " (earned)" : " (locked)"}</span>
                  </p>
                  <p className="text-sm text-text-muted">{a.description}</p>
                  {earned ? (
                    <p className="text-xs font-medium text-accent-ink">Earned {formatDate(a.earnedAt!)}</p>
                  ) : a.comingLater ? (
                    <p className="text-xs font-medium text-text-muted">Coming in a later update</p>
                  ) : (
                    <>
                      {a.progress && (
                        <div className="flex items-center gap-2 pt-1">
                          <PixelBar
                            ratio={a.progress.value / a.progress.target}
                            label={`${a.name} progress`}
                            max={a.progress.target}
                            now={a.progress.value}
                            segments={Math.min(a.progress.target, 10)}
                            size="sm"
                            className="max-w-48 flex-1"
                          />
                          <span className="text-xs text-text-muted tabular-nums">
                            {a.progress.value}/{a.progress.target}
                          </span>
                        </div>
                      )}
                      {(a.xpReward > 0 || a.coinReward > 0) && (
                        <p className="text-xs text-text-muted">
                          Reward: {[a.xpReward > 0 && `+${a.xpReward} XP`, a.coinReward > 0 && `+${a.coinReward} coins`].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

import {
  Compass,
  Footprints,
  Layers,
  Library,
  Lock,
  Medal,
  Sprout,
  Star,
  Swords,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { Achievement } from "../queries";

const ICONS: Record<string, LucideIcon> = {
  "badge-tome": Layers,
  "badge-steps": Footprints,
  "badge-star": Star,
  "badge-broom": Swords,
  "badge-gold": Medal,
  "badge-plant": Sprout,
  "badge-compass": Compass,
  "badge-stack": Library,
  "badge-lantern": Target,
};

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
    <section aria-labelledby="achievements-heading" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="achievements-heading" className="text-lg font-semibold">
          Achievements
        </h2>
        <span className="text-sm text-text-muted tabular-nums">
          {earnedCount} of {achievements.length}
        </span>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {achievements.map((a) => {
          const Icon = ICONS[a.icon] ?? Trophy;
          const earned = Boolean(a.earnedAt);
          return (
            <li key={a.key} className={`flex gap-3 rounded-xl border p-4 ${earned ? "border-hero-border bg-hero" : "border-border bg-surface"}`}>
              <span
                className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${
                  earned ? "bg-secondary text-secondary-fg" : "bg-surface-2 text-text-muted"
                }`}
              >
                {earned ? <Icon size={22} aria-hidden /> : <Lock size={18} aria-hidden />}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold">
                  {a.name}
                  <span className="sr-only">{earned ? " (earned)" : " (locked)"}</span>
                </p>
                <p className="text-sm text-text-muted">{a.description}</p>
                {earned ? (
                  <p className="text-xs font-medium text-hero-muted">Earned {formatDate(a.earnedAt!)}</p>
                ) : a.comingLater ? (
                  <p className="text-xs font-medium text-text-muted">Coming in a later update</p>
                ) : (
                  <>
                    {a.progress && (
                      <div className="flex items-center gap-2 pt-1">
                        <div
                          role="progressbar"
                          aria-label={`${a.name} progress`}
                          aria-valuemin={0}
                          aria-valuemax={a.progress.target}
                          aria-valuenow={a.progress.value}
                          className="h-1.5 flex-1 overflow-hidden rounded-full bg-track"
                        >
                          <div className="h-full rounded-full bg-progress" style={{ width: `${(a.progress.value / a.progress.target) * 100}%` }} />
                        </div>
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
    </section>
  );
}

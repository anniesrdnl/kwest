import { PixelIcon } from "@/components/brand/pixel";
import type { DayActivity } from "../queries";

/**
 * Cards reviewed per day for the last 7 days (one series, so no legend).
 * Each bar has a hover/focus label; a visually hidden table carries the same data.
 */
export function WeekChart({ week, goal }: { week: DayActivity[]; goal: number }) {
  const max = Math.max(goal, ...week.map((d) => d.cards), 1);
  const total = week.reduce((s, d) => s + d.cards, 0);
  const goalTop = 100 - (goal / max) * 100;

  return (
    <figure className="space-y-3">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="font-display text-base">Last 7 days</span>
        <span className="text-sm text-text-muted tabular-nums">{total} cards</span>
      </figcaption>

      <div className="relative h-40" aria-hidden>
        {/* Daily goal reference line */}
        <div className="absolute inset-x-0 border-t-2 border-dashed border-border" style={{ top: `${goalTop}%` }}>
          <span className="absolute top-1 left-0 bg-surface pr-1 text-xs text-text-muted">Goal {goal}</span>
        </div>
        <div className="absolute inset-0 flex items-end gap-2">
          {week.map((d, i) => (
            <div key={d.day} className="group relative flex h-full flex-1 items-end justify-center">
              <div
                className={`w-full max-w-10 ${d.cards > 0 ? "pixel-block bg-accent" : "bg-track"}`}
                style={{ height: d.cards > 0 ? `${Math.max((d.cards / max) * 100, 3)}%` : "4px" }}
              />
              {/* Only rendered on hover, so it never widens the page; edge bars align inward. */}
              <span
                className={`pointer-events-none absolute -top-1 z-10 hidden -translate-y-full bg-text px-2 py-1 text-xs whitespace-nowrap text-bg group-hover:block ${
                  i === 0 ? "left-0" : i >= week.length - 2 ? "right-0" : "left-1/2 -translate-x-1/2"
                }`}
              >
                {d.cards} {d.cards === 1 ? "card" : "cards"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2" aria-hidden>
        {week.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-0.5 text-xs">
            <span className={d.isToday ? "font-medium text-text" : "text-text-muted"}>{d.isToday ? "Today" : d.label}</span>
            <span className="flex h-4 items-center text-correct">{d.goalMet && <PixelIcon name="check" scale={2} />}</span>
          </div>
        ))}
      </div>

      {/* Tables ignore sr-only sizing, so the wrapper hides it. */}
      <div className="sr-only">
      <table>
        <caption>Cards reviewed in the last 7 days. Daily goal: {goal} cards.</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Cards</th>
            <th scope="col">Goal reached</th>
          </tr>
        </thead>
        <tbody>
          {week.map((d) => (
            <tr key={d.day}>
              <th scope="row">{d.isToday ? "Today" : d.label}</th>
              <td>{d.cards}</td>
              <td>{d.goalMet ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}

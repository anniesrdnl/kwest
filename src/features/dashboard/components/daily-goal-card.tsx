import { PixelIcon } from "@/components/brand/pixel";
import { Panel } from "@/components/ui/panel";
import { PixelBar } from "@/components/ui/pixel-bar";
import type { DailyGoal } from "../queries";

/** Cards reviewed today against the daily goal. Missing a day resets nothing. */
export function DailyGoalCard({ dailyGoal }: { dailyGoal: DailyGoal }) {
  const { reviewed, goal, met } = dailyGoal;
  const ratio = met ? 1 : Math.min(reviewed, goal) / goal;

  return (
    <Panel title="Daily goal" aria-label="Daily goal">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums">{reviewed}</span>
            <span className="text-text-muted">/ {goal} cards today</span>
          </p>
          {met && (
            <span className="inline-flex items-center gap-1.5 bg-secondary px-2.5 py-1 font-pixel text-sm text-secondary-fg">
              <PixelIcon name="check" scale={2} />
              Goal reached
            </span>
          )}
        </div>
        <PixelBar
          ratio={ratio}
          label="Daily goal"
          max={goal}
          now={Math.min(reviewed, goal)}
          valueText={met ? `Goal reached: ${reviewed} cards today` : `${reviewed} of ${goal} cards today`}
        />
        <p className="text-sm text-text-muted">{met ? "Goal reached today. Nice work." : "Missing a day is fine. Nothing resets."}</p>
      </div>
    </Panel>
  );
}

import { CircleCheck } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import type { DailyGoal } from "../queries";

/** Cards reviewed today against the daily goal. Missing a day resets nothing. */
export function DailyGoalCard({ dailyGoal }: { dailyGoal: DailyGoal }) {
  const { reviewed, goal, met } = dailyGoal;
  const percent = met ? 100 : Math.round((Math.min(reviewed, goal) / goal) * 100);

  return (
    <Panel title="Daily goal" aria-label="Daily goal">
      <div className="space-y-3">
        <p className="flex items-center gap-2">
          {met && <CircleCheck size={20} className="text-correct" aria-hidden />}
          <span className="text-2xl font-semibold tabular-nums">{reviewed}</span>
          <span className="text-text-muted">/ {goal} cards today</span>
        </p>
        <div
          role="progressbar"
          aria-label="Daily goal"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={Math.min(reviewed, goal)}
          aria-valuetext={met ? `Goal reached: ${reviewed} cards today` : `${reviewed} of ${goal} cards today`}
          className="h-2 overflow-hidden rounded-full bg-surface-2"
        >
          <div className={`h-full rounded-full ${met ? "bg-correct" : "bg-accent"}`} style={{ width: `${percent}%` }} />
        </div>
        <p className="text-sm text-text-muted">{met ? "Goal reached today. Nice work." : "Missing a day is fine. Nothing resets."}</p>
      </div>
    </Panel>
  );
}

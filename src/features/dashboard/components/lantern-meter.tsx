import { Lantern } from "@/components/pixel/lantern";
import { Panel } from "@/components/ui/panel";
import type { Lantern as LanternData } from "../queries";

const SEGMENTS = 10;

/** Daily goal: cards reviewed today (player's time zone) against player_stats.daily_goal. */
export function LanternMeter({ lantern }: { lantern: LanternData }) {
  const { reviewed, goal, lit } = lantern;
  const filled = lit ? SEGMENTS : Math.floor((Math.min(reviewed, goal) / goal) * SEGMENTS);

  return (
    <Panel title="Lantern" aria-label="Lantern">
      <div className="flex items-center gap-4">
        <Lantern lit={lit} className="h-16 w-12 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-pixel">
            {lit ? "Lit for today" : `${reviewed} of ${goal} cards today`}
          </p>
          <div
            role="progressbar"
            aria-label="Daily goal"
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-valuenow={Math.min(reviewed, goal)}
            aria-valuetext={lit ? `Goal met: ${reviewed} cards reviewed today` : `${reviewed} of ${goal} cards reviewed today`}
            className="flex gap-0.5"
          >
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <span key={i} className={`h-3 flex-1 pixel-border ${i < filled ? "bg-accent" : "bg-surface-2"}`} />
            ))}
          </div>
          <p className="text-sm text-text-muted">
            {lit ? `${reviewed} cards reviewed. Rest easy.` : "Missing a day resets nothing."}
          </p>
        </div>
      </div>
    </Panel>
  );
}

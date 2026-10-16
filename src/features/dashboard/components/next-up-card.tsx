import { ArrowRight } from "lucide-react";
import { TomeSpine } from "@/components/pixel/tome-spine";
import { ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import type { Tome } from "@/features/tomes/queries";
import type { NextUp } from "../queries";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function NextUpCard({ nextUp }: { nextUp: NextUp }) {
  const { tome, minutes } = nextUp;
  const parts = [
    tome.due > 0 && `${plural(tome.due, "card")} gathering dust`,
    tome.fresh > 0 && (tome.due > 0 ? `${tome.fresh} new` : `${plural(tome.fresh, "new card")}`),
    `~${minutes} min`,
  ].filter(Boolean);

  return (
    <Panel title="Next up" aria-label="Next up">
      <div className="flex items-start gap-4">
        <TomeSpine colorKey={tome.colorKey} className="h-20 w-7 shrink-0" />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="font-pixel text-xl break-words">{tome.title}</p>
            <p className="text-text-muted">{parts.join(" · ")}</p>
          </div>
          {/* Study modes are Phase 9: this opens an honest "coming soon" page for now. */}
          <ButtonLink href="/play" size="lg" className="w-full sm:w-auto">
            Study now
            <ArrowRight size={18} aria-hidden />
          </ButtonLink>
          <p className="text-sm text-text-muted">Study sessions aren&apos;t open yet. This shows what&apos;s coming.</p>
        </div>
      </div>
    </Panel>
  );
}

/** Tomes exist but nothing is due or new. */
export function AllDustedCard({ tomes, timeZone }: { tomes: Tome[]; timeZone: string }) {
  const next = tomes
    .map((t) => t.nextDueAt)
    .filter((d): d is string => d !== null)
    .sort()[0];

  let nextLabel: string | null = null;
  if (next) {
    try {
      nextLabel = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", timeZone }).format(
        new Date(next),
      );
    } catch {
      nextLabel = new Date(next).toDateString();
    }
  }

  return (
    <Panel title="Next up" aria-label="Next up">
      <div className="space-y-1">
        <p className="font-pixel text-xl">All dusted</p>
        <p className="text-text-muted">Nothing needs reviewing right now.</p>
        {nextLabel && <p className="text-sm text-text-muted">Next review: {nextLabel}</p>}
      </div>
    </Panel>
  );
}

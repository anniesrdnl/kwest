import { ArrowRight } from "lucide-react";
import { DeckSpine } from "@/components/pixel/deck-spine";
import { ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import type { Deck } from "@/features/decks/queries";
import type { NextUp } from "../queries";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function NextUpCard({ nextUp }: { nextUp: NextUp }) {
  const { deck, minutes } = nextUp;
  const parts = [
    deck.due > 0 && `${plural(deck.due, "card")} gathering dust`,
    deck.fresh > 0 && (deck.due > 0 ? `${deck.fresh} new` : `${plural(deck.fresh, "new card")}`),
    `~${minutes} min`,
  ].filter(Boolean);

  return (
    <Panel title="Next up" aria-label="Next up">
      <div className="flex items-start gap-4">
        <DeckSpine colorKey={deck.colorKey} className="h-20 w-7 shrink-0" />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="font-pixel text-xl break-words">{deck.title}</p>
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

/** Decks exist but nothing is due or new. */
export function AllDustedCard({ decks, timeZone }: { decks: Deck[]; timeZone: string }) {
  const next = decks
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

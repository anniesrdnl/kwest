import { ArrowRight, CircleCheck, Layers } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { ButtonLink } from "@/components/ui/button";
import { addStarterDeck } from "@/features/decks/actions";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import type { Deck } from "@/features/decks/queries";
import type { NextUp } from "../queries";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The one main thing to do: the deck with the most cards to study. */
export function NextUpCard({ nextUp }: { nextUp: NextUp }) {
  const { deck, minutes } = nextUp;
  const parts = [
    deck.due > 0 && `${plural(deck.due, "card")} to review`,
    deck.fresh > 0 && (deck.due > 0 ? `${deck.fresh} new` : plural(deck.fresh, "new card")),
    `about ${minutes} min`,
  ].filter(Boolean);

  return (
    <NextUpShell>
      <div className="flex items-start gap-4">
        <DeckBadge title={deck.title} colorKey={deck.colorKey} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-xl font-semibold break-words">{deck.title}</p>
          <p className="text-text-muted">{parts.join(" · ")}</p>
        </div>
      </div>
      <div className="space-y-2">
        {/* Study modes are Phase 9: this opens an honest "coming soon" page for now. */}
        <ButtonLink href="/play" size="lg" className="w-full sm:w-auto">
          Study now
          <ArrowRight size={18} aria-hidden />
        </ButtonLink>
        <p className="text-sm text-text-muted">Studying isn&apos;t open yet. This button shows what&apos;s coming.</p>
      </div>
    </NextUpShell>
  );
}

/** Decks exist but nothing is due or new. */
export function AllCaughtUpCard({ decks, timeZone }: { decks: Deck[]; timeZone: string }) {
  const next = decks
    .map((d) => d.nextDueAt)
    .filter((d): d is string => d !== null)
    .sort()[0];

  let nextLabel: string | null = null;
  if (next) {
    try {
      nextLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric", timeZone }).format(
        new Date(next),
      );
    } catch {
      nextLabel = new Date(next).toDateString();
    }
  }

  return (
    <NextUpShell>
      <div className="flex items-start gap-4">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-xl bg-correct/10 text-correct">
          <CircleCheck size={28} aria-hidden />
        </span>
        <div>
          <p className="text-xl font-semibold">All caught up</p>
          <p className="text-text-muted">Nothing to review right now.</p>
          {nextLabel && <p className="text-sm text-text-muted">Next review: {nextLabel}</p>}
        </div>
      </div>
    </NextUpShell>
  );
}

/** A player with no decks yet. */
export function NoDecksCard() {
  return (
    <NextUpShell>
      <div className="flex items-start gap-4">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <Layers size={26} aria-hidden />
        </span>
        <div>
          <p className="text-xl font-semibold">No decks yet</p>
          <p className="text-text-muted">
            Start with a ready-made deck: How to Write a Research Paper. Making your own decks opens soon.
          </p>
        </div>
      </div>
      <ActionButton action={addStarterDeck} pendingLabel="Adding…">
        Add starter deck
      </ActionButton>
    </NextUpShell>
  );
}

function NextUpShell({ children }: { children: React.ReactNode }) {
  return (
    <section aria-labelledby="next-up-heading" className="h-full space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 id="next-up-heading" className="text-sm font-medium text-text-muted">
        Next up
      </h2>
      {children}
    </section>
  );
}

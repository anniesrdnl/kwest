import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Kip, PixelIcon, type KipMood } from "@/components/brand/pixel";
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
    <NextUpShell label="Today's quest" mood="happy">
      <div className="flex items-start gap-4">
        <DeckBadge title={deck.title} colorKey={deck.colorKey} size="lg" />
        <div className="min-w-0 flex-1">
          <Link href={`/decks/${deck.id}`} className="text-xl font-bold break-words decoration-2 underline-offset-4 hover:underline sm:text-2xl">
            {deck.title}
          </Link>
          <p className="text-hero-muted">{parts.join(" · ")}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/decks/${deck.id}/quiz`} variant="secondary" size="lg">
            Start review
            <ArrowRight size={18} aria-hidden />
          </ButtonLink>
          <ButtonLink href={`/decks/${deck.id}/flashcards`} variant="outline" size="lg">
            Flashcards
          </ButtonLink>
        </div>
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
    <NextUpShell label="Today's quest" mood="cheer">
      <div className="flex items-start gap-4">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-xl border border-hero-border bg-surface text-correct">
          <PixelIcon name="check" scale={4} />
        </span>
        <div>
          <p className="text-xl font-bold">All caught up</p>
          <p className="text-hero-muted">Nothing to review right now.</p>
          {nextLabel && <p className="text-sm text-hero-muted">Next review: {nextLabel}</p>}
        </div>
      </div>
    </NextUpShell>
  );
}

/** A player with no decks yet. */
export function NoDecksCard() {
  return (
    <NextUpShell label="Your first quest" mood="think">
      <div className="flex items-start gap-4">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-xl border border-hero-border bg-surface text-text">
          <PixelIcon name="decks" scale={3} />
        </span>
        <div>
          <p className="text-xl font-bold">No decks yet</p>
          <p className="text-hero-muted">
            Make your own deck, or start with a ready-made one: How to Write a Research Paper.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <ButtonLink href="/decks/new" variant="secondary">
          Make a deck
        </ButtonLink>
        <ActionButton action={addStarterDeck} appearance="outline" pendingLabel="Adding…">
          Add ready-made deck
        </ActionButton>
      </div>
    </NextUpShell>
  );
}

function NextUpShell({ label, mood, children }: { label: string; mood: KipMood; children: React.ReactNode }) {
  return (
    <div className="pixel-lift">
      <section
        aria-labelledby="next-up-heading"
        className="pixel-frame flex flex-col gap-4 p-6 text-hero-fg [--frame-bg:var(--hero)] sm:flex-row sm:items-center sm:gap-8 sm:p-8"
      >
        <div className="min-w-0 flex-1 space-y-5">
          <h2 id="next-up-heading" className="font-pixel text-base tracking-wide text-hero-muted">
            {label}
          </h2>
          {children}
        </div>
        <Kip mood={mood} scale={6} bob className="order-first shrink-0 self-start sm:order-last sm:self-center" />
      </section>
    </div>
  );
}

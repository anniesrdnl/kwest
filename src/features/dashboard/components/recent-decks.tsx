import Link from "next/link";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import type { Deck } from "@/features/decks/queries";

const SHOWN = 6;

function status(deck: Deck): string {
  if (deck.due > 0) return `${deck.due} to review`;
  if (deck.fresh > 0) return `${deck.fresh} new`;
  return "All caught up";
}

/** Most recently studied decks. */
export function RecentDecks({ decks }: { decks: Deck[] }) {
  return (
    <section aria-labelledby="recent-decks-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="recent-decks-heading" className="text-lg font-semibold">
          Recent decks
        </h2>
        <Link href="/decks" className="inline-flex min-h-11 items-center text-sm font-semibold underline decoration-progress decoration-2 underline-offset-4 hover:decoration-text">
          See all
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {decks.slice(0, SHOWN).map((deck) => (
          <li key={deck.id}>
            <Link
              href={`/decks/${deck.id}`}
              className="flex h-full items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors duration-150 hover:border-border-strong/60"
            >
              <DeckBadge title={deck.title} colorKey={deck.colorKey} />
              <div className="min-w-0">
                <p className="truncate font-medium">{deck.title}</p>
                <p className="text-sm text-text-muted">
                  {deck.cardCount} cards · {status(deck)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

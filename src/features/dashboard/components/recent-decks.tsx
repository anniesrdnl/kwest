import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import type { Deck } from "@/features/decks/queries";

const SHOWN = 6;

function status(deck: Deck): string {
  if (deck.due > 0) return `${deck.due} to review`;
  if (deck.fresh > 0) return `${deck.fresh} new`;
  return "All caught up";
}

/** Most recently studied decks. Cards rise in one after another, tint on hover and sink when pressed. */
export function RecentDecks({ decks }: { decks: Deck[] }) {
  return (
    <section aria-labelledby="recent-decks-heading" className="space-y-4">
      <div className="rise flex items-center justify-between gap-3" style={{ animationDelay: "0.5s" }}>
        <h2 id="recent-decks-heading" className="text-2xl">
          Recent decks
        </h2>
        <Link
          href="/decks"
          className="inline-flex min-h-11 items-center px-2 text-sm font-semibold underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:bg-track active:bg-accent"
        >
          See all
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decks.slice(0, SHOWN).map((deck, i) => (
          <li key={deck.id} className="rise" style={{ animationDelay: `${0.55 + i * 0.07}s` }}>
            <Link
              href={`/decks/${deck.id}`}
              className="group block h-full transition-[translate] duration-150 active:translate-y-0.5"
            >
              <div className="pixel-lift h-full">
                <div className="pixel-frame flex h-full items-center gap-3 p-4 group-hover:[--frame-bg:var(--accent-soft)]">
                  <DeckBadge
                    title={deck.title}
                    colorKey={deck.colorKey}
                    className="transition-transform duration-150 group-hover:-translate-y-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{deck.title}</p>
                    <p className="text-sm text-text-muted">
                      {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"} · {status(deck)}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    aria-hidden
                    className="-translate-x-1 text-text-muted opacity-0 transition-[opacity,translate] duration-150 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

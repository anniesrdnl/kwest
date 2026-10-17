import Link from "next/link";
import { DeckTile } from "@/features/decks/components/deck-tile";
import type { Deck } from "@/features/decks/queries";

const SHOWN = 6;

/** Most recently studied decks. Cards rise in one after another. */
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
            <DeckTile deck={deck} />
          </li>
        ))}
      </ul>
    </section>
  );
}

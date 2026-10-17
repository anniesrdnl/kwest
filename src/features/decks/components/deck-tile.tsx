import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Deck } from "../queries";
import { DeckBadge } from "./deck-badge";

/** One short line about what is waiting in a deck. */
export function deckStatus(deck: Deck): string {
  if (deck.due > 0) return `${deck.due} to review`;
  if (deck.fresh > 0) return `${deck.fresh} new`;
  return "All caught up";
}

/** A deck as a small pixel card. It tints on hover and sinks 2px when pressed. */
export function DeckTile({ deck, extra }: { deck: Deck; extra?: string }) {
  return (
    <Link href={`/decks/${deck.id}`} className="group block h-full transition-[translate] duration-150 active:translate-y-0.5">
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
              {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"} · {deckStatus(deck)}
              {extra}
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
  );
}

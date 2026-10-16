import Link from "next/link";
import { DeckSpine } from "@/components/pixel/deck-spine";
import { Panel } from "@/components/ui/panel";
import type { Deck } from "@/features/decks/queries";

const SHOWN = 12;

function status(deck: Deck): string {
  if (deck.due > 0) return `${deck.due} dusty`;
  if (deck.fresh > 0) return `${deck.fresh} new`;
  return "All dusted";
}

/** Horizontal row of deck spines, most recently studied first. */
export function RecentDecks({ decks }: { decks: Deck[] }) {
  return (
    <Panel
      title="Recent decks"
      actions={
        <Link href="/decks" className="inline-flex min-h-11 items-center px-2 font-pixel text-sm text-accent-ink underline underline-offset-4">
          All decks
        </Link>
      }
    >
      {/* Deck pages arrive with the editor (Phase 8), so spines aren't links yet. */}
      <ul
        className="flex snap-x gap-4 overflow-x-auto pb-2"
        tabIndex={0}
        aria-label="Recent decks, scrolls sideways"
      >
        {decks.slice(0, SHOWN).map((deck) => (
          <li key={deck.id} className="flex w-28 shrink-0 snap-start flex-col items-center gap-2 text-center">
            <DeckSpine colorKey={deck.colorKey} className="h-24 w-8" />
            <span className="line-clamp-2 text-sm">{deck.title}</span>
            <span className="font-pixel text-xs text-text-muted">{status(deck)}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import { getDecks, type Deck } from "@/features/decks/queries";

export const metadata: Metadata = { title: "Decks" };

function status(deck: Deck): string {
  if (deck.due > 0) return `${deck.due} to review`;
  if (deck.fresh > 0) return `${deck.fresh} new`;
  return "All caught up";
}

export default async function DecksPage() {
  const decks = await getDecks();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold md:text-3xl">Decks</h1>
        <ButtonLink href="/decks/new">
          <Plus size={18} aria-hidden />
          New deck
        </ButtonLink>
      </div>

      {decks.length === 0 ? (
        <div className="space-y-4 rounded-2xl border border-dashed border-border-strong/50 p-10 text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
            <Layers size={24} aria-hidden />
          </span>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">No decks yet</h2>
            <p className="text-text-muted">A deck is a set of flashcards about one topic. Make your first one.</p>
          </div>
          <ButtonLink href="/decks/new">Make a deck</ButtonLink>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <li key={deck.id}>
              <Link
                href={`/decks/${deck.id}`}
                className="flex h-full items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong/50"
              >
                <DeckBadge title={deck.title} colorKey={deck.colorKey} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{deck.title}</p>
                  <p className="text-sm text-text-muted">
                    {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"} · {status(deck)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

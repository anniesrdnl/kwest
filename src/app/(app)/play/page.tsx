import type { Metadata } from "next";
import Link from "next/link";
import { Layers, ListChecks } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import { getDecks, type Deck } from "@/features/decks/queries";

export const metadata: Metadata = { title: "Study" };

function waiting(deck: Deck): string {
  const parts = [deck.due > 0 && `${deck.due} to review`, deck.fresh > 0 && `${deck.fresh} new`].filter(Boolean);
  return parts.length ? parts.join(" · ") : "All caught up";
}

/** Pick a deck and a way to study it. Decks with the most waiting cards come first. */
export default async function StudyPage() {
  const decks = (await getDecks())
    .filter((d) => d.cardCount > 0)
    .sort((a, b) => b.due + b.fresh - (a.due + a.fresh));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold md:text-3xl">Study</h1>
        <p className="text-text-muted">
          <strong className="font-semibold text-text">Quiz</strong> moves cards to a later review when you get them right.{" "}
          <strong className="font-semibold text-text">Flashcards</strong> are for learning new cards.
        </p>
      </div>

      {decks.length === 0 ? (
        <div className="space-y-4 rounded-2xl border border-dashed border-border-strong/50 p-10 text-center">
          <h2 className="text-lg font-semibold">Nothing to study yet</h2>
          <p className="text-text-muted">Make a deck with a few cards first.</p>
          <ButtonLink href="/decks/new">Make a deck</ButtonLink>
        </div>
      ) : (
        <ul className="space-y-3">
          {decks.map((deck) => (
            <li
              key={deck.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link href={`/decks/${deck.id}`} className="flex min-w-0 items-center gap-3 hover:underline">
                <DeckBadge title={deck.title} colorKey={deck.colorKey} />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{deck.title}</span>
                  <span className="block text-sm text-text-muted">{waiting(deck)}</span>
                </span>
              </Link>
              <div className="grid shrink-0 grid-cols-2 gap-2">
                <ButtonLink href={`/decks/${deck.id}/quiz`} aria-label={`Quiz: ${deck.title}`}>
                  <ListChecks size={18} aria-hidden />
                  Quiz
                </ButtonLink>
                <ButtonLink href={`/decks/${deck.id}/flashcards`} variant="secondary" aria-label={`Flashcards: ${deck.title}`}>
                  <Layers size={18} aria-hidden />
                  Flashcards
                </ButtonLink>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

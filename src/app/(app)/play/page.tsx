import type { Metadata } from "next";
import Link from "next/link";
import { Layers, ListChecks, Trophy } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
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
      <div className="rise space-y-1">
        <h1 className="text-2xl sm:text-[2rem] sm:leading-tight">Study</h1>
        <p className="text-text-muted">Quiz checks what you know. Flashcards help you learn. Challenge is a game.</p>
      </div>

      {decks.length === 0 ? (
        <Panel className="rise" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="space-y-1">
              <h2 className="text-2xl">Nothing to study yet</h2>
              <p className="text-text-muted">Make a deck with a few cards first.</p>
            </div>
            <ButtonLink href="/decks/new" size="lg">
              Make a deck
            </ButtonLink>
          </div>
        </Panel>
      ) : (
        <div className="rise pixel-lift" style={{ animationDelay: "0.1s" }}>
          <ul className="pixel-frame divide-y-2 divide-border">
            {decks.map((deck) => (
              <li key={deck.id} className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                <Link href={`/decks/${deck.id}`} className="group flex min-w-0 items-center gap-3">
                  <DeckBadge
                    title={deck.title}
                    colorKey={deck.colorKey}
                    className="transition-transform duration-150 group-hover:-translate-y-0.5"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium group-hover:text-accent-ink">{deck.title}</span>
                    <span className="block text-sm text-text-muted">{waiting(deck)}</span>
                  </span>
                </Link>
                <div className="grid shrink-0 grid-cols-2 gap-2 *:px-2 min-[440px]:grid-cols-3">
                  <ButtonLink
                    href={`/decks/${deck.id}/quiz`}
                    className="col-span-2 min-[440px]:col-span-1"
                    aria-label={`Quiz: ${deck.title}`}
                  >
                    <ListChecks size={18} aria-hidden className="hidden min-[560px]:block" />
                    Quiz
                  </ButtonLink>
                  <ButtonLink href={`/decks/${deck.id}/flashcards`} variant="outline" aria-label={`Flashcards: ${deck.title}`}>
                    <Layers size={18} aria-hidden className="hidden min-[560px]:block" />
                    Flashcards
                  </ButtonLink>
                  <ButtonLink href={`/decks/${deck.id}/challenge`} variant="outline" aria-label={`Challenge: ${deck.title}`}>
                    <Trophy size={18} aria-hidden className="hidden min-[560px]:block" />
                    Challenge
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { Compass, Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { DeckList } from "@/features/decks/components/deck-list";
import { getDecks } from "@/features/decks/queries";

export const metadata: Metadata = { title: "Decks" };

export default async function DecksPage() {
  const decks = await getDecks();

  return (
    <div className="space-y-6">
      <div className="rise flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-[2rem] sm:leading-tight">Decks</h1>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/explore" variant="outline">
            <Compass size={18} aria-hidden />
            Explore
          </ButtonLink>
          <ButtonLink href="/decks/new">
            <Plus size={18} aria-hidden />
            New deck
          </ButtonLink>
        </div>
      </div>

      {decks.length === 0 ? (
        <Panel className="rise" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="space-y-1">
              <h2 className="text-2xl">No decks yet</h2>
              <p className="text-text-muted">A deck is a set of flashcards about one topic. Make your first one.</p>
            </div>
            <ButtonLink href="/decks/new" size="lg">
              Make a deck
            </ButtonLink>
          </div>
        </Panel>
      ) : (
        <div className="rise" style={{ animationDelay: "0.1s" }}>
          <DeckList decks={decks} />
        </div>
      )}
    </div>
  );
}

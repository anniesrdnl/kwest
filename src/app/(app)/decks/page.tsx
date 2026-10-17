import type { Metadata } from "next";
import { Compass, Layers, Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { DeckList } from "@/features/decks/components/deck-list";
import { getDecks } from "@/features/decks/queries";

export const metadata: Metadata = { title: "Decks" };

export default async function DecksPage() {
  const decks = await getDecks();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold md:text-3xl">Decks</h1>
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
        <DeckList decks={decks} />
      )}
    </div>
  );
}

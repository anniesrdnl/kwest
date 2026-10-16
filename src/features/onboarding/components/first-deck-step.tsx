import { ActionButton } from "@/components/ui/action-button";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import { startWithOwnDeck, startWithStarterDeck } from "../actions";

export function FirstDeckStep() {
  return (
    <section aria-labelledby="first-deck-heading" className="space-y-8">
      <div className="space-y-2">
        <h1 id="first-deck-heading" className="text-3xl font-bold">
          Pick your first deck
        </h1>
        <p className="text-lg text-text-muted">You can add more any time.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start gap-4">
          <DeckBadge title="How to Write a Research Paper" colorKey="spine-3" size="lg" />
          <div>
            <h2 className="text-lg font-semibold">Try a ready-made deck</h2>
            <p>How to Write a Research Paper · 17 cards</p>
            <p className="text-sm text-text-muted">Thesis, sources, citations and drafting. An easy place to start.</p>
          </div>
        </div>
        <ActionButton action={startWithStarterDeck} pendingLabel="Adding…">
          Add this deck
        </ActionButton>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <div>
          <h2 className="text-lg font-semibold">Make my own</h2>
          <p className="text-text-muted">Type your own cards, or paste a list from your notes or Quizlet.</p>
        </div>
        <ActionButton action={startWithOwnDeck} appearance="secondary" pendingLabel="Opening…">
          Make a deck
        </ActionButton>
      </div>
    </section>
  );
}

import { ActionButton } from "@/components/ui/action-button";
import { startWithOwnDeck } from "../actions";

export function FirstDeckStep() {
  return (
    <section aria-labelledby="first-deck-heading" className="space-y-8">
      <div className="space-y-2">
        <h1 id="first-deck-heading" className="text-3xl font-bold">
          Make your first deck
        </h1>
        <p className="text-lg text-text-muted">
          Type your own cards, or paste a list from your notes or Quizlet. You can add more any time.
        </p>
      </div>

      <ActionButton action={startWithOwnDeck} pendingLabel="Opening…">
        Make a deck
      </ActionButton>
    </section>
  );
}

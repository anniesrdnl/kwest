import { ChevronDown } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import { finishOnboarding, startWithStarterDeck } from "../actions";

export function FirstDeckStep() {
  return (
    <section aria-labelledby="first-deck-heading" className="space-y-8">
      <div className="space-y-2">
        <h1 id="first-deck-heading" className="text-3xl font-semibold">
          Pick your first deck
        </h1>
        <p className="text-lg text-text-muted">You can add more any time.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card">
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

      {/* Making decks is Phase 8. Say so rather than open a fake editor. */}
      <details className="group rounded-xl border border-border bg-surface shadow-card">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
          Make my own
          <ChevronDown size={20} aria-hidden className="text-text-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-border px-5 py-5">
          <p>
            Making your own decks isn&apos;t ready yet. It&apos;s the next thing being built. For now you can start
            with no decks and add the ready-made one later from your home page.
          </p>
          <ActionButton action={finishOnboarding} appearance="secondary" pendingLabel="Opening…">
            Go to home
          </ActionButton>
        </div>
      </details>
    </section>
  );
}

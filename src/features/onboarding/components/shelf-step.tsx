import { ChevronDown } from "lucide-react";
import { DeckSpine } from "@/components/pixel/deck-spine";
import { ActionButton } from "@/components/ui/action-button";
import { finishOnboarding, startWithStarterDeck } from "../actions";

export function ShelfStep() {
  return (
    <section aria-labelledby="shelf-heading" className="space-y-6">
      <div className="space-y-2">
        <h1 id="shelf-heading" className="font-pixel text-3xl">
          Your shelf is empty
        </h1>
        <p className="text-text-muted">Pick a first deck to study. You can add more any time.</p>
      </div>

      <div className="flex items-start gap-4 bg-surface p-4 pixel-border">
        <DeckSpine colorKey="spine-3" className="h-20 w-7 shrink-0" />
        <div className="flex-1 space-y-3">
          <div>
            <h2 className="font-pixel text-lg">Try the starter deck</h2>
            <p>How to Write a Research Paper · 17 cards</p>
            <p className="text-sm text-text-muted">Theses, sources, citations and drafting. A gentle place to begin.</p>
          </div>
          <ActionButton action={startWithStarterDeck} pendingLabel="Adding…">
            Add starter deck
          </ActionButton>
        </div>
      </div>

      {/* The deck editor is Phase 8. Say so rather than open a fake editor. */}
      <details className="group bg-surface pixel-border">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-pixel text-lg [&::-webkit-details-marker]:hidden">
          Write my own
          <ChevronDown size={18} aria-hidden className="transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-3 border-t-2 border-border px-4 py-4">
          <p>
            The deck editor isn&apos;t ready yet. It&apos;s the next thing being built. Until then you can start with an
            empty shelf and add the starter deck later from your dashboard.
          </p>
          <ActionButton action={finishOnboarding} appearance="secondary" pendingLabel="Heading in…">
            Go to my dorm
          </ActionButton>
        </div>
      </details>
    </section>
  );
}

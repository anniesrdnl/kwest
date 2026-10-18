import { ActionButton } from "@/components/ui/action-button";
import { Panel } from "@/components/ui/panel";
import { startWithOwnDeck } from "../actions";

export function FirstDeckStep() {
  return (
    <Panel aria-labelledby="first-deck-heading" className="rise" style={{ animationDelay: "0.05s" }}>
      <div className="space-y-6 sm:p-3">
        <div className="space-y-2">
          <h1 id="first-deck-heading" className="text-[2rem] sm:text-[2.5rem] sm:leading-tight">
            Make your first deck
          </h1>
          <p className="text-lg text-text">Type your cards, or add a file. You can add more any time.</p>
        </div>

        <ActionButton action={startWithOwnDeck} pendingLabel="Opening…" size="lg">
          Make a deck
        </ActionButton>
      </div>
    </Panel>
  );
}

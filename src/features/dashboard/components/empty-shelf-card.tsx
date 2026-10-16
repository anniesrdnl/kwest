import { PixelBook } from "@/components/pixel/pixel-book";
import { ActionButton } from "@/components/ui/action-button";
import { Panel } from "@/components/ui/panel";
import { addStarterDeck } from "@/features/decks/actions";

/** Dashboard state for a player with no decks yet. */
export function EmptyShelfCard() {
  return (
    <Panel title="Next up" aria-label="Next up">
      <div className="flex items-start gap-4">
        <PixelBook className="h-14 w-16 shrink-0" label="" />
        <div className="space-y-3">
          <div>
            <p className="font-pixel text-xl">Your shelf is empty</p>
            <p className="text-text-muted">
              Start with the starter deck, How to Write a Research Paper. Writing your own decks opens soon.
            </p>
          </div>
          <ActionButton action={addStarterDeck} pendingLabel="Adding…">
            Add starter deck
          </ActionButton>
        </div>
      </div>
    </Panel>
  );
}

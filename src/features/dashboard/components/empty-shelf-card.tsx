import { PixelTome } from "@/components/pixel/pixel-tome";
import { ActionButton } from "@/components/ui/action-button";
import { Panel } from "@/components/ui/panel";
import { addStarterTome } from "@/features/tomes/actions";

/** Dashboard state for a player with no tomes yet. */
export function EmptyShelfCard() {
  return (
    <Panel title="Next up" aria-label="Next up">
      <div className="flex items-start gap-4">
        <PixelTome className="h-14 w-16 shrink-0" label="" />
        <div className="space-y-3">
          <div>
            <p className="font-pixel text-xl">Your shelf is empty</p>
            <p className="text-text-muted">
              Start with the starter tome, How to Write a Research Paper. Writing your own tomes opens soon.
            </p>
          </div>
          <ActionButton action={addStarterTome} pendingLabel="Shelving the tome…">
            Add starter tome
          </ActionButton>
        </div>
      </div>
    </Panel>
  );
}

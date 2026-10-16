import type { Metadata } from "next";
import { Library } from "lucide-react";
import { DeckSpine } from "@/components/pixel/deck-spine";
import { ComingSoon } from "@/components/ui/coming-soon";
import { Panel } from "@/components/ui/panel";
import { getDecks } from "@/features/decks/queries";

export const metadata: Metadata = { title: "Decks" };

// The deck editor is Phase 8. Until then this page lists the shelf read-only.
export default async function DecksPage() {
  const decks = await getDecks();

  return (
    <ComingSoon
      icon={Library}
      title="Decks"
      phase={8}
      extra={
        <Panel title={`Your shelf (${decks.length})`}>
          {decks.length === 0 ? (
            <p className="text-text-muted">No decks yet. You can add the starter deck from the home page.</p>
          ) : (
            <ul className="divide-y-2 divide-surface-2">
              {decks.map((deck) => (
                <li key={deck.id} className="flex items-center gap-3 py-3">
                  <DeckSpine colorKey={deck.colorKey} className="h-12 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-pixel break-words">{deck.title}</p>
                    <p className="text-sm text-text-muted">
                      {deck.cardCount} cards · {deck.due} dusty · {deck.fresh} new
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      }
    >
      <p>Creating, editing and opening decks arrives in Phase 8. Here&apos;s what&apos;s on your shelf so far.</p>
    </ComingSoon>
  );
}

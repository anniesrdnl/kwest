import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { ComingSoon } from "@/components/ui/coming-soon";
import { Panel } from "@/components/ui/panel";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import { getDecks } from "@/features/decks/queries";

export const metadata: Metadata = { title: "Decks" };

// Making and editing decks is Phase 8. Until then this page lists decks read-only.
export default async function DecksPage() {
  const decks = await getDecks();

  return (
    <ComingSoon
      icon={Layers}
      title="Decks"
      phase={8}
      extra={
        <Panel title={`Your decks (${decks.length})`}>
          {decks.length === 0 ? (
            <p className="text-text-muted">No decks yet. You can add the ready-made deck from your home page.</p>
          ) : (
            <ul className="divide-y divide-border">
              {decks.map((deck) => (
                <li key={deck.id} className="flex items-center gap-3 py-3">
                  <DeckBadge title={deck.title} colorKey={deck.colorKey} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium break-words">{deck.title}</p>
                    <p className="text-sm text-text-muted">
                      {deck.cardCount} cards · {deck.due} to review · {deck.fresh} new
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      }
    >
      <p>Making, editing and opening decks comes in Phase 8. Here are the decks you have so far.</p>
    </ComingSoon>
  );
}

import type { Metadata } from "next";
import { DeckEditor } from "@/features/decks/components/deck-editor";

export const metadata: Metadata = { title: "New deck" };

export default function NewDeckPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold md:text-3xl">New deck</h1>
      <DeckEditor
        initial={{ id: null, title: "", subject: "", description: "", colorKey: "spine-2", cards: [] }}
        cancelHref="/decks"
      />
    </div>
  );
}

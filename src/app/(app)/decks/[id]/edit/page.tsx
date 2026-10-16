import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeckEditor } from "@/features/decks/components/deck-editor";
import { getDeck } from "@/features/decks/queries";

export const metadata: Metadata = { title: "Edit deck" };

// Renders inside loading.tsx's Suspense (params are request-time data).
export default async function EditDeckPage({ params }: PageProps<"/decks/[id]/edit">) {
  const { id } = await params;
  const deck = await getDeck(id);
  if (!deck) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold md:text-3xl">Edit deck</h1>
      <DeckEditor
        initial={{
          id: deck.id,
          title: deck.title,
          subject: deck.subject ?? "",
          description: deck.description ?? "",
          colorKey: deck.colorKey,
          cards: deck.cards.map((c) => ({ ...c, explanation: c.explanation ?? "" })),
        }}
        cancelHref={`/decks/${deck.id}`}
      />
    </div>
  );
}

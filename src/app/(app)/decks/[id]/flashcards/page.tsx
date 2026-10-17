import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudySession } from "@/features/study/components/study-session";
import { getStudyDeck } from "@/features/study/queries";

export const metadata: Metadata = { title: "Flashcards" };

// Renders inside loading.tsx's Suspense (params are request-time data).
export default async function FlashcardsPage({ params }: PageProps<"/decks/[id]/flashcards">) {
  const study = await getStudyDeck((await params).id);
  if (!study) notFound();
  const { deck, cards } = study;

  return (
    <StudySession deck={{ id: deck.id, title: deck.title, colorKey: deck.colorKey }} mode="flashcards" cards={cards} />
  );
}

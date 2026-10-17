import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChallengeGame } from "@/features/study/components/challenge-game";
import { getStudyDeck } from "@/features/study/queries";

export const metadata: Metadata = { title: "Challenge" };

// Renders inside loading.tsx's Suspense (params are request-time data).
export default async function ChallengePage({ params }: PageProps<"/decks/[id]/challenge">) {
  const study = await getStudyDeck((await params).id);
  if (!study) notFound();
  const { deck, cards } = study;

  return <ChallengeGame deck={{ id: deck.id, title: deck.title, colorKey: deck.colorKey }} cards={cards} />;
}

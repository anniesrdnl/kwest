import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LinkGame } from "@/features/study/components/link-game";
import { getChallengeLink } from "@/features/study/link-queries";

export const metadata: Metadata = { title: "Beat my score" };

// Renders inside loading.tsx's Suspense (params are request-time data).
export default async function ChallengeLinkPage({ params }: PageProps<"/challenge/[code]">) {
  const link = await getChallengeLink((await params).code);
  if (!link) notFound();
  return <LinkGame link={link} />;
}

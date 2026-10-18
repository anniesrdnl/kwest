import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import { CopyDeckButton } from "@/features/decks/components/copy-deck-button";
import { ReportDeckButton } from "@/features/decks/components/report-deck-button";
import { getSharedDeck } from "@/features/decks/queries";

export const metadata: Metadata = { title: "Shared deck" };

// Renders inside loading.tsx's Suspense (params are request-time data).
export default async function SharedDeckPage({ params }: PageProps<"/shared/[id]">) {
  const deck = await getSharedDeck((await params).id);
  if (!deck) notFound();
  const count = deck.cards.length;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href={deck.isOwner ? `/decks/${deck.id}` : "/explore"}
        className="rise inline-flex min-h-11 items-center gap-1 text-sm font-medium text-text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={16} aria-hidden />
        {deck.isOwner ? "Back to your deck" : "Explore"}
      </Link>

      <Panel className="rise" style={{ animationDelay: "0.05s" }}>
        <div className="space-y-6">
          {deck.isOwner && (
            <p className="bg-accent-soft px-3 py-2 text-sm">
              {deck.shared ? "This is your deck. People with the link see this page." : "This is your deck. Sharing is off, so only you see this page."}
            </p>
          )}

          <div className="flex items-start gap-4">
            <DeckBadge title={deck.title} colorKey={deck.colorKey} size="lg" />
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl break-words sm:text-[2rem] sm:leading-tight">{deck.title}</h1>
              <p className="text-text-muted">
                {count} {count === 1 ? "card" : "cards"} · by {deck.isOwner ? "you" : deck.ownerName}
                {deck.subject && <> · {deck.subject}</>}
              </p>
            </div>
          </div>
          {deck.description && <p className="whitespace-pre-line">{deck.description}</p>}

          <div className="space-y-2">
            <CopyDeckButton deckId={deck.id} label={deck.isOwner ? "Make a copy" : "Copy to my decks"} />
            <p className="text-sm text-text-muted">
              {deck.isOwner ? "The copy is a new private deck." : "You get your own private copy. Your changes don't touch theirs."}
            </p>
            {!deck.isOwner && <ReportDeckButton deckId={deck.id} reported={deck.reportedByYou} />}
          </div>
        </div>
      </Panel>

      <section aria-labelledby="cards-heading" className="rise space-y-4" style={{ animationDelay: "0.1s" }}>
        <h2 id="cards-heading" className="text-2xl">
          Cards
        </h2>
        {count === 0 ? (
          <p className="text-text-muted">This deck has no cards yet.</p>
        ) : (
          <div className="pixel-lift">
            <ol className="pixel-frame divide-y-2 divide-border">
              {deck.cards.map((card, i) => (
                <li key={card.id} className="grid gap-1 p-4 md:grid-cols-[2rem_1fr_1fr] md:gap-4">
                  <span className="text-sm text-text-muted tabular-nums">{i + 1}</span>
                  <p className="font-medium break-words">{card.prompt}</p>
                  <div className="space-y-1">
                    <p className="break-words text-text-muted md:text-text">{card.answer}</p>
                    {card.explanation && <p className="text-sm text-text-muted">{card.explanation}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}

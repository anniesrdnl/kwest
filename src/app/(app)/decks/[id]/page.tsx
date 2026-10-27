import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, ListChecks, Pencil, Trophy } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import { DeleteDeckButton } from "@/features/decks/components/delete-deck-button";
import { ShareDeck } from "@/features/decks/components/share-deck";
import { getDeck, isHiddenFromExplore } from "@/features/decks/queries";

export async function generateMetadata({ params }: PageProps<"/decks/[id]">): Promise<Metadata> {
  const deck = await getDeck((await params).id);
  return { title: deck?.title ?? "Deck" };
}

// Renders inside loading.tsx's Suspense (params are request-time data).
export default async function DeckPage({ params }: PageProps<"/decks/[id]">) {
  const { id } = await params;
  const [deck, hidden] = await Promise.all([getDeck(id), isHiddenFromExplore(id)]);
  if (!deck) notFound();

  const stats = [
    [deck.cardCount, deck.cardCount === 1 ? "card" : "cards"],
    [deck.due, "to review"],
    [deck.fresh, "new"],
  ] as const;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/decks"
        className="rise inline-flex min-h-11 items-center gap-1 text-sm font-medium text-text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={16} aria-hidden />
        All decks
      </Link>

      <Panel className="rise" style={{ animationDelay: "0.05s" }}>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <DeckBadge title={deck.title} colorKey={deck.colorKey} size="lg" />
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl break-words sm:text-[2rem] sm:leading-tight">{deck.title}</h1>
              {deck.subject && <p className="text-text-muted">{deck.subject}</p>}
            </div>
          </div>
          {deck.description && <p className="whitespace-pre-line">{deck.description}</p>}

          <dl className="grid grid-cols-3 divide-x-2 divide-border border-y-2 border-border">
            {stats.map(([value, label]) => (
              <div key={label} className="px-3 py-3 sm:px-5">
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="block font-display text-2xl tabular-nums">{value}</span>
                  <span className="text-sm text-text-muted">{label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-3">
            {deck.cardCount > 0 && (
              <>
                <ButtonLink href={`/decks/${deck.id}/quiz`} size="lg">
                  <ListChecks size={18} aria-hidden />
                  Quiz
                </ButtonLink>
                <ButtonLink href={`/decks/${deck.id}/flashcards`} variant="outline" size="lg">
                  <Layers size={18} aria-hidden />
                  Flashcards
                </ButtonLink>
                <ButtonLink href={`/decks/${deck.id}/challenge`} variant="outline" size="lg">
                  <Trophy size={18} aria-hidden />
                  Challenge
                </ButtonLink>
              </>
            )}
            <ButtonLink href={`/decks/${deck.id}/edit`} variant="outline" size="lg">
              <Pencil size={18} aria-hidden />
              Edit
            </ButtonLink>
            <DeleteDeckButton deckId={deck.id} title={deck.title} />
          </div>
        </div>
      </Panel>

      <div className="rise" style={{ animationDelay: "0.1s" }}>
        <ShareDeck deckId={deck.id} title={deck.title} visibility={deck.visibility} hiddenFromExplore={hidden} />
      </div>

      <section aria-labelledby="cards-heading" className="rise space-y-4" style={{ animationDelay: "0.15s" }}>
        <h2 id="cards-heading" className="text-2xl">
          Cards
        </h2>
        {deck.cards.length === 0 ? (
          <p className="text-text-muted">This deck has no cards yet. Use Edit to add some.</p>
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

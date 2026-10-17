import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Search } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import { listPublicDecks } from "@/features/decks/queries";
import type { ExploreSort } from "@/lib/types/database";

const PAGE_SIZE = 24;
const MAX_LIMIT = 192;

export const metadata: Metadata = { title: "Explore" };

// Renders inside loading.tsx's Suspense (searchParams are request-time data).
export default async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const q = (await searchParams).q;
  const query = (typeof q === "string" ? q : "").trim().slice(0, 100);
  const sort: ExploreSort = (await searchParams).sort === "copied" ? "copied" : "new";
  const n = Number((await searchParams).limit);
  const limit = Number.isInteger(n) && n >= PAGE_SIZE && n <= MAX_LIMIT ? n : PAGE_SIZE;
  const { decks, hasMore } = await listPublicDecks(query, sort, limit);
  const moreParams = new URLSearchParams({ limit: String(limit + PAGE_SIZE) });
  if (query) moreParams.set("q", query);
  if (sort === "copied") moreParams.set("sort", "copied");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold md:text-3xl">Explore</h1>
        <p className="text-text-muted">Decks other people made public. Open one to see its cards and copy it to your decks.</p>
      </div>

      <form role="search" action="/explore" className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search public decks"
            aria-label="Search public decks"
            className="w-full min-h-11 rounded-lg border border-border-strong bg-surface py-2 pr-3 pl-10 text-base text-text placeholder:text-text-muted/70 transition-colors focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus/30"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          Sort
          <select
            name="sort"
            defaultValue={sort}
            aria-label="Sort public decks"
            className="min-h-11 flex-1 rounded-lg border border-border-strong bg-surface px-3 text-base text-text transition-colors focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus/30 sm:flex-none"
          >
            <option value="new">Newest</option>
            <option value="copied">Most copied</option>
          </select>
        </label>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {decks.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-dashed border-border-strong/50 p-10 text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
            <Compass size={24} aria-hidden />
          </span>
          <h2 className="text-lg font-semibold">{query ? "No decks match" : "No public decks yet"}</h2>
          <p className="text-text-muted">
            {query ? (
              <>
                Try a different word, or{" "}
                <Link href="/explore" className="font-medium text-text underline underline-offset-4">
                  see all public decks
                </Link>
                .
              </>
            ) : (
              "Make one of your decks public from its Share box, and it shows up here."
            )}
          </p>
        </div>
      ) : (
        <>
          {query && (
            <p className="text-sm text-text-muted" role="status">
              {decks.length}{hasMore ? "+" : ""} {decks.length === 1 && !hasMore ? "deck" : "decks"} for &ldquo;{query}&rdquo;
            </p>
          )}
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <li key={deck.id}>
                <Link
                  href={`/shared/${deck.id}`}
                  className="flex h-full items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors duration-150 hover:border-border-strong/60"
                >
                  <DeckBadge title={deck.title} colorKey={deck.colorKey} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{deck.title}</p>
                    <p className="truncate text-sm text-text-muted">
                      {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"} · {deck.copyCount} {deck.copyCount === 1 ? "copy" : "copies"} · by {deck.isOwner ? "you" : deck.ownerName}
                      {deck.subject && <> · {deck.subject}</>}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {hasMore && limit < MAX_LIMIT && (
            <div className="text-center">
              <ButtonLink href={`/explore?${moreParams}`} scroll={false} variant="secondary">
                Load more
              </ButtonLink>
            </div>
          )}
        </>
      )}
    </div>
  );
}

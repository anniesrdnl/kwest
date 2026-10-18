import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Search } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { inputBase } from "@/components/ui/input-styles";
import { Panel } from "@/components/ui/panel";
import { PixelTile } from "@/features/decks/components/deck-tile";
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
      <div className="rise space-y-1">
        <h1 className="text-2xl sm:text-[2rem] sm:leading-tight">Explore</h1>
        <p className="text-text-muted">Decks other people shared. Open one to copy it.</p>
      </div>

      <form
        role="search"
        action="/explore"
        className="rise flex flex-col gap-2 sm:flex-row"
        style={{ animationDelay: "0.05s" }}
      >
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search public decks"
            aria-label="Search public decks"
            className={`${inputBase} pr-3 pl-10`}
          />
        </div>
        <select name="sort" defaultValue={sort} aria-label="Sort public decks" className={`${inputBase} px-3 sm:w-44`}>
          <option value="new">Newest</option>
          <option value="copied">Most copied</option>
        </select>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {decks.length === 0 ? (
        <Panel className="rise" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Compass size={32} className="text-accent-ink" aria-hidden />
            <h2 className="text-2xl">{query ? "No decks match" : "No public decks yet"}</h2>
            <p className="text-text-muted">
              {query ? (
                <>
                  Try a different word, or{" "}
                  <Link href="/explore" className="font-medium text-accent-ink underline underline-offset-4">
                    see all public decks
                  </Link>
                  .
                </>
              ) : (
                "Share one of your decks with Everyone, and it shows up here."
              )}
            </p>
          </div>
        </Panel>
      ) : (
        <>
          {query && (
            <p className="text-text-muted" role="status">
              {decks.length}
              {hasMore ? "+" : ""} {decks.length === 1 && !hasMore ? "deck" : "decks"} for &ldquo;{query}&rdquo;
            </p>
          )}
          <ul className="rise grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ animationDelay: "0.1s" }}>
            {decks.map((deck) => (
              <li key={deck.id}>
                <PixelTile href={`/shared/${deck.id}`} title={deck.title} colorKey={deck.colorKey}>
                  {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"} · {deck.copyCount}{" "}
                  {deck.copyCount === 1 ? "copy" : "copies"} · by {deck.isOwner ? "you" : deck.ownerName}
                  {deck.subject && <> · {deck.subject}</>}
                </PixelTile>
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

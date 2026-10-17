"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useDeferredValue, useState } from "react";
import type { Deck } from "../queries";
import { DeckBadge } from "./deck-badge";

type Filter = "all" | "review" | "new" | "done";
type Sort = "recent" | "az";

const FILTERS: { key: Filter; label: string; test: (deck: Deck) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "review", label: "To review", test: (d) => d.due > 0 },
  { key: "new", label: "Has new cards", test: (d) => d.fresh > 0 },
  { key: "done", label: "Caught up", test: (d) => d.due === 0 && d.fresh === 0 },
];

function status(deck: Deck): string {
  if (deck.due > 0) return `${deck.due} to review`;
  if (deck.fresh > 0) return `${deck.fresh} new`;
  return "All caught up";
}

/** Lowercase and drop accents, so "cafe" finds "Café". */
function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** The player's decks with a search box, filters and sort. */
export function DeckList({ decks }: { decks: Deck[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const deferredQuery = useDeferredValue(query);

  const words = fold(deferredQuery).split(/\s+/).filter(Boolean);
  const test = FILTERS.find((f) => f.key === filter)!.test;
  const shown = decks.filter((deck) => {
    if (!test(deck)) return false;
    const text = fold(`${deck.title} ${deck.subject ?? ""}`);
    return words.every((w) => text.includes(w));
  });
  if (sort === "az") shown.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));

  const clear = () => {
    setQuery("");
    setFilter("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search decks"
            aria-label="Search decks"
            className="w-full min-h-11 rounded-lg border border-border-strong bg-surface py-2 pr-11 pl-10 text-base text-text placeholder:text-text-muted/70 transition-colors focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus/30 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-text-muted hover:text-text"
              aria-label="Clear search"
            >
              <X size={18} aria-hidden />
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="min-h-11 flex-1 rounded-lg border border-border-strong bg-surface px-3 text-base text-text transition-colors focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus/30 sm:flex-none"
          >
            <option value="recent">Recently studied</option>
            <option value="az">Name (A to Z)</option>
          </select>
        </label>
      </div>

      <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = decks.filter(f.test).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.key)}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors duration-150 ${
                active
                  ? "border-accent bg-accent-soft text-accent-ink"
                  : "border-border bg-surface text-text-muted hover:border-border-strong/60 hover:text-text"
              }`}
            >
              {f.label}
              <span className="tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} {shown.length === 1 ? "deck" : "decks"} shown
      </p>

      {shown.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-dashed border-border-strong/50 p-8 text-center">
          <p className="font-medium">No decks match</p>
          <p className="text-sm text-text-muted">Try a different word or filter.</p>
          <button type="button" onClick={clear} className="text-sm font-medium underline underline-offset-4">
            Show all decks
          </button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((deck) => (
            <li key={deck.id}>
              <Link
                href={`/decks/${deck.id}`}
                className="flex h-full items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors duration-150 hover:border-border-strong/60"
              >
                <DeckBadge title={deck.title} colorKey={deck.colorKey} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{deck.title}</p>
                  <p className="text-sm text-text-muted">
                    {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"} · {status(deck)}
                    {deck.shared && " · Shared"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

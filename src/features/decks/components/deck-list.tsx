"use client";

import { Search, X } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { inputBase } from "@/components/ui/input-styles";
import type { Deck } from "../queries";
import { DeckTile } from "./deck-tile";

type Filter = "all" | "review" | "new" | "done";
type Sort = "recent" | "az";

const FILTERS: { key: Filter; label: string; test: (deck: Deck) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "review", label: "To review", test: (d) => d.due > 0 },
  { key: "new", label: "Has new cards", test: (d) => d.fresh > 0 },
  { key: "done", label: "Caught up", test: (d) => d.due === 0 && d.fresh === 0 },
];

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
            className={`${inputBase} pr-11 pl-10 [&::-webkit-search-cancel-button]:hidden`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute inset-y-[2px] right-[2px] flex w-11 items-center justify-center text-text-muted transition-colors hover:bg-track hover:text-text active:bg-accent active:text-accent-fg"
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
            className={`${inputBase} flex-1 px-3 sm:w-auto sm:flex-none`}
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
              className={`inline-flex min-h-9 items-center gap-1.5 border px-3 text-sm font-medium transition-colors duration-150 active:translate-y-px ${
                active
                  ? "border-border-strong bg-accent-soft text-text"
                  : "border-border bg-surface text-text-muted hover:bg-accent-soft hover:text-text"
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
        <div className="space-y-3 border-2 border-dashed border-border p-8 text-center">
          <p className="font-medium">No decks match</p>
          <p className="text-sm text-text-muted">Try a different word or filter.</p>
          <button type="button" onClick={clear} className="text-sm font-medium underline underline-offset-4">
            Show all decks
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((deck) => (
            <li key={deck.id}>
              <DeckTile deck={deck} extra={deck.visibility === "public" ? " · Public" : deck.shared ? " · Shared" : ""} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

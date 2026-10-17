"use client";

import { Share2 } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { ShareLink } from "@/components/ui/share-link";
import type { SetVisibility } from "@/lib/types/database";
import { setDeckSharing } from "../actions";

const OPTIONS: { value: SetVisibility; label: string; hint: string }[] = [
  { value: "private", label: "Only me", hint: "Nobody else can see this deck." },
  { value: "unlisted", label: "Anyone with the link", hint: "Send the link to friends. It isn't listed anywhere." },
  { value: "public", label: "Everyone", hint: "Shown in Explore, so anyone on Kwest can find it." },
];

/** Owner's choice of who can see a deck, plus the link while it's shared. */
export function ShareDeck({ deckId, title, visibility }: { deckId: string; title: string; visibility: SetVisibility }) {
  const [current, setCurrent] = useOptimistic(visibility);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const choose = (next: SetVisibility) =>
    startTransition(async () => {
      setError(null);
      setCurrent(next);
      const res = await setDeckSharing(deckId, next);
      if (res.status === "error") setError(res.message ?? "Something went wrong.");
    });

  return (
    <section aria-labelledby="share-heading" className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
          <Share2 size={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 id="share-heading" className="text-lg font-semibold">
            Share
          </h2>
          <p className="text-sm text-text-muted">
            People you share with can see the cards and copy the deck. Your study progress stays private.
          </p>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="sr-only">Who can see this deck</legend>
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
              current === o.value ? "border-accent bg-accent-soft" : "border-border hover:bg-surface-2"
            }`}
          >
            <input
              type="radio"
              name={`visibility-${deckId}`}
              value={o.value}
              checked={current === o.value}
              disabled={pending}
              onChange={() => choose(o.value)}
              className="mt-1 size-4 shrink-0 accent-accent"
            />
            <span>
              <span className="block font-medium">{o.label}</span>
              <span className="block text-sm text-text-muted">{o.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {current !== "private" && (
        <ShareLink path={`/shared/${deckId}`} text={`Study "${title}" with me on Kwest.`} label="Deck link" />
      )}
      {error && (
        <p role="alert" className="text-sm text-wrong">
          {error}
        </p>
      )}
    </section>
  );
}

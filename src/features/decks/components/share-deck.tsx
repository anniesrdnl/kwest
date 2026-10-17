"use client";

import { Share2 } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { ShareLink } from "@/components/ui/share-link";
import { setDeckSharing } from "../actions";

/** Owner's switch for link sharing, plus the link while it's on. */
export function ShareDeck({ deckId, title, shared }: { deckId: string; title: string; shared: boolean }) {
  const [on, setOn] = useOptimistic(shared);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = (next: boolean) =>
    startTransition(async () => {
      setError(null);
      setOn(next);
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
            Friends with the link can see the cards and copy the deck. Your study progress stays private.
          </p>
        </div>
      </div>
      <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-4 py-2">
        <span className="font-medium">Anyone with the link can see this deck</span>
        <input
          type="checkbox"
          role="switch"
          checked={on}
          disabled={pending}
          onChange={(e) => toggle(e.target.checked)}
          className="size-5 shrink-0 accent-accent"
        />
      </label>
      {on && <ShareLink path={`/shared/${deckId}`} text={`Study "${title}" with me on Kwest.`} label="Deck link" />}
      {error && (
        <p role="alert" className="text-sm text-wrong">
          {error}
        </p>
      )}
    </section>
  );
}

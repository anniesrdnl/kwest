"use client";

import { Flag } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { DeckReportReason } from "@/lib/types/database";
import { reportDeck } from "../actions";

const REASONS: { value: DeckReportReason; label: string }[] = [
  { value: "wrong", label: "The answers are wrong" },
  { value: "offensive", label: "It's rude, hateful or not okay for school" },
  { value: "spam", label: "It's spam or an ad" },
  { value: "other", label: "Something else" },
];

/** Report a deck someone else shared. Opens a small form in a dialog. */
export function ReportDeckButton({ deckId, reported }: { deckId: string; reported: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState<DeckReportReason | null>(null);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    startTransition(async () => {
      const res = await reportDeck(deckId, reason, note.trim());
      setResult({ ok: res.status === "success", message: res.message ?? "" });
    });
  };

  const sent = reported || result?.ok;

  return (
    <>
      <Button variant="ghost" onClick={() => dialogRef.current?.showModal()} className="hover:text-wrong">
        <Flag size={16} aria-hidden />
        {sent ? "Reported" : "Report"}
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby="report-deck-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-surface p-6 text-text shadow-card backdrop:bg-black/40"
      >
        {result?.ok ? (
          <div className="space-y-4">
            <h2 id="report-deck-title" className="text-xl font-semibold">
              Report sent
            </h2>
            <p role="status">{result.message}</p>
            <Button onClick={() => dialogRef.current?.close()} autoFocus>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={send} className="space-y-4">
            <h2 id="report-deck-title" className="text-xl font-semibold">
              Report this deck
            </h2>
            {reported && <p className="text-sm text-text-muted">You already reported it. Sending again replaces your report.</p>}
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-medium">What&apos;s wrong?</legend>
              {REASONS.map((r) => (
                <label key={r.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-surface-2">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="size-4 shrink-0 accent-accent"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </fieldset>
            <div className="space-y-2">
              <label htmlFor="report-note" className="block text-sm font-medium">
                Anything else? <span className="font-normal text-text-muted">(optional)</span>
              </label>
              <textarea
                id="report-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
                rows={3}
                className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-base focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus/30"
              />
            </div>
            {result && !result.ok && (
              <p role="alert" className="text-sm text-wrong">
                {result.message}
              </p>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => dialogRef.current?.close()}>
                Cancel
              </Button>
              <Button type="submit" disabled={!reason || pending}>
                {pending ? "Sending…" : "Send report"}
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { idleState, type FormState } from "@/lib/forms";
import { deleteDeck } from "../actions";

/** Delete with a confirm dialog. Deleting can't be undone, so the dialog says what is lost. */
export function DeleteDeckButton({ deckId, title }: { deckId: string; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState<FormState>(() => deleteDeck(deckId), idleState);

  return (
    <>
      <Button variant="ghost" onClick={() => dialogRef.current?.showModal()} className="hover:text-wrong">
        <Trash2 size={18} aria-hidden />
        Delete
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-deck-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-surface p-6 text-text shadow-card backdrop:bg-black/40"
      >
        <form action={formAction} className="space-y-4">
          <h2 id="delete-deck-title" className="text-xl font-semibold">
            Delete this deck?
          </h2>
          <p className="text-text-muted">
            &ldquo;{title}&rdquo; and all its cards will be deleted, along with your review progress for them. This
            can&apos;t be undone.
          </p>
          <FormMessage state={state} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => dialogRef.current?.close()} autoFocus>
              Keep deck
            </Button>
            <Button type="submit" disabled={pending} className="bg-wrong text-white hover:bg-wrong/90">
              {pending ? "Deleting…" : "Delete deck"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}

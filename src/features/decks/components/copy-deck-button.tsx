"use client";

import { Copy } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { idleState, type FormState } from "@/lib/forms";
import { copyDeck } from "../actions";

/** Copies a shared deck into your decks, then opens the copy. */
export function CopyDeckButton({ deckId, label = "Copy to my decks" }: { deckId: string; label?: string }) {
  const [state, formAction, pending] = useActionState<FormState>(() => copyDeck(deckId), idleState);

  return (
    <form action={formAction} className="space-y-3">
      <Button type="submit" size="lg" disabled={pending}>
        <Copy size={18} aria-hidden />
        {pending ? "Copying…" : label}
      </Button>
      <FormMessage state={state} />
    </form>
  );
}

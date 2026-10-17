"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import type { FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { deckSchema, type DeckInput, type SaveDeckResult } from "./schemas";
import { createStarterDeck } from "./starter";

/** Dashboard empty state: add the starter deck. */
export async function addStarterDeck(): Promise<FormState> {
  const error = await createStarterDeck();
  if (error) return { status: "error", message: error };
  refresh();
  return { status: "success", message: "Starter deck added." };
}

/** Creates or updates a deck and all its cards in one transaction (save_deck RPC). */
export async function saveDeck(input: DeckInput): Promise<SaveDeckResult> {
  await requireUser();
  const parsed = deckSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      errors[key] ??= issue.message;
    }
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }

  const { id, title, subject, description, colorKey, cards } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_deck", {
    p_deck_id: id,
    p_title: title,
    p_subject: subject,
    p_description: description,
    p_color_key: colorKey,
    p_cards: cards.map((c) => ({
      id: c.id,
      kind: c.kind,
      prompt: c.prompt,
      answer: c.answer,
      explanation: c.explanation || null,
    })),
  });

  if (error) {
    if (error.message === "set_full") return { ok: false, message: "A deck can have up to 500 cards." };
    if (error.message === "not_found") {
      return { ok: false, message: "This deck no longer exists, or a card was deleted somewhere else. Reload and try again." };
    }
    return { ok: false, message: "Couldn't save your deck. Please try again." };
  }

  redirect(`/decks/${data}`);
}

/** Deletes a deck. Its cards and review history are deleted with it (ON DELETE CASCADE). */
export async function deleteDeck(id: string): Promise<FormState> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("study_sets").delete().eq("id", id).select("id");
  if (error || !data?.length) return { status: "error", message: "Couldn't delete this deck. Please try again." };
  redirect("/decks");
}

/** Turns link sharing on or off for one of the player's decks. */
export async function setDeckSharing(id: string, shared: boolean): Promise<FormState> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_sets")
    .update({ visibility: shared ? "unlisted" : "private" })
    .eq("id", id)
    .select("id");
  if (error || !data?.length) return { status: "error", message: "Couldn't change sharing. Please try again." };
  refresh();
  return { status: "success", message: shared ? "Sharing is on." : "Sharing is off." };
}

/** Copies a shared deck into the player's decks and opens the copy. */
export async function copyDeck(id: string): Promise<FormState> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("copy_deck", { p_set_id: id });
  if (error) {
    if (error.message === "not_found") return { status: "error", message: "This deck isn't shared anymore." };
    return { status: "error", message: "Couldn't copy this deck. Please try again." };
  }
  redirect(`/decks/${data}`);
}

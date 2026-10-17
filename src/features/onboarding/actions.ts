"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import type { FormState } from "@/lib/forms";
import { HOME_ROUTE } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import { ONBOARDING_DONE, ONBOARDING_FIRST_DECK } from "./steps";

/** Moves onboarding_step forward to `step`. Never moves it back. Returns an error message or null. */
async function saveStep(step: number): Promise<string | null> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_step: step })
    .eq("id", user.id)
    .lt("onboarding_step", step);
  return error ? "Couldn't save your progress. Please try again." : null;
}

/** Step 1 → 2: the welcome has been seen. */
export async function finishWelcome(): Promise<FormState> {
  const error = await saveStep(ONBOARDING_FIRST_DECK);
  if (error) return { status: "error", message: error };
  refresh();
  return { status: "success" };
}

/** Skip, or start with no decks. */
export async function finishOnboarding(): Promise<FormState> {
  const error = await saveStep(ONBOARDING_DONE);
  if (error) return { status: "error", message: error };
  redirect(HOME_ROUTE);
}

/** "Make my own": finish onboarding and open the deck editor. */
export async function startWithOwnDeck(): Promise<FormState> {
  const error = await saveStep(ONBOARDING_DONE);
  if (error) return { status: "error", message: error };
  redirect("/decks/new");
}

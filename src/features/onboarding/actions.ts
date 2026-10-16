"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createStarterDeck } from "@/features/decks/starter";
import { requireUser } from "@/lib/auth/session";
import type { FormState } from "@/lib/forms";
import { HOME_ROUTE } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import { ONBOARDING_DONE, ONBOARDING_SHELF } from "./steps";

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
  const error = await saveStep(ONBOARDING_SHELF);
  if (error) return { status: "error", message: error };
  refresh();
  return { status: "success" };
}

/** Step 2 choice: add the starter deck, then go to the dashboard. */
export async function startWithStarterDeck(): Promise<FormState> {
  const error = (await createStarterDeck()) ?? (await saveStep(ONBOARDING_DONE));
  if (error) return { status: "error", message: error };
  redirect(HOME_ROUTE);
}

/** Skip, or "go to my dorm" with an empty shelf. */
export async function finishOnboarding(): Promise<FormState> {
  const error = await saveStep(ONBOARDING_DONE);
  if (error) return { status: "error", message: error };
  redirect(HOME_ROUTE);
}

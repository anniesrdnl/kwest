"use server";

import { refresh } from "next/cache";
import type { FormState } from "@/lib/forms";
import { createStarterDeck } from "./starter";

/** Dashboard empty state: add the starter deck. */
export async function addStarterDeck(): Promise<FormState> {
  const error = await createStarterDeck();
  if (error) return { status: "error", message: error };
  refresh();
  return { status: "success", message: "Starter deck added." };
}

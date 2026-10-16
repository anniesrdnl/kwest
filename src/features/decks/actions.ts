"use server";

import { refresh } from "next/cache";
import type { FormState } from "@/lib/forms";
import { createStarterDeck } from "./starter";

/** Dashboard empty state: put the starter deck on the shelf. */
export async function addStarterDeck(): Promise<FormState> {
  const error = await createStarterDeck();
  if (error) return { status: "error", message: error };
  refresh();
  return { status: "success", message: "The starter deck is on your shelf." };
}

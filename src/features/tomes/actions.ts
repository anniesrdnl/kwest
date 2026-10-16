"use server";

import { refresh } from "next/cache";
import type { FormState } from "@/lib/forms";
import { createStarterTome } from "./starter";

/** Dashboard empty state: put the starter tome on the shelf. */
export async function addStarterTome(): Promise<FormState> {
  const error = await createStarterTome();
  if (error) return { status: "error", message: error };
  refresh();
  return { status: "success", message: "The starter tome is on your shelf." };
}

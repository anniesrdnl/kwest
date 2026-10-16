import "server-only";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/** Calls the idempotent create_starter_tome() RPC. Returns an error message, or null on success. */
export async function createStarterTome(): Promise<string | null> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_starter_tome");
  return error ? "Couldn't add the starter tome. Please try again." : null;
}

import "server-only";
import { cache } from "react";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ChallengeLinkData } from "@/lib/types/database";

const CODE = /^[a-z0-9]{8}$/i;

/** A "beat my score" link with its cards and scoreboard, or null if it doesn't exist. */
export const getChallengeLink = cache(async (code: string): Promise<ChallengeLinkData | null> => {
  if (!CODE.test(code)) return null;
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_challenge_link", { p_code: code });
  if (error) throw new Error(`Could not load challenge link: ${error.message}`);
  return (data as unknown as ChallengeLinkData | null) ?? null;
});

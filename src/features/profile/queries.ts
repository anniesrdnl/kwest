import "server-only";
import { cache } from "react";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";

export type Player = {
  id: string;
  email: string | null;
  profile: Tables<"profiles">;
  stats: Tables<"player_stats">;
};

/** Current user's profile + stats. Redirects to /login when signed out. */
export const getPlayer = cache(async (): Promise<Player> => {
  const user = await requireUser();
  const supabase = await createClient();

  const [profile, stats] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("player_stats").select("*").eq("user_id", user.id).single(),
  ]);
  if (profile.error) throw new Error(`Could not load profile: ${profile.error.message}`);
  if (stats.error) throw new Error(`Could not load stats: ${stats.error.message}`);

  return { id: user.id, email: user.email, profile: profile.data, stats: stats.data };
});

import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LOGIN_ROUTE } from "@/lib/routes";

export type SessionUser = { id: string; email: string | null };

/**
 * The signed-in user, verified from the JWT (getClaims), or null.
 * Deduplicated per request. Reads cookies: call it inside a <Suspense> boundary.
 */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: data.claims.sub, email: typeof data.claims.email === "string" ? data.claims.email : null };
});

/** Use in protected pages and in every Server Action that needs a user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect(LOGIN_ROUTE);
  return user;
}

/** Only allow same-site relative redirects (blocks `//evil.com` and absolute URLs). */
export function safeNextPath(next: unknown, fallback: string): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}

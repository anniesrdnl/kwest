import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { env } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Create a new one per request. It reads cookies, so with Cache Components any
 * Server Component that calls it must render inside a <Suspense> boundary
 * (a loading.tsx file provides one for the whole route).
 */
export async function createClient() {
  // Database reads are per-user and per-request; never prerender them.
  // (Supabase also checks token expiry with Date.now(), which prerendering forbids.)
  await connection();
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't set cookies. Safe to ignore: proxy.ts
          // refreshes the session on every request.
        }
      },
    },
  });
}

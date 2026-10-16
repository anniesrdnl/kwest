import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { HOME_ROUTE, LOGIN_ROUTE, isAuthRoute, isPublicRoute } from "@/lib/routes";
import type { Database } from "@/lib/types/database";

/**
 * Refreshes the Supabase session cookie and applies route protection.
 * This is a convenience redirect only. Every Server Action and data read still
 * checks the user itself, and the database enforces Row Level Security.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Must run before any response is produced. Verifies the JWT and refreshes it if needed.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (path: string, params?: Record<string, string>) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    for (const [key, value] of Object.entries(params ?? {})) url.searchParams.set(key, value);
    const redirect = NextResponse.redirect(url);
    // Keep any refreshed auth cookies.
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  };

  if (!isSignedIn && !isPublicRoute(pathname) && !isAuthRoute(pathname)) {
    return redirectTo(LOGIN_ROUTE, { next: `${pathname}${search}` });
  }
  if (isSignedIn && isAuthRoute(pathname)) {
    return redirectTo(HOME_ROUTE);
  }

  return response;
}

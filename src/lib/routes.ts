/** Pages only for signed-out visitors. Signed-in users are sent to HOME_ROUTE. */
export const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"] as const;

/** Pages anyone can open. Everything not listed here or in AUTH_ROUTES requires sign-in. */
export const PUBLIC_ROUTES = ["/", "/auth", "/reset-password"] as const;

export const HOME_ROUTE = "/home";
export const LOGIN_ROUTE = "/login";

function matches(pathname: string, routes: readonly string[]) {
  return routes.some((route) =>
    route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`),
  );
}

export const isAuthRoute = (pathname: string) => matches(pathname, AUTH_ROUTES);
export const isPublicRoute = (pathname: string) => matches(pathname, PUBLIC_ROUTES);

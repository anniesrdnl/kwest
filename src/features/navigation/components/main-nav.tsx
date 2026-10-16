"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DESKTOP_NAV, MOBILE_NAV, isActive } from "../nav-items";

// usePathname can suspend on routes with dynamic params (Cache Components),
// so the layout wraps these in <Suspense> and uses the *Links components with
// pathname={null} (no active state) as the fallback.

export function DesktopNav() {
  return <DesktopNavLinks pathname={usePathname()} />;
}

export function DesktopNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {DESKTOP_NAV.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative inline-flex min-h-11 items-center px-3 font-pixel text-sm hover:text-accent-ink ${
              active ? "text-accent-ink" : ""
            }`}
          >
            {label}
            {active && <span aria-hidden className="absolute inset-x-3 bottom-1 h-1 bg-accent" />}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileTabBar() {
  return <MobileTabBarLinks pathname={usePathname()} />;
}

export function MobileTabBarLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 font-pixel text-xs ${
                  active ? "bg-surface-2 text-accent-ink" : "text-text-muted hover:text-text"
                }`}
              >
                {active && <span aria-hidden className="absolute inset-x-3 top-0 h-1 bg-accent" />}
                <Icon size={20} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

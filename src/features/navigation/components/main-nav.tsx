"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "../nav-items";

// usePathname can suspend on routes with dynamic params (Cache Components),
// so the layout wraps these in <Suspense> and uses the *Links components with
// pathname={null} (no active state) as the fallback.

export function DesktopNav() {
  return <DesktopNavLinks pathname={usePathname()} />;
}

export function DesktopNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {NAV_ITEMS.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative inline-flex h-16 items-center px-3 text-[15px] transition-colors ${
              active ? "font-semibold text-text" : "font-medium text-text-muted hover:text-text"
            }`}
          >
            {label}
            {active && <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-progress" />}
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
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 text-xs ${
                  active ? "font-semibold text-text" : "font-medium text-text-muted"
                }`}
              >
                {active && <span aria-hidden className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-progress" />}
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

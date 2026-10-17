"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PixelIcon } from "@/components/brand/pixel";
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
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-10 items-center gap-2 px-3 font-pixel text-base tracking-wide transition-colors ${
              active ? "bg-secondary text-secondary-fg" : "text-text-muted hover:bg-surface-2 hover:text-text"
            }`}
          >
            <PixelIcon name={icon} scale={2} />
            {label}
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
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${
                  active ? "font-semibold text-text" : "font-medium text-text-muted"
                }`}
              >
                <span
                  className={`inline-flex h-7 w-11 items-center justify-center transition-colors ${
                    active ? "bg-secondary text-secondary-fg" : ""
                  }`}
                >
                  <PixelIcon name={Icon} scale={2} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

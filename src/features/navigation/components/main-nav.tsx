"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/brand/nav-icon";
import { NAV_ITEMS, isActive } from "../nav-items";

// usePathname can suspend on routes with dynamic params (Cache Components),
// so the layout wraps these in <Suspense> and uses the *Links components with
// pathname={null} (no active state) as the fallback.

export function DesktopNav() {
  return <DesktopNavLinks pathname={usePathname()} />;
}

/**
 * Light tab effects: on hover the picture lifts 1px and a thin soft line slides in underneath.
 * The page you are on keeps a blush line. A click nudges the tab down 1px.
 * Below the lg size only the icons show (the names stay for screen readers).
 */
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
            className={`group relative inline-flex h-16 items-center gap-2.5 px-3 font-label text-base text-text transition-[translate] duration-150 active:translate-y-px ${active ? "font-semibold" : "font-medium"}`}
          >
            <NavIcon
              name={icon}
              scale={2}
              className="transition-[translate] duration-150 group-hover:-translate-y-px"
            />
            <span className="sr-only lg:not-sr-only">{label}</span>
            <span
              aria-hidden
              className={`absolute inset-x-3 -bottom-0.5 h-0.5 origin-left transition-transform duration-200 ease-out ${
                active ? "scale-x-100 bg-accent" : "scale-x-0 bg-accent/60 group-hover:scale-x-100"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileTabBar() {
  return <MobileTabBarLinks pathname={usePathname()} />;
}

/** The phone tab bar: the current page gets bold text and a thin line above it. */
export function MobileTabBarLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 bg-bg pb-[env(safe-area-inset-bottom)] before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-4 before:bg-linear-to-t before:from-bg before:to-transparent md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-16 flex-col items-center justify-center gap-1 font-label text-xs text-text transition-[translate] duration-150 active:translate-y-px ${
                  active ? "font-semibold" : "font-medium"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-4 -top-0.5 h-0.5 transition-colors duration-150 ${active ? "bg-accent" : "bg-transparent"}`}
                />
                <NavIcon name={icon} scale={2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

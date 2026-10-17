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

/**
 * Tabs drawn as keycaps: raised with a thick bottom edge, they press down when clicked.
 * The page you are on stays pressed in and blush. Below the lg size only the icons show.
 */
export function DesktopNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Main" className="hidden items-center gap-2 md:flex">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group inline-flex h-10 items-center gap-2 border-2 px-2.5 font-pixel text-base whitespace-nowrap transition-[background-color,border-color,color,translate,box-shadow] duration-150 ease-out lg:px-3 ${
              active
                ? "translate-y-[3px] border-border-strong bg-accent text-accent-fg"
                : "border-border bg-surface text-text-muted shadow-[0_3px_0_0_var(--shadow-soft)] hover:border-border-strong hover:bg-track hover:text-text active:translate-y-[3px] active:shadow-none"
            }`}
          >
            <PixelIcon name={icon} scale={2} className="transition-transform duration-150 group-hover:-translate-y-0.5" />
            <span className="sr-only lg:not-sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileTabBar() {
  return <MobileTabBarLinks pathname={usePathname()} />;
}

/** On phones the tabs float at the bottom like a game hotbar. The current page's icon sits on a blush block. */
export function MobileTabBarLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 md:hidden"
    >
      <div className="pixel-lift">
        <ul className="pixel-frame mx-auto grid max-w-md grid-cols-5 gap-1 p-1.5">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-14 flex-col items-center justify-center gap-1 text-xs transition-[translate] duration-150 active:translate-y-0.5 ${
                    active ? "font-semibold text-text" : "font-medium text-text-muted"
                  }`}
                >
                  <span
                    className={`inline-flex h-7 w-12 items-center justify-center transition-colors duration-150 ${
                      active ? "bg-accent text-accent-fg" : "group-hover:bg-track"
                    }`}
                  >
                    <PixelIcon name={icon} scale={2} className="transition-transform duration-150 group-hover:-translate-y-0.5" />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

import type { NavIconName } from "@/components/brand/nav-icon";
import { HOME_ROUTE } from "@/lib/routes";

export type NavItem = { href: string; label: string; icon: NavIconName };

/** Main navigation. Desktop shows it in the top bar, mobile as a bottom tab bar. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: HOME_ROUTE, label: "Home", icon: "home" },
  { href: "/decks", label: "Decks", icon: "decks" },
  { href: "/play", label: "Study", icon: "study" },
  { href: "/shop", label: "Shop", icon: "shop" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export function isActive(pathname: string | null, href: string): boolean {
  return pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
}

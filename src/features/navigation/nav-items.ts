import { BedDouble, Gamepad2, House, Library, Map, Store, User, type LucideIcon } from "lucide-react";
import { HOME_ROUTE } from "@/lib/routes";

export type NavItem = { href: string; label: string; icon: LucideIcon };

/** Desktop top bar. Routes not built yet open a "Coming in Phase X" page. */
export const DESKTOP_NAV: readonly NavItem[] = [
  { href: HOME_ROUTE, label: "Home", icon: House },
  { href: "/decks", label: "Decks", icon: Library },
  { href: "/world", label: "World", icon: Map },
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/profile", label: "Profile", icon: User },
];

/** Mobile bottom tab bar. */
export const MOBILE_NAV: readonly NavItem[] = [
  { href: HOME_ROUTE, label: "Home", icon: House },
  { href: "/decks", label: "Decks", icon: Library },
  { href: "/play", label: "Play", icon: Gamepad2 },
  { href: "/room", label: "Room", icon: BedDouble },
  { href: "/profile", label: "Me", icon: User },
];

export function isActive(pathname: string | null, href: string): boolean {
  return pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
}

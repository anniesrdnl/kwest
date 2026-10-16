import { BookOpen, House, Layers, User, type LucideIcon } from "lucide-react";
import { HOME_ROUTE } from "@/lib/routes";

export type NavItem = { href: string; label: string; icon: LucideIcon };

/** Main navigation. Desktop shows it in the top bar, mobile as a bottom tab bar. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: HOME_ROUTE, label: "Home", icon: House },
  { href: "/decks", label: "Decks", icon: Layers },
  { href: "/play", label: "Study", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
];

export function isActive(pathname: string | null, href: string): boolean {
  return pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
}

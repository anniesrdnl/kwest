"use client";

import Link from "next/link";
import { readSearchParam, useBrowserValue } from "@/lib/hooks/use-browser-value";

const readNext = readSearchParam("next");

/** Link between log in and sign up that keeps ?next=, so a shared link still opens afterwards. */
export function AuthSwitchLink({ href, children }: { href: "/login" | "/signup"; children: React.ReactNode }) {
  const next = useBrowserValue(readNext);
  return (
    <Link href={next ? `${href}?next=${encodeURIComponent(next)}` : href} className="px-1 py-0.5 text-text underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:bg-track active:bg-accent">
      {children}
    </Link>
  );
}

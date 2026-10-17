"use client";

import Link from "next/link";
import { readSearchParam, useBrowserValue } from "@/lib/hooks/use-browser-value";

const readNext = readSearchParam("next");

/** Link between log in and sign up that keeps ?next=, so a shared link still opens afterwards. */
export function AuthSwitchLink({ href, children }: { href: "/login" | "/signup"; children: React.ReactNode }) {
  const next = useBrowserValue(readNext);
  return (
    <Link href={next ? `${href}?next=${encodeURIComponent(next)}` : href} className="text-text underline underline-offset-4">
      {children}
    </Link>
  );
}

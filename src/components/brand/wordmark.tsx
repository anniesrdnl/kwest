import Link from "next/link";

/** Logo mark: two stacked cards. */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden>
      <rect x="7" y="3" width="17" height="20" rx="4" fill="var(--secondary)" stroke="var(--accent)" strokeOpacity="0.25" />
      <rect x="4" y="6" width="17" height="20" rx="4" fill="var(--accent)" />
      <rect x="8" y="12" width="9" height="2" rx="1" fill="var(--secondary)" />
      <rect x="8" y="17" width="6" height="2" rx="1" fill="var(--secondary)" opacity="0.8" />
    </svg>
  );
}

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-2 rounded-lg text-lg font-bold tracking-tight">
      <LogoMark />
      Kwest
    </Link>
  );
}

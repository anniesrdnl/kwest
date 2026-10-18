import Link from "next/link";

/** Logo mark: two stacked cards, drawn on a pixel grid. */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden shapeRendering="crispEdges">
      <rect x="4" y="1" width="9" height="10" fill="var(--secondary)" stroke="var(--ink)" strokeWidth="1" />
      <rect x="1" y="3" width="9" height="10" fill="var(--accent)" stroke="var(--ink)" strokeWidth="1" />
      <rect x="3" y="6" width="5" height="1" fill="var(--accent-fg)" />
      <rect x="3" y="9" width="3" height="1" fill="var(--accent-fg)" />
    </svg>
  );
}

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-2 rounded-lg font-pixel text-2xl tracking-wide">
      <LogoMark />
      Kwest
    </Link>
  );
}

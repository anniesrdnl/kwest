import Link from "next/link";

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center rounded-lg font-pixel text-2xl tracking-wide">
      Kwest
    </Link>
  );
}

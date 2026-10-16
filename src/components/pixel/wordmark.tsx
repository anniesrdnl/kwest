import Link from "next/link";
import { PixelBook } from "./pixel-book";

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-pixel text-xl font-bold tracking-wide">
      <PixelBook className="h-7 w-8" label="" />
      KWEST
    </Link>
  );
}

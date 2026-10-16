import Link from "next/link";
import { Suspense } from "react";
import { Coins } from "lucide-react";
import { Wordmark } from "@/components/pixel/wordmark";
import { LogOutButton } from "@/features/auth/components/log-out-button";
import { getPlayer } from "@/features/profile/queries";
import { XpBar } from "@/features/progression/components/xp-bar";
import { HOME_ROUTE } from "@/lib/routes";

// Shell for signed-in pages. The header renders instantly; the player chip
// reads the session, so it streams in behind its own <Suspense>.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b-2 border-border bg-surface">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <Wordmark href={HOME_ROUTE} />
          <nav aria-label="Main" className="flex items-center gap-1">
            <NavLink href={HOME_ROUTE}>Home</NavLink>
            <NavLink href="/profile">Profile</NavLink>
          </nav>
          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="h-5 w-40 animate-pulse bg-surface-2" />}>
              <PlayerChip />
            </Suspense>
            <LogOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center px-3 font-pixel text-sm hover:text-accent">
      {children}
    </Link>
  );
}

async function PlayerChip() {
  const { stats } = await getPlayer();
  return (
    <div className="flex items-center gap-4">
      <XpBar xpTotal={stats.xp_total} compact />
      <span className="inline-flex items-center gap-1 font-pixel text-sm" aria-label={`${stats.coins} coins`}>
        <Coins size={16} className="text-gold" aria-hidden />
        {stats.coins}
      </span>
    </div>
  );
}

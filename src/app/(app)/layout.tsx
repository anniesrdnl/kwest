import Link from "next/link";
import { Suspense } from "react";
import { Coins } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { LogOutButton } from "@/features/auth/components/log-out-button";
import {
  DesktopNav,
  DesktopNavLinks,
  MobileTabBar,
  MobileTabBarLinks,
} from "@/features/navigation/components/main-nav";
import { getPlayer } from "@/features/profile/queries";
import { UserAvatar, lookOf } from "@/features/shop/avatar";
import { XpBar } from "@/features/progression/components/xp-bar";
import { HOME_ROUTE } from "@/lib/routes";

// Shell for signed-in pages. The header renders instantly; the player chip
// reads the session, so it streams in behind its own <Suspense>.
// Desktop: top bar with links. Mobile: slim sticky header + bottom tab bar.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-6 px-4 md:h-16">
          <div className="flex items-center gap-6">
            <Wordmark href={HOME_ROUTE} />
            <Suspense fallback={<DesktopNavLinks pathname={null} />}>
              <DesktopNav />
            </Suspense>
          </div>
          <div className="flex items-center gap-3">
            <Suspense fallback={<div className="h-5 w-28 animate-pulse rounded-md bg-surface-2" />}>
              <PlayerChip />
            </Suspense>
            {/* On mobile, log out lives on the Profile page. */}
            <div className="hidden md:block">
              <LogOutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 md:pt-10 md:pb-12">{children}</main>
      <Suspense fallback={<MobileTabBarLinks pathname={null} />}>
        <MobileTabBar />
      </Suspense>
    </div>
  );
}

async function PlayerChip() {
  const { profile, stats } = await getPlayer();
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <XpBar xpTotal={stats.xp_total} compact />
      <span className="inline-flex items-center gap-1 text-sm font-medium tabular-nums" aria-label={`${stats.coins} coins`}>
        <Coins size={16} className="text-gold" aria-hidden />
        {stats.coins}
      </span>
      <Link href="/profile" aria-label="Your profile" className="inline-flex size-11 items-center justify-center rounded-lg">
        <UserAvatar name={profile.display_name} look={lookOf(profile)} size="sm" />
      </Link>
    </div>
  );
}

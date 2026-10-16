import { Suspense } from "react";
import { Coins } from "lucide-react";
import { Wordmark } from "@/components/pixel/wordmark";
import { LogOutButton } from "@/features/auth/components/log-out-button";
import {
  DesktopNav,
  DesktopNavLinks,
  MobileTabBar,
  MobileTabBarLinks,
} from "@/features/navigation/components/main-nav";
import { getPlayer } from "@/features/profile/queries";
import { XpBar } from "@/features/progression/components/xp-bar";
import { HOME_ROUTE } from "@/lib/routes";

// Shell for signed-in pages. The header renders instantly; the player chip
// reads the session, so it streams in behind its own <Suspense>.
// Desktop: top bar with links. Mobile: compact sticky header + bottom tab bar.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b-2 border-border bg-surface">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-x-6 px-4 py-1.5 md:py-3">
          <Wordmark href={HOME_ROUTE} />
          <Suspense fallback={<DesktopNavLinks pathname={null} />}>
            <DesktopNav />
          </Suspense>
          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="h-5 w-28 animate-pulse bg-surface-2 md:w-40" />}>
              <PlayerChip />
            </Suspense>
            {/* On mobile, log out lives on the Me (profile) page. */}
            <div className="hidden md:block">
              <LogOutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 md:py-8">{children}</main>
      <Suspense fallback={<MobileTabBarLinks pathname={null} />}>
        <MobileTabBar />
      </Suspense>
    </div>
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

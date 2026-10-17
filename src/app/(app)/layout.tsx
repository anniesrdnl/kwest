import Link from "next/link";
import { Suspense } from "react";
import { PixelWordmark } from "@/components/brand/pixel-word";
import { LogOutButton } from "@/features/auth/components/log-out-button";
import {
  DesktopNav,
  DesktopNavLinks,
  MobileTabBar,
  MobileTabBarLinks,
} from "@/features/navigation/components/main-nav";
import {
  PlayerPlate,
  PlayerPlateSkeleton,
} from "@/features/navigation/components/player-plate";
import { HOME_ROUTE } from "@/lib/routes";

// Shell for signed-in pages. The nav floats as a pixel "dock" that stays at the top.
// The player plate reads the session, so it streams in behind its own <Suspense>.
// Desktop: dock with keycap tabs. Mobile: slim dock on top + a hotbar of tabs at the bottom.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 pt-3">
        <div className="mx-auto max-w-5xl px-4">
          <div className="pixel-lift">
            <div className="pixel-frame flex h-14 items-center gap-3 px-3 md:gap-4 md:px-4">
              <Link
                href={HOME_ROUTE}
                aria-label="Kwest, home"
                className="group inline-flex min-h-11 items-center px-1 transition-[translate] duration-150 active:translate-y-px"
              >
                <PixelWordmark unit={3} />
              </Link>
              <Suspense fallback={<DesktopNavLinks pathname={null} />}>
                <DesktopNav />
              </Suspense>
              <div className="ml-auto flex items-center gap-2 md:gap-3">
                <Suspense fallback={<PlayerPlateSkeleton />}>
                  <PlayerPlate />
                </Suspense>
                {/* On mobile, log out lives on the Profile page. */}
                <div className="hidden md:block">
                  <LogOutButton compact />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 md:pt-8 md:pb-12">
        {children}
      </main>
      <Suspense fallback={<MobileTabBarLinks pathname={null} />}>
        <MobileTabBar />
      </Suspense>
    </div>
  );
}

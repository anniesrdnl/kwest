import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PixelBackdrop } from "@/components/brand/pixel-backdrop";
import { AllCaughtUpCard, NextUpCard, NoDecksCard } from "@/features/dashboard/components/next-up-card";
import { RecentDecks } from "@/features/dashboard/components/recent-decks";
import { CoinsTile, GoalTile, LevelTile } from "@/features/dashboard/components/stat-tiles";
import { getDashboard } from "@/features/dashboard/queries";
import { isOnboarded } from "@/features/onboarding/steps";
import { getPlayer } from "@/features/profile/queries";
import { ONBOARDING_ROUTE } from "@/lib/routes";

export const metadata: Metadata = { title: "Home" };

/** "Good morning" and so on, by the hour in the player's own time zone. Late at night it just says Hi. */
function greeting(timeZone: string): string {
  let hour: number;
  try {
    hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone }).format(new Date()));
  } catch {
    hour = new Date().getHours();
  }
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  if (hour >= 18 && hour < 23) return "Good evening";
  return "Hi";
}

function today(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", timeZone }).format(new Date());
  } catch {
    return new Date().toDateString();
  }
}

// Renders inside home/loading.tsx's Suspense. A quest board: greeting, today's quest (the one main
// action), three stat tiles that each open the page where you can act on them, then recent decks.
// The animated backdrop is fixed behind the whole screen and hides with the page.
export default async function HomePage() {
  const { profile } = await getPlayer();
  if (!isOnboarded(profile.onboarding_step)) redirect(ONBOARDING_ROUTE);

  const { player, decks, nextUp, dailyGoal } = await getDashboard();
  const timeZone = player.profile.timezone;

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <PixelBackdrop calm />
      </div>

      <div className="space-y-8">
        <header className="rise min-w-0 space-y-1">
          <h1 className="text-2xl break-words sm:text-[2rem] sm:leading-tight">
            {greeting(timeZone)}, {player.profile.display_name}
          </h1>
          <p className="text-text-muted">{today(timeZone)}</p>
        </header>

        {decks.length === 0 ? <NoDecksCard /> : nextUp ? <NextUpCard nextUp={nextUp} /> : <AllCaughtUpCard decks={decks} timeZone={timeZone} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GoalTile dailyGoal={dailyGoal} delay={0.2} />
          <LevelTile xpTotal={player.stats.xp_total} delay={0.3} />
          <CoinsTile coins={player.stats.coins} delay={0.4} />
        </div>

        {decks.length > 0 && <RecentDecks decks={decks} />}
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Coins } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { DailyGoalCard } from "@/features/dashboard/components/daily-goal-card";
import { AllCaughtUpCard, NextUpCard, NoDecksCard } from "@/features/dashboard/components/next-up-card";
import { RecentDecks } from "@/features/dashboard/components/recent-decks";
import { getDashboard } from "@/features/dashboard/queries";
import { isOnboarded } from "@/features/onboarding/steps";
import { getPlayer } from "@/features/profile/queries";
import { XpBar } from "@/features/progression/components/xp-bar";
import { ONBOARDING_ROUTE } from "@/lib/routes";

export const metadata: Metadata = { title: "Home" };

// Renders inside home/loading.tsx's Suspense.
// Mobile: one column (Next up, daily goal, progress, recent decks).
// Desktop: Next up on the left, daily goal and progress on the right.
export default async function HomePage() {
  const { profile } = await getPlayer();
  if (!isOnboarded(profile.onboarding_step)) redirect(ONBOARDING_ROUTE);

  const { player, decks, nextUp, dailyGoal } = await getDashboard();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold md:text-3xl">Hi, {player.profile.display_name}</h1>

      <div className="grid gap-4 md:grid-cols-[3fr_2fr] md:gap-6">
        <div className="md:row-span-2">
          {decks.length === 0 ? (
            <NoDecksCard />
          ) : nextUp ? (
            <NextUpCard nextUp={nextUp} />
          ) : (
            <AllCaughtUpCard decks={decks} timeZone={player.profile.timezone} />
          )}
        </div>
        <DailyGoalCard dailyGoal={dailyGoal} />
        <Panel title="Progress">
          <div className="space-y-4">
            <XpBar xpTotal={player.stats.xp_total} />
            <p className="flex items-center gap-2 text-sm">
              <Coins size={18} className="text-gold" aria-hidden />
              <span className="font-semibold tabular-nums">{player.stats.coins}</span>
              <span className="text-text-muted">coins</span>
            </p>
          </div>
        </Panel>
      </div>

      {decks.length > 0 && <RecentDecks decks={decks} />}
    </div>
  );
}

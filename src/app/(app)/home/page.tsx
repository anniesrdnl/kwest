import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PixelIcon } from "@/components/brand/pixel";
import { Panel } from "@/components/ui/panel";
import { DailyGoalCard } from "@/features/dashboard/components/daily-goal-card";
import { AllCaughtUpCard, NextUpCard, NoDecksCard } from "@/features/dashboard/components/next-up-card";
import { RecentDecks } from "@/features/dashboard/components/recent-decks";
import { getDashboard } from "@/features/dashboard/queries";
import { isOnboarded } from "@/features/onboarding/steps";
import { getPlayer } from "@/features/profile/queries";
import { UserAvatar, lookOf } from "@/features/shop/avatar";
import { XpBar } from "@/features/progression/components/xp-bar";
import { ONBOARDING_ROUTE } from "@/lib/routes";

export const metadata: Metadata = { title: "Home" };

// Renders inside home/loading.tsx's Suspense.
// Hierarchy: the "Continue studying" card is the one main action (full width),
// then daily goal and progress side by side, then recent decks.
export default async function HomePage() {
  const { profile } = await getPlayer();
  if (!isOnboarded(profile.onboarding_step)) redirect(ONBOARDING_ROUTE);

  const { player, decks, nextUp, dailyGoal } = await getDashboard();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <UserAvatar name={player.profile.display_name} look={lookOf(player.profile)} size="md" />
        <h1 className="text-2xl font-bold md:text-3xl">Hi, {player.profile.display_name}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <div className="md:col-span-2">
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
              <PixelIcon name="coin" scale={2} className="text-gold" />
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

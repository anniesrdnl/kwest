import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Coins } from "lucide-react";
import { RoomScene } from "@/components/pixel/room-scene";
import { Panel } from "@/components/ui/panel";
import { EmptyShelfCard } from "@/features/dashboard/components/empty-shelf-card";
import { LanternMeter } from "@/features/dashboard/components/lantern-meter";
import { AllDustedCard, NextUpCard } from "@/features/dashboard/components/next-up-card";
import { RecentDecks } from "@/features/dashboard/components/recent-decks";
import { getDashboard } from "@/features/dashboard/queries";
import { isOnboarded } from "@/features/onboarding/steps";
import { getPlayer } from "@/features/profile/queries";
import { XpBar } from "@/features/progression/components/xp-bar";
import { ONBOARDING_ROUTE } from "@/lib/routes";

export const metadata: Metadata = { title: "Home" };

// Renders inside home/loading.tsx's Suspense.
// Mobile order follows the DOM: Next up, Lantern, room strip, progress, decks.
// Desktop (md+): room on the left, Next up / Lantern / progress on the right.
export default async function HomePage() {
  const { profile } = await getPlayer();
  if (!isOnboarded(profile.onboarding_step)) redirect(ONBOARDING_ROUTE);

  const { player, decks, nextUp, lantern } = await getDashboard();
  const spines = decks.map((t) => t.colorKey);

  return (
    <div className="space-y-6">
      <h1 className="font-pixel text-2xl md:text-3xl">Hi, {player.profile.display_name}</h1>

      <div className="grid gap-6 md:grid-cols-[3fr_2fr] md:items-start">
        <div className="md:col-start-2 md:row-start-1">
          {decks.length === 0 ? (
            <EmptyShelfCard />
          ) : nextUp ? (
            <NextUpCard nextUp={nextUp} />
          ) : (
            <AllDustedCard decks={decks} timeZone={player.profile.timezone} />
          )}
        </div>

        <div className="md:col-start-2 md:row-start-2">
          <LanternMeter lantern={lantern} />
        </div>

        <figure className="space-y-2 md:col-start-1 md:row-span-3 md:row-start-1">
          <div className="overflow-hidden bg-surface pixel-border">
            <RoomScene spines={spines} compact className="h-28 md:hidden" />
            <RoomScene spines={spines} className="hidden md:block" />
          </div>
          <figcaption className="text-sm text-text-muted">Your dorm. Decorating opens in a later update.</figcaption>
        </figure>

        <div className="md:col-start-2 md:row-start-3">
          <Panel title="Progress">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <XpBar xpTotal={player.stats.xp_total} />
              <span className="inline-flex items-center gap-1 font-pixel">
                <Coins size={18} className="text-gold" aria-hidden />
                {player.stats.coins} <span className="text-sm text-text-muted">coins</span>
              </span>
            </div>
          </Panel>
        </div>
      </div>

      {decks.length > 0 && <RecentDecks decks={decks} />}
    </div>
  );
}

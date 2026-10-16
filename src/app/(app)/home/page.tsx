import type { Metadata } from "next";
import { Panel } from "@/components/ui/panel";
import { getPlayer } from "@/features/profile/queries";
import { XpBar } from "@/features/progression/components/xp-bar";

export const metadata: Metadata = { title: "Home" };

// Placeholder until the dashboard (Phase 7). Renders inside (app)/loading.tsx's Suspense.
export default async function HomePage() {
  const { profile, stats } = await getPlayer();

  return (
    <div className="space-y-6">
      <h1 className="font-pixel text-3xl">Welcome, {profile.display_name}</h1>
      <Panel title="Your progress">
        <div className="space-y-3">
          <XpBar xpTotal={stats.xp_total} />
          <p className="text-text-muted">
            The dashboard, your room and study sets arrive in the next phases.
          </p>
        </div>
      </Panel>
    </div>
  );
}

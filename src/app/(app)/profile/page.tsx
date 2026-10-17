import type { Metadata } from "next";
import Link from "next/link";
import { Coins } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { LogOutButton } from "@/features/auth/components/log-out-button";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { DailyGoalForm } from "@/features/profile/components/daily-goal-form";
import { InstallApp } from "@/features/profile/components/install-app";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getPlayer } from "@/features/profile/queries";
import { UserAvatar, lookOf } from "@/features/shop/avatar";
import { AchievementList } from "@/features/progression/components/achievement-list";
import { WeekChart } from "@/features/progression/components/week-chart";
import { XpBar } from "@/features/progression/components/xp-bar";
import { getProgressOverview } from "@/features/progression/queries";

export const metadata: Metadata = { title: "Profile" };

// Progress first (what you've done), settings below (what you can change).
export default async function ProfilePage() {
  const [{ email, profile, stats }, overview] = await Promise.all([getPlayer(), getProgressOverview()]);
  const joined = new Date(profile.created_at).toLocaleDateString("en", { month: "long", year: "numeric" });

  const tiles = [
    { label: "Cards reviewed", value: overview.cardsReviewed },
    { label: "Sessions", value: overview.sessions },
    { label: "Goal days", value: overview.goalDays },
    { label: "Decks mastered", value: overview.decksMastered },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="flex items-center gap-4">
        <UserAvatar name={profile.display_name} look={lookOf(profile)} size="lg" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold break-words md:text-3xl">{profile.display_name}</h1>
          <p className="text-sm text-text-muted">
            {profile.username && <>@{profile.username} · </>}Studying since {joined}
          </p>
          <Link href="/shop" className="text-sm font-semibold underline decoration-progress decoration-2 underline-offset-4">
            Change avatar
          </Link>
        </div>
      </header>

      <section aria-labelledby="progress-heading" className="space-y-4">
        <h2 id="progress-heading" className="sr-only">
          Progress
        </h2>
        <Panel>
          <div className="space-y-4">
            <XpBar xpTotal={stats.xp_total} />
            <p className="flex items-center gap-2 text-sm">
              <Coins size={18} className="text-gold" aria-hidden />
              <span className="font-semibold tabular-nums">{stats.coins}</span>
              <span className="text-text-muted">coins</span>
            </p>
          </div>
        </Panel>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-surface p-4">
              <dt className="text-sm text-text-muted">{label}</dt>
              <dd className="text-2xl font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <Panel>
          <WeekChart week={overview.week} goal={stats.daily_goal} />
        </Panel>
      </section>

      <AchievementList achievements={overview.achievements} timeZone={profile.timezone} />

      <section aria-labelledby="settings-heading" className="space-y-4">
        <h2 id="settings-heading" className="text-lg font-semibold">
          Settings
        </h2>
        <Panel title="Daily goal">
          <DailyGoalForm goal={stats.daily_goal} />
        </Panel>
        <Panel title="Profile">
          <ProfileForm displayName={profile.display_name} username={profile.username} />
        </Panel>
        <Panel title="Account">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <dt className="text-sm font-medium">Email</dt>
            <dd className="break-all">{email ?? "—"}</dd>
          </dl>
        </Panel>
        <InstallApp />
        <Panel title="Change password">
          <ResetPasswordForm />
        </Panel>
        <div className="flex justify-end">
          <LogOutButton />
        </div>
      </section>
    </div>
  );
}

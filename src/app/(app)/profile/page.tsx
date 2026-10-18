import type { Metadata } from "next";
import Link from "next/link";
import { PixelIcon } from "@/components/brand/pixel";
import { Panel } from "@/components/ui/panel";
import { SettingsList, SettingsSection } from "@/components/ui/settings-list";
import { StatRow } from "@/components/ui/stat-row";
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
      <header className="rise flex items-center gap-4">
        <UserAvatar name={profile.display_name} look={lookOf(profile)} size="lg" />
        <div className="min-w-0">
          <h1 className="text-2xl break-words sm:text-[2rem] sm:leading-tight">{profile.display_name}</h1>
          <p className="text-sm text-text-muted">
            {profile.username && <>@{profile.username} · </>}Studying since {joined}
          </p>
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center text-sm font-medium text-accent-ink underline underline-offset-4 transition-colors hover:text-text"
          >
            Change avatar
          </Link>
        </div>
      </header>

      <section aria-labelledby="progress-heading" className="rise space-y-5" style={{ animationDelay: "0.05s" }}>
        <h2 id="progress-heading" className="sr-only">
          Progress
        </h2>
        <Panel>
          <div className="space-y-4">
            <XpBar xpTotal={stats.xp_total} />
            <p className="flex items-center gap-2 text-sm">
              <PixelIcon name="coin" scale={2} className="text-gold" />
              <span className="font-semibold tabular-nums">{stats.coins}</span>
              <span className="text-text-muted">coins</span>
            </p>
          </div>
        </Panel>

        <StatRow items={tiles} />

        <Panel>
          <WeekChart week={overview.week} goal={stats.daily_goal} />
        </Panel>
      </section>

      <div className="rise" style={{ animationDelay: "0.1s" }}>
        <AchievementList achievements={overview.achievements} timeZone={profile.timezone} />
      </div>

      <section aria-labelledby="settings-heading" className="rise space-y-4" style={{ animationDelay: "0.15s" }}>
        <h2 id="settings-heading" className="text-2xl">
          Settings
        </h2>
        <SettingsList>
          <SettingsSection title="Daily goal">
            <DailyGoalForm goal={stats.daily_goal} />
          </SettingsSection>
          <SettingsSection title="Profile">
            <ProfileForm displayName={profile.display_name} username={profile.username} />
          </SettingsSection>
          <SettingsSection title="Account">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="text-sm font-medium">Email</dt>
              <dd className="break-all">{email ?? "—"}</dd>
            </dl>
          </SettingsSection>
          <InstallApp />
          <SettingsSection title="Change password">
            <ResetPasswordForm />
          </SettingsSection>
        </SettingsList>
        <div className="flex justify-end">
          <LogOutButton />
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { Panel } from "@/components/ui/panel";
import { LogOutButton } from "@/features/auth/components/log-out-button";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getPlayer } from "@/features/profile/queries";
import { XpBar } from "@/features/progression/components/xp-bar";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { email, profile, stats } = await getPlayer();
  const joined = new Date(profile.created_at).toLocaleDateString("en", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{profile.display_name}</h1>
        <XpBar xpTotal={stats.xp_total} />
        <p className="text-sm text-text-muted">Studying since {joined}</p>
      </header>

      <Panel title="Profile">
        <ProfileForm displayName={profile.display_name} username={profile.username} />
      </Panel>

      <Panel title="Account">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt className="text-sm font-medium">Email</dt>
          <dd className="break-all">{email ?? "—"}</dd>
        </dl>
      </Panel>

      <Panel title="Change password">
        <ResetPasswordForm />
      </Panel>

      <div className="flex justify-end">
        <LogOutButton />
      </div>
    </div>
  );
}

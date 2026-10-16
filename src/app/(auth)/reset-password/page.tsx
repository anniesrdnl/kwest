import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { getUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Choose a new password" };

// Reached from the reset email: /auth/callback signs the user in, then sends them here.
export default function ResetPasswordPage() {
  return (
    <AuthCard title="Choose a new password">
      <Suspense fallback={<p className="text-text-muted">Checking your link…</p>}>
        <ResetGate />
      </Suspense>
    </AuthCard>
  );
}

async function ResetGate() {
  const user = await getUser();
  if (!user) {
    return (
      <div className="space-y-5">
        <p className="text-text-muted">This reset link has expired or was already used.</p>
        <ButtonLink href="/forgot-password" size="lg" className="w-full">
          Request a new link
        </ButtonLink>
      </div>
    );
  }
  return <ResetPasswordForm />;
}

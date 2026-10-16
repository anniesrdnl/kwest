import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShelfStep } from "@/features/onboarding/components/shelf-step";
import { WelcomeStep } from "@/features/onboarding/components/welcome-step";
import { finishOnboarding } from "@/features/onboarding/actions";
import { ONBOARDING_STEP_COUNT, ONBOARDING_WELCOME, isOnboarded } from "@/features/onboarding/steps";
import { getPlayer } from "@/features/profile/queries";
import { ActionButton } from "@/components/ui/action-button";
import { HOME_ROUTE } from "@/lib/routes";

export const metadata: Metadata = { title: "Welcome" };

// Renders inside loading.tsx's Suspense. Progress is stored in profiles.onboarding_step,
// so a reload or a later visit picks up at the same step.
export default async function OnboardingPage() {
  const { profile } = await getPlayer();
  if (isOnboarded(profile.onboarding_step)) redirect(HOME_ROUTE);

  const onWelcome = profile.onboarding_step === ONBOARDING_WELCOME;
  const stepNumber = onWelcome ? 1 : 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="font-pixel text-sm text-text-muted">
          Step {stepNumber} of {ONBOARDING_STEP_COUNT}
        </p>
        <ActionButton action={finishOnboarding} appearance="link" pendingLabel="Skipping…">
          Skip for now
        </ActionButton>
      </div>
      {onWelcome ? <WelcomeStep name={profile.display_name} /> : <ShelfStep />}
    </div>
  );
}

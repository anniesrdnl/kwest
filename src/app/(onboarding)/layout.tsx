import { PixelMeadow } from "@/components/brand/pixel-meadow";
import { Wordmark } from "@/components/brand/wordmark";
import { HOME_ROUTE } from "@/lib/routes";

// Focused shell for first-run onboarding: no main navigation, a calm meadow behind the card.
export default function OnboardingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <PixelMeadow flush />
      </div>
      <header>
        <div className="mx-auto flex w-full max-w-xl items-center h-14 px-4">
          <Wordmark href={HOME_ROUTE} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:py-10">{children}</main>
    </div>
  );
}

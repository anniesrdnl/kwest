import { Wordmark } from "@/components/brand/wordmark";
import { HOME_ROUTE } from "@/lib/routes";

// Focused shell for first-run onboarding: no main navigation.
export default function OnboardingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header>
        <div className="mx-auto flex w-full max-w-2xl items-center h-14 px-4">
          <Wordmark href={HOME_ROUTE} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">{children}</main>
    </div>
  );
}

import { Wordmark } from "@/components/pixel/wordmark";
import { HOME_ROUTE } from "@/lib/routes";

// Focused shell for first-run onboarding: no main navigation.
export default function OnboardingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b-2 border-border bg-surface">
        <div className="mx-auto flex w-full max-w-2xl items-center px-4 py-2">
          <Wordmark href={HOME_ROUTE} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}

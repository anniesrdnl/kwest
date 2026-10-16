import { LogoMark } from "@/components/brand/wordmark";
import { ButtonLink } from "@/components/ui/button";

// Temporary landing page.
export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <LogoMark className="size-14" />
      <div className="space-y-4">
        <h1 className="text-4xl font-bold sm:text-5xl">Kwest</h1>
        <p className="mx-auto max-w-md text-lg text-text-muted">
          Turn your notes into flashcard decks. Study a little every day, and remember more.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <ButtonLink href="/signup" size="lg">
          Get started
        </ButtonLink>
        <ButtonLink href="/login" size="lg" variant="secondary">
          Log in
        </ButtonLink>
      </div>
    </main>
  );
}

import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { LandingBackground } from "@/features/landing/components/landing-background";
import { PixelTitle } from "@/features/landing/components/pixel-title";

// One screen: the welcome page does not scroll.
export default function LandingPage() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <LandingBackground />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <PixelTitle />
        <p className="rise mx-auto mt-10 max-w-md text-lg text-text-muted" style={{ animationDelay: "0.5s" }}>
          Turn your notes into flashcard decks. Study a little every day, and remember more.
        </p>
        <div className="rise mt-8 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row" style={{ animationDelay: "0.7s" }}>
          <ButtonLink href="/signup" size="lg">
            Get started
            <ArrowRight size={18} aria-hidden />
          </ButtonLink>
          <ButtonLink href="/login" size="lg" variant="secondary">
            Log in
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}

import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { LandingBackground } from "@/features/landing/components/landing-background";

const TITLE = "Kwest".split("");

// One screen: the welcome page does not scroll.
export default function LandingPage() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <LandingBackground />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 aria-label="Kwest" className="flex text-7xl sm:text-9xl">
          {TITLE.map((letter, i) => (
            <span
              key={i}
              aria-hidden
              className="letter-pop inline-block cursor-default transition-colors duration-100 select-none hover:text-accent-ink active:translate-y-1"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {letter}
            </span>
          ))}
        </h1>
        <p className="rise mx-auto mt-6 max-w-md text-lg text-text-muted" style={{ animationDelay: "0.5s" }}>
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
        <p className="rise mt-5 text-sm text-text-muted" style={{ animationDelay: "0.9s" }}>
          Works on your phone and your computer.
        </p>
      </main>
    </div>
  );
}

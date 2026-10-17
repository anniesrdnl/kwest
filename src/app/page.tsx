import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PixelIcon, type PixelIconName } from "@/components/brand/pixel";
import { ButtonLink } from "@/components/ui/button";
import { FlipDemo } from "@/features/landing/components/flip-demo";
import { LandingBackground } from "@/features/landing/components/landing-background";
import { Ticker } from "@/features/landing/components/ticker";

const STEPS: { icon: PixelIconName; title: string; text: string }[] = [
  {
    icon: "decks",
    title: "Make a deck",
    text: "Type your cards in, or upload a Word, PowerPoint, PDF, Excel, CSV or text file.",
  },
  {
    icon: "study",
    title: "Study your way",
    text: "Take a quiz, flip flashcards, or play a Challenge: get 8 right before you miss 3.",
  },
  {
    icon: "spark",
    title: "Watch yourself grow",
    text: "Earn XP and coins, reach your daily goal and unlock achievements.",
  },
];

const FEATURES: { icon: PixelIconName; title: string; text: string }[] = [
  {
    icon: "decks",
    title: "Cards from your files",
    text: "Upload your notes and check the cards before you save them.",
  },
  {
    icon: "study",
    title: "Quiz, flashcards, Challenge",
    text: "Pick how you want to study. Cards you know move to a later review.",
  },
  {
    icon: "profile",
    title: "Beat my score",
    text: "Send a link after a Challenge. Friends play it and try to beat your score.",
  },
  {
    icon: "flip",
    title: "Share and explore",
    text: "Keep decks private, share them by link, or make them public. Copy decks from Explore.",
  },
  {
    icon: "check",
    title: "A goal with no pressure",
    text: "Pick how many cards a day. Missing a day is fine. Nothing resets.",
  },
  {
    icon: "shop",
    title: "Make it yours",
    text: "Spend your coins on avatar icons, colors and frames.",
  },
];

const TITLE = "Kwest".split("");

export default function LandingPage() {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-x-clip">
      <LandingBackground />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <span className="font-pixel text-2xl">Kwest</span>
        <nav aria-label="Account" className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center px-3 font-pixel text-base text-text-muted transition-colors hover:bg-track hover:text-text active:bg-accent"
          >
            Log in
          </Link>
          <ButtonLink href="/signup">Get started</ButtonLink>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-10 pb-20 text-center sm:pt-16 sm:pb-28">
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
          <div className="rise mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row" style={{ animationDelay: "0.7s" }}>
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
        </section>

        <Ticker />

        <section aria-labelledby="try-heading" className="mx-auto w-full max-w-5xl space-y-8 px-4 py-16 sm:py-24">
          <div className="space-y-2 text-center">
            <h2 id="try-heading" className="text-3xl sm:text-4xl">
              Try a card
            </h2>
            <p className="text-text-muted">This is what studying looks like. Tap the card to flip it.</p>
          </div>
          <FlipDemo />
        </section>

        <div aria-hidden className="dither" />

        <section aria-labelledby="how-heading" className="bg-surface">
          <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-16 sm:py-24">
            <h2 id="how-heading" className="text-center text-3xl sm:text-4xl">
              How it works
            </h2>
            <ol className="grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="group border border-border bg-bg p-6 transition-colors duration-150 hover:border-border-strong hover:bg-accent-soft active:bg-track"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-12 items-center justify-center bg-secondary font-pixel text-2xl text-secondary-fg transition-colors group-hover:bg-accent group-hover:text-accent-fg">
                      {i + 1}
                    </span>
                    <PixelIcon name={step.icon} scale={3} className="text-accent-ink" />
                  </div>
                  <h3 className="mt-4 text-2xl">{step.title}</h3>
                  <p className="mt-2 text-text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div aria-hidden className="dither" />

        <section aria-labelledby="features-heading" className="mx-auto w-full max-w-5xl space-y-10 px-4 py-16 sm:py-24">
          <h2 id="features-heading" className="text-center text-3xl sm:text-4xl">
            Everything you need to remember more
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="group border border-border bg-surface p-5 shadow-card transition-colors duration-150 hover:border-border-strong hover:bg-surface-2 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                <PixelIcon name={f.icon} scale={3} className="text-accent-ink transition-colors group-hover:text-text" />
                <h3 className="mt-3 text-xl">{f.title}</h3>
                <p className="mt-1 text-text-muted">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="cta-heading" className="border-t border-border bg-accent">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-16 text-center text-accent-fg sm:py-20">
            <h2 id="cta-heading" className="text-3xl sm:text-5xl">
              Ready to start your quest?
            </h2>
            <p className="max-w-md">Make your first deck in a minute, or begin with a ready-made one.</p>
            <ButtonLink href="/signup" size="lg" variant="secondary">
              Get started
              <ArrowRight size={18} aria-hidden />
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-text-muted">
        <span className="font-pixel text-lg text-text">Kwest</span>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/login" className="underline-offset-4 hover:text-text hover:underline">
            Log in
          </Link>
          <Link href="/signup" className="underline-offset-4 hover:text-text hover:underline">
            Sign up
          </Link>
        </nav>
      </footer>
    </div>
  );
}

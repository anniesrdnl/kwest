import { ArrowRight } from "lucide-react";
import { PixelIcon, type PixelIconName } from "@/components/brand/pixel";
import { PixelBackdrop, Sparkle } from "@/components/brand/pixel-backdrop";
import { PixelMeadow, PixelSun } from "@/components/brand/pixel-meadow";
import { ButtonLink } from "@/components/ui/button";
import { FlipDemo } from "@/features/landing/components/flip-demo";
import { PixelTitle } from "@/features/landing/components/pixel-title";

const STEPS: { icon: PixelIconName; title: string; text: string }[] = [
  { icon: "decks", title: "Make a deck", text: "Type your cards, or upload a file. Kwest finds the cards for you." },
  { icon: "study", title: "Study it", text: "Flip flashcards, take a quiz, or match pairs. Pick what suits you." },
  { icon: "coin", title: "Earn coins", text: "Right answers earn coins and levels. Spend coins in the shop." },
];

export default function LandingPage() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-clip">
      <div aria-hidden className="landing-grid pointer-events-none absolute inset-0 -z-10" />

      {/* Hero */}
      <section className="relative isolate flex min-h-dvh flex-col items-center justify-center px-4 py-20 text-center">
        <PixelBackdrop grid={false} />
        <PixelSun className="float-slow absolute top-[7%] left-[60%] -z-10 hidden md:block" />
        <PixelTitle />
        <p className="rise mx-auto mt-10 max-w-md text-lg text-text" style={{ animationDelay: "0.5s" }}>
          Turn your notes into flashcard decks. Study a little every day, and remember more.
        </p>
        <div className="rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "0.7s" }}>
          <ButtonLink href="/signup" size="lg" className="group">
            Get started
            <ArrowRight size={16} aria-hidden className="transition-[translate] duration-150 group-hover:translate-x-1" />
          </ButtonLink>
          <ButtonLink href="/login" size="lg" variant="secondary">
            Log in
          </ButtonLink>
        </div>
        <a
          href="#how"
          className="rise group absolute bottom-6 flex min-h-11 flex-col items-center gap-1 px-4 font-pixel text-base text-text-muted transition-colors duration-150 hover:text-accent-ink"
          style={{ animationDelay: "1.1s" }}
        >
          How it works
          <span className="bob-sm block rotate-90">
            <ArrowRight size={16} aria-hidden />
          </span>
        </a>
      </section>

      {/* How it works */}
      <section id="how" className="relative mx-auto w-full max-w-4xl scroll-mt-4 px-4 py-20">
        <Sparkle className="hidden md:block" style={{ left: "2%", top: "14%" }} />
        <Sparkle className="hidden md:block" style={{ left: "96%", top: "70%", animationDelay: "0.8s" }} />
        <h2 className="reveal text-center font-pixel text-[2rem] text-text">How it works</h2>
        <ol className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="reveal" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="group h-full transition-[translate] duration-150 ease-out hover:-translate-y-1 active:translate-y-0.5">
                <div className="pixel-lift h-full">
                  <div className="pixel-frame flex h-full flex-col items-center gap-3 px-5 py-6 text-center group-hover:[--frame-bg:var(--accent-soft)]">
                    <span className="flex size-14 items-center justify-center bg-accent-soft text-accent-ink transition-[background-color,color] duration-150 group-hover:bg-accent group-hover:text-accent-fg">
                      <PixelIcon name={step.icon} scale={4} className="transition-[translate] duration-150 group-hover:-translate-y-0.5" />
                    </span>
                    <h3 className="font-pixel text-2xl text-text">
                      <span className="text-accent-ink">{i + 1}.</span> {step.title}
                    </h3>
                    <p className="text-base text-text">{step.text}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Try a card */}
      <section className="relative mx-auto w-full max-w-4xl px-4 py-12 text-center">
        <h2 className="reveal font-pixel text-[2rem] text-text">Try a card</h2>
        <div className="reveal mt-8" style={{ animationDelay: "0.08s" }}>
          <FlipDemo />
        </div>
      </section>

      {/* Closing call to action, on the hills */}
      <section className="relative isolate mt-12 flex min-h-[28rem] flex-col items-center justify-start px-4 pt-16 pb-48 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <PixelMeadow flush clouds={false} />
        </div>
        <h2 className="reveal font-pixel text-[2rem] text-text">Ready to start?</h2>
        <p className="reveal mt-4 max-w-md text-lg text-text" style={{ animationDelay: "0.08s" }}>
          Make your first deck in a minute.
        </p>
        <div className="reveal mt-8" style={{ animationDelay: "0.16s" }}>
          <ButtonLink href="/signup" size="lg" className="group">
            Make a deck
            <ArrowRight size={16} aria-hidden className="transition-[translate] duration-150 group-hover:translate-x-1" />
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}

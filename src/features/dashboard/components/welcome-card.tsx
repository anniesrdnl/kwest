import { ArrowRight } from "lucide-react";
import { FloatingCard, Sparkle } from "@/components/brand/pixel-backdrop";
import { ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

/**
 * Home for a player with no decks: a short welcome and one button. The contents rise in one by one.
 * Two flashcards and a few stars float beside the card from tablet size up.
 */
export function WelcomeCard({ name }: { name: string }) {
  return (
    <div className="flex min-h-[calc(100svh-13rem)] items-center justify-center md:min-h-[calc(100svh-11rem)]">
      <div className="relative w-full max-w-xl">
        <FloatingCard face="A" blush className="top-[10%] -left-[4.5rem] hidden md:block" />
        <FloatingCard
          face="?"
          className="top-[62%] -right-[4.5rem] hidden md:block"
          style={{ animationDelay: "0.8s" }}
        />
        <Sparkle className="-top-7 right-8 hidden md:block" />
        <Sparkle className="-bottom-6 left-12 hidden md:block" style={{ animationDelay: "1s" }} />

        <Panel aria-labelledby="welcome-heading" className="text-center">
          <div className="space-y-6 px-1 py-4 sm:space-y-8 sm:px-6 sm:py-10">
            <h1
              id="welcome-heading"
              className="rise font-sans text-3xl font-semibold break-words sm:text-5xl sm:leading-tight"
              style={{ animationDelay: "0.05s" }}
            >
              Welcome, {name}
            </h1>
            <span aria-hidden className="rise mx-auto block h-1 w-12 bg-accent" style={{ animationDelay: "0.15s" }} />
            <p
              className="rise mx-auto max-w-md text-lg leading-relaxed text-balance text-text"
              style={{ animationDelay: "0.25s" }}
            >
              A deck is a set of flashcards about one topic. Make your first one and start studying.
            </p>
            <div className="rise flex justify-center" style={{ animationDelay: "0.35s" }}>
              <ButtonLink href="/decks/new" size="lg" className="w-full sm:w-auto sm:min-w-56">
                Make a deck
                <ArrowRight size={16} aria-hidden className="nudge-x" />
              </ButtonLink>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

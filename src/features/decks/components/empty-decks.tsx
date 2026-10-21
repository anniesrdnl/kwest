import { ButtonLink } from "@/components/ui/button";

/** The three cards of the little stack: pastel deck color, letter, where it sits, how far it slides on hover. */
const STACK = [
  { face: "?", color: "var(--deck-1)", spot: "left-0 top-8", slide: "group-hover:-translate-x-3 group-hover:translate-y-1", delay: "0s" },
  { face: "7", color: "var(--deck-4)", spot: "left-16 top-4", slide: "group-hover:translate-y-0.5", delay: "0.5s" },
  { face: "A", color: "var(--surface)", spot: "left-32 top-0", slide: "group-hover:translate-x-3 group-hover:-translate-y-1", delay: "1s" },
] as const;

/** First visit to Decks: a small stack of cards that fans out on hover, one line and one button. */
export function EmptyDecks() {
  return (
    <section className="group flex flex-col items-center gap-6 py-8 text-center md:py-12">
      <div aria-hidden className="rise relative h-44 w-56" style={{ animationDelay: "0.1s" }}>
        {STACK.map((card) => (
          <span
            key={card.face}
            className={`float-y absolute ${card.spot} transition-[translate] duration-300 ease-out ${card.slide}`}
            style={{ animationDelay: card.delay }}
          >
            <span className="pixel-lift block">
              <span
                className="pixel-frame flex h-32 w-24 items-center justify-center font-pixel text-[2rem] text-espresso"
                style={{ "--frame-bg": card.color } as React.CSSProperties}
              >
                {card.face}
              </span>
            </span>
          </span>
        ))}
      </div>

      <div className="rise space-y-2" style={{ animationDelay: "0.25s" }}>
        <h2 className="text-[2rem] leading-tight">No decks yet</h2>
        <p className="mx-auto max-w-sm text-lg text-text">A deck is a set of cards about one topic.</p>
      </div>

      <div className="rise" style={{ animationDelay: "0.4s" }}>
        <ButtonLink href="/decks/new" size="lg">
          Make a deck
        </ButtonLink>
      </div>
    </section>
  );
}

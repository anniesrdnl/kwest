import { ActionButton } from "@/components/ui/action-button";
import { ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { addStarterDeck } from "@/features/decks/actions";

/** Home for a player with no decks: a short welcome and the two ways to start. The contents rise in one by one. */
export function WelcomeCard({ name }: { name: string }) {
  return (
    <div className="flex min-h-[calc(100svh-13rem)] items-center justify-center md:min-h-[calc(100svh-11rem)]">
      <div className="w-full max-w-xl">
        <Panel aria-labelledby="welcome-heading" className="text-center">
          <div className="space-y-6 px-1 py-4 sm:space-y-8 sm:px-6 sm:py-8">
            <h1
              id="welcome-heading"
              className="rise text-2xl break-words sm:text-[2.5rem] sm:leading-tight"
              style={{ animationDelay: "0.05s" }}
            >
              Welcome, <span className="text-accent-ink">{name}</span>
            </h1>
            <span aria-hidden className="rise mx-auto block h-1 w-12 bg-accent" style={{ animationDelay: "0.15s" }} />
            <p className="rise mx-auto max-w-md text-balance text-text-muted" style={{ animationDelay: "0.25s" }}>
              A deck is a set of flashcards about one topic. Make your own, or start with a{" "}
              <span className="whitespace-nowrap">ready-made</span> one about writing a research paper.
            </p>
            <div
              className="rise flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-center"
              style={{ animationDelay: "0.35s" }}
            >
              <ButtonLink href="/decks/new" size="lg">
                Make a deck
              </ButtonLink>
              <ActionButton action={addStarterDeck} appearance="outline" size="lg" pendingLabel="Adding…">
                Add ready-made deck
              </ActionButton>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

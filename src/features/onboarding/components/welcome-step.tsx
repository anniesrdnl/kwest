import { Companion } from "@/components/pixel/companion";
import { Lantern } from "@/components/pixel/lantern";
import { DeckSpine } from "@/components/pixel/deck-spine";
import { ActionButton } from "@/components/ui/action-button";
import { finishWelcome } from "../actions";

const IDEAS = [
  {
    art: <DeckSpine colorKey="spine-3" className="h-12 w-4" />,
    name: "Decks",
    text: "A deck is a set of flashcards. Your decks sit on your bookshelf.",
  },
  {
    art: <span aria-hidden className="block h-4 w-6 bg-dust pixel-border" />,
    name: "Dust",
    text: "Cards ready for review gather a little dust. No rush. It just settles.",
  },
  {
    art: <Lantern lit className="h-10 w-8" />,
    name: "Lantern",
    text: "Review a few cards a day to light it. Missing a day resets nothing.",
  },
];

export function WelcomeStep({ name }: { name: string }) {
  return (
    <section aria-labelledby="welcome-heading" className="space-y-6">
      <div className="flex flex-col items-center gap-6 bg-surface p-6 text-center pixel-border sm:flex-row sm:text-left">
        {/* Placeholder companion until the avatar editor (Phase 11). */}
        <Companion className="h-32 w-24 shrink-0" />
        <div className="space-y-2">
          <h1 id="welcome-heading" className="font-pixel text-3xl">
            Welcome, {name}
          </h1>
          <p>This is your study companion. They&apos;ll keep you company in your dorm room while you study.</p>
          <p className="text-sm text-text-muted">This is a stand-in look. Designing your own avatar comes later.</p>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        {IDEAS.map(({ art, name: idea, text }) => (
          <li key={idea} className="flex items-start gap-3 bg-surface p-4 pixel-border sm:flex-col">
            <div className="flex h-12 w-8 shrink-0 items-center justify-center">{art}</div>
            <div>
              <h2 className="font-pixel">{idea}</h2>
              <p className="text-sm text-text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <ActionButton action={finishWelcome} pendingLabel="One moment…">
        Continue
      </ActionButton>
    </section>
  );
}

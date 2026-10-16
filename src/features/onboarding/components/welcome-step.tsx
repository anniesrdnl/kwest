import { CalendarCheck, Layers, Target } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { finishWelcome } from "../actions";

const IDEAS = [
  { icon: Layers, name: "Decks", text: "A deck is a set of flashcards about one topic." },
  { icon: CalendarCheck, name: "Reviews", text: "Cards come back just before you'd forget them, so you remember longer." },
  { icon: Target, name: "Daily goal", text: "Review 20 cards a day. Missing a day is fine. Nothing resets." },
];

export function WelcomeStep({ name }: { name: string }) {
  return (
    <section aria-labelledby="welcome-heading" className="space-y-8">
      <div className="space-y-2">
        <h1 id="welcome-heading" className="text-3xl font-semibold">
          Welcome, {name}
        </h1>
        <p className="text-lg text-text-muted">Here&apos;s how Kwest works. It takes a minute.</p>
      </div>

      <ul className="space-y-3">
        {IDEAS.map(({ icon: Icon, name: idea, text }) => (
          <li key={idea} className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4 shadow-card">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
              <Icon size={20} aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold">{idea}</h2>
              <p className="text-text-muted">{text}</p>
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

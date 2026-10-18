import { CalendarCheck, Layers, Target } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Panel } from "@/components/ui/panel";
import { finishWelcome } from "../actions";

const IDEAS = [
  { icon: Layers, name: "Decks", text: "A deck is a set of flashcards about one topic." },
  { icon: CalendarCheck, name: "Reviews", text: "Cards come back just before you'd forget them." },
  { icon: Target, name: "Daily goal", text: "Review 20 cards a day. Missing a day is fine." },
];

export function WelcomeStep({ name }: { name: string }) {
  return (
    <Panel aria-labelledby="welcome-heading" className="rise" style={{ animationDelay: "0.05s" }}>
      <div className="space-y-6 sm:p-3">
        <div className="space-y-2">
          <h1 id="welcome-heading" className="text-[2rem] break-words sm:text-[2.5rem] sm:leading-tight">
            Welcome, {name}
          </h1>
          <p className="text-lg text-text">Here&apos;s how Kwest works. It takes a minute.</p>
        </div>

        <ul className="divide-y-2 divide-border border-y-2 border-border">
          {IDEAS.map(({ icon: Icon, name: idea, text }) => (
            <li key={idea} className="flex items-start gap-4 py-4">
              <Icon size={24} aria-hidden className="mt-0.5 shrink-0 text-accent-ink" />
              <div>
                <h2 className="text-base">{idea}</h2>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <ActionButton action={finishWelcome} pendingLabel="One moment…" size="lg">
          Continue
        </ActionButton>
      </div>
    </Panel>
  );
}

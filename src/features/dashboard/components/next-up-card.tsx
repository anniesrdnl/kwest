import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PixelIcon, type PixelIconName } from "@/components/brand/pixel";
import { ButtonLink } from "@/components/ui/button";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import type { Deck } from "@/features/decks/queries";
import type { NextUp } from "../queries";

/** The one main thing to do: the deck with the most cards to study. */
export function NextUpCard({ nextUp }: { nextUp: NextUp }) {
  const { deck, minutes } = nextUp;
  const waiting = deck.due + deck.fresh;
  const chips: { icon: PixelIconName; text: string }[] = [];
  if (deck.due > 0) chips.push({ icon: "flip", text: `${deck.due} to review` });
  if (deck.fresh > 0) chips.push({ icon: "spark", text: `${deck.fresh} new` });
  chips.push({ icon: "clock", text: `about ${minutes} min` });

  return (
    <NextUpShell
      label="Today's quest"
      aside={
        <div className="float-y text-center">
          <p className="font-display text-[4rem] leading-none tabular-nums">{waiting}</p>
          <p className="mt-2 text-sm text-text-muted">{waiting === 1 ? "card waiting" : "cards waiting"}</p>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <DeckBadge title={deck.title} colorKey={deck.colorKey} size="lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Link
            href={`/decks/${deck.id}`}
            className="block text-xl font-bold break-words decoration-accent decoration-2 underline-offset-4 transition-colors hover:underline sm:text-2xl"
          >
            {deck.title}
          </Link>
          <ul className="flex flex-wrap gap-2 text-sm">
            {chips.map((chip) => (
              <li key={chip.text} className="inline-flex items-center gap-1.5 bg-track px-2 py-1">
                <PixelIcon name={chip.icon} scale={2} className="text-accent-ink" />
                {chip.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href={`/decks/${deck.id}/quiz`} size="lg">
          Start review
          <ArrowRight size={16} aria-hidden className="nudge-x" />
        </ButtonLink>
        <ButtonLink href={`/decks/${deck.id}/flashcards`} variant="outline" size="lg">
          Flashcards
        </ButtonLink>
      </div>
    </NextUpShell>
  );
}

/** Decks exist but nothing is due or new. */
export function AllCaughtUpCard({ decks, timeZone }: { decks: Deck[]; timeZone: string }) {
  const next = decks
    .map((d) => d.nextDueAt)
    .filter((d): d is string => d !== null)
    .sort()[0];

  let nextLabel: string | null = null;
  if (next) {
    try {
      nextLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric", timeZone }).format(
        new Date(next),
      );
    } catch {
      nextLabel = new Date(next).toDateString();
    }
  }

  return (
    <NextUpShell label="Today's quest" aside={<PixelIcon name="check" scale={8} className="float-y text-correct" />}>
      <div>
        <p className="text-xl font-bold sm:text-2xl">All caught up</p>
        <p className="text-text-muted">Nothing to review right now.</p>
        {nextLabel && <p className="text-sm text-text-muted">Next review: {nextLabel}</p>}
      </div>
    </NextUpShell>
  );
}

/** The quest board card. `aside` is the big picture or number on the right (from tablet size up). */
function NextUpShell({ label, aside, children }: { label: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rise pixel-lift" style={{ animationDelay: "0.1s" }}>
      <section aria-labelledby="next-up-heading" className="pixel-frame p-6 sm:p-8">
        <div className="flex items-center gap-6 sm:gap-10">
          <div className="min-w-0 flex-1 space-y-5">
            <h2 id="next-up-heading" className="inline-block bg-secondary px-2 py-0.5 font-display text-base text-secondary-fg">
              {label}
            </h2>
            {children}
          </div>
          {aside && <div className="hidden shrink-0 pr-2 sm:block sm:pr-6">{aside}</div>}
        </div>
      </section>
    </div>
  );
}

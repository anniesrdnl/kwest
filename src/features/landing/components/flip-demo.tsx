"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PixelBar } from "@/components/ui/pixel-bar";

const CARDS = [
  { front: "bonjour", back: "hello" },
  { front: "gracias", back: "thank you" },
  { front: "7 × 8", back: "56" },
  { front: "mitochondria", back: "The part of a cell that makes energy" },
] as const;

/** A real flip card people can try before signing up. Nothing is saved. */
export function FlipDemo() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = CARDS[index];

  const next = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % CARDS.length);
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="perspective-distant">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? `Meaning: ${card.back}. Press to see the word again.` : `Word: ${card.front}. Press to show the meaning.`}
          className={`group relative grid min-h-56 w-full text-left transition-transform duration-500 transform-3d ${flipped ? "rotate-y-180" : ""}`}
        >
          <span
            aria-hidden
            className="col-start-1 row-start-1 flex flex-col justify-between gap-4 border border-border bg-surface p-6 shadow-card backface-hidden transition-colors group-hover:border-border-strong group-hover:bg-surface-2 group-active:bg-track"
          >
            <span className="font-pixel text-base text-text-muted">Word</span>
            <span className="text-center font-pixel text-4xl break-words">{card.front}</span>
            <span className="text-center text-sm text-text-muted">Tap to flip</span>
          </span>
          <span
            aria-hidden
            className="col-start-1 row-start-1 flex rotate-y-180 flex-col justify-between gap-4 border border-border-strong bg-accent p-6 text-accent-fg shadow-card backface-hidden"
          >
            <span className="font-pixel text-base">Meaning</span>
            <span className="text-center text-2xl font-semibold break-words">{card.back}</span>
            <span className="text-center text-sm">Tap to flip back</span>
          </span>
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {flipped ? `Meaning: ${card.back}` : ""}
      </p>
      <div className="flex items-center gap-4">
        <PixelBar
          ratio={(index + 1) / CARDS.length}
          label="Demo cards"
          max={CARDS.length}
          now={index + 1}
          valueText={`Card ${index + 1} of ${CARDS.length}`}
          segments={CARDS.length}
          size="sm"
          className="flex-1"
        />
        <Button variant="secondary" onClick={next}>
          Next card
        </Button>
      </div>
    </div>
  );
}

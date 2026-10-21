"use client";

import { useState } from "react";

const CARDS = [
  { question: "What is a cell?", answer: "The smallest living part of a plant or animal." },
  { question: "Capital of France?", answer: "Paris" },
  { question: "7 × 8 = ?", answer: "56" },
] as const;

/** A sample card to try: tap to flip it, tap again for the next one. */
export function FlipDemo() {
  const [front, setFront] = useState(0);
  const [back, setBack] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // The answer side keeps the old card until it has turned away.
  const flip = () => {
    if (flipped) {
      setFront((front + 1) % CARDS.length);
      setFlipped(false);
    } else {
      setBack(front);
      setFlipped(true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      <button
        type="button"
        onClick={flip}
        aria-label={flipped ? "Show the next card" : "Flip the card to see the answer"}
        className="flip-card group block h-52 w-full cursor-pointer select-none transition-[translate] duration-150 ease-out hover:-translate-y-1 active:translate-y-0.5"
        data-flipped={flipped}
      >
        <span className="flip-inner block size-full">
          <span aria-hidden={flipped} className="flip-face pixel-lift">
            <span className="pixel-frame flex size-full flex-col items-center justify-center gap-3 p-6 group-hover:[--frame-bg:var(--accent-soft)]">
              <span className="font-pixel text-2xl text-text">{CARDS[front].question}</span>
              <span className="text-base text-text-muted">Tap to flip</span>
            </span>
          </span>
          <span aria-hidden={!flipped} className="flip-face flip-back pixel-lift">
            <span className="pixel-frame flex size-full flex-col items-center justify-center gap-3 p-6 [--frame-bg:var(--accent-soft)]">
              <span className="text-lg font-medium text-text">{CARDS[back].answer}</span>
              <span className="text-base text-text-muted">Tap for the next card</span>
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}

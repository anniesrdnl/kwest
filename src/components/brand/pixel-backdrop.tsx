import type { CSSProperties } from "react";
import { Cloud, PixelIcon } from "./pixel";

/** Floating mini flashcards: letter, position, delay (seconds), blush fill or white fill. */
const CARDS = [
  { face: "A", left: "6%", top: "22%", delay: 0, blush: true, hide: true },
  { face: "?", left: "88%", top: "18%", delay: 0.8, blush: false, hide: true },
  { face: "7", left: "14%", top: "62%", delay: 1.6, blush: false, hide: true },
  { face: "Z", left: "82%", top: "58%", delay: 0.4, blush: true, hide: true },
] as const;

/** Calm backdrop (busy pages): a few pieces, only in the side margins of wide screens. */
const CALM_CARDS = [
  { face: "A", left: "2%", top: "26%", delay: 0, blush: true, hide: true },
  { face: "?", left: "95%", top: "58%", delay: 0.8, blush: false, hide: true },
] as const;

const CALM_SPARKS = [
  { left: "4%", top: "62%", delay: 0.4, hide: true },
  { left: "96%", top: "24%", delay: 1, hide: true },
] as const;

/** Kept to the top and bottom bands so a cloud never drifts through the title. */
const CLOUDS = [
  { top: "9%", delay: -10, scale: 6, duration: 95 },
  { top: "21%", delay: -55, scale: 4, duration: 120 },
  { top: "82%", delay: -30, scale: 5, duration: 105 },
] as const;

/** `hide`: only shown from tablet up, where there is room beside the text. */
const SPARKS = [
  { left: "24%", top: "14%", delay: 0, hide: true },
  { left: "72%", top: "30%", delay: 0.6, hide: true },
  { left: "36%", top: "74%", delay: 1.1, hide: true },
  { left: "92%", top: "76%", delay: 0.3, hide: false },
  { left: "4%", top: "44%", delay: 1.4, hide: false },
] as const;

/** A mini flashcard that bobs up and down. Place it with `className` and `style` (it is absolutely positioned). */
export function FloatingCard({
  face,
  blush = false,
  className = "",
  style,
}: {
  face: string;
  blush?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span aria-hidden className={`float-y absolute ${className}`} style={style}>
      <span className="pixel-lift block">
        <span
          className={`pixel-frame flex size-14 items-center justify-center font-pixel text-[2rem] text-text ${
            blush ? "[--frame-bg:var(--accent)] text-accent-fg" : ""
          }`}
        >
          {face}
        </span>
      </span>
    </span>
  );
}

/** A small star that fades in and out. Place it with `className` and `style` (it is absolutely positioned). */
export function Sparkle({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <span aria-hidden className={`twinkle absolute text-accent-ink ${className}`} style={style}>
      <PixelIcon name="spark" scale={3} />
    </span>
  );
}

/**
 * The animated page backdrop: graph paper, drifting clouds, bobbing cards and twinkles.
 * Decoration only. Put it first inside a `relative isolate` wrapper; it fills that wrapper.
 */
export function PixelBackdrop({ calm = false, grid = true }: { calm?: boolean; grid?: boolean }) {
  const cards = calm ? CALM_CARDS : CARDS;
  const sparks = calm ? CALM_SPARKS : SPARKS;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {grid && <div className="landing-grid absolute inset-0" />}

      {CLOUDS.map((c, i) => (
        <Cloud
          key={i}
          scale={c.scale}
          className="cloud absolute left-0 block"
          style={{ top: c.top, animationDelay: `${c.delay}s`, animationDuration: `${c.duration}s` }}
        />
      ))}

      {cards.map((c) => (
        <FloatingCard
          key={c.face}
          face={c.face}
          blush={c.blush}
          className={c.hide ? (calm ? "hidden xl:block" : "hidden md:block") : ""}
          style={{ left: c.left, top: c.top, animationDelay: `${c.delay}s` }}
        />
      ))}

      {sparks.map((s, i) => (
        <Sparkle
          key={i}
          className={s.hide ? (calm ? "hidden xl:block" : "hidden md:block") : ""}
          style={{ left: s.left, top: s.top, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
  );
}

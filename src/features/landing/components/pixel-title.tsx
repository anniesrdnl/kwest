import { PixelArt } from "@/components/brand/pixel";
import { KWEST_GLYPHS } from "@/components/brand/pixel-word";

/**
 * The animated title: each letter pops in, turns blush on hover and sinks when pressed.
 * --u is the size of one pixel. It stays a whole number of screen pixels, so every stroke
 * is exactly the same thickness (a fractional size makes some strokes thicker).
 */
export function PixelTitle() {
  return (
    <h1 aria-label="Kwest" className="flex items-end gap-[var(--u)] [--u:10px] sm:[--u:12px]">
      {KWEST_GLYPHS.map((rows, i) => (
        <span
          key={i}
          aria-hidden
          className="letter-pop block cursor-default transition-[color,translate] duration-150 ease-out select-none hover:text-accent-ink active:translate-y-1"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <PixelArt rows={rows} className="h-[calc(7*var(--u))] w-[calc(5*var(--u))]" />
        </span>
      ))}
    </h1>
  );
}

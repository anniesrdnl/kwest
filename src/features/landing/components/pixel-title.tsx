import { PixelArt } from "@/components/brand/pixel";

/**
 * "Kwest" in hand-drawn 5 x 7 pixel letters. The pixel font is only 5 pixels tall,
 * so at this size its e and s turn into blocks; these letters keep their shape.
 */
const GLYPHS = [
  ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"], // K
  [".....", ".....", "#...#", "#...#", "#.#.#", "#.#.#", ".#.#."], // w
  [".....", ".....", ".###.", "#...#", "#####", "#....", ".####"], // e
  [".....", ".....", ".####", "#....", ".###.", "....#", "####."], // s
  [".#...", ".#...", "####.", ".#...", ".#...", ".#..#", "..##."], // t
] as const;

/**
 * The animated title: each letter pops in, turns blush on hover and sinks when pressed.
 * --u is the size of one pixel. It stays a whole number of screen pixels, so every stroke
 * is exactly the same thickness (a fractional size makes some strokes thicker).
 */
export function PixelTitle() {
  return (
    <h1 aria-label="Kwest" className="flex items-end gap-[var(--u)] [--u:10px] sm:[--u:12px]">
      {GLYPHS.map((rows, i) => (
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

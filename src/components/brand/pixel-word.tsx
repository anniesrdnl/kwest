import { PixelArt } from "./pixel";

/**
 * "Kwest" in hand-drawn 5 x 7 pixel letters. The pixel font is only 5 pixels tall,
 * so large, its e and s turn into blocks; these letters keep their shape.
 */
export const KWEST_GLYPHS = [
  ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"], // K
  [".....", ".....", "#...#", "#...#", "#.#.#", "#.#.#", ".#.#."], // w
  [".....", ".....", ".###.", "#...#", "#####", "#....", ".####"], // e
  [".....", ".....", ".####", "#....", ".###.", "....#", "####."], // s
  [".#...", ".#...", "####.", ".#...", ".#...", ".#..#", "..##."], // t
] as const;

/**
 * The small "Kwest" wordmark. `unit` is the size of one pixel in screen pixels (keep it a whole number).
 * Inside an element with class "group", the letters turn blush one after another on hover.
 */
export function PixelWordmark({ unit = 3 }: { unit?: number }) {
  return (
    <span aria-hidden className="flex items-end gap-[var(--u)]" style={{ "--u": `${unit}px` } as React.CSSProperties}>
      {KWEST_GLYPHS.map((rows, i) => (
        <span
          key={i}
          className="block transition-colors duration-150 group-hover:text-accent-ink"
          style={{ transitionDelay: `${i * 40}ms` }}
        >
          <PixelArt rows={rows} className="h-[calc(7*var(--u))] w-[calc(5*var(--u))]" />
        </span>
      ))}
    </span>
  );
}

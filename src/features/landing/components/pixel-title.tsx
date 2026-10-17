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

/** The big animated title: each letter pops in, turns blush on hover and sinks when pressed. */
export function PixelTitle() {
  return (
    <h1 aria-label="Kwest" className="flex items-end gap-2 sm:gap-4">
      {GLYPHS.map((rows, i) => (
        <span
          key={i}
          aria-hidden
          className="letter-pop block cursor-default transition-colors duration-100 select-none hover:text-accent-ink active:translate-y-1"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <PixelArt rows={rows} className="h-20 w-auto sm:h-32" />
        </span>
      ))}
    </h1>
  );
}

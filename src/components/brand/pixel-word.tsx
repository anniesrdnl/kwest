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

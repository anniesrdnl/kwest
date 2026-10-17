/**
 * Kwest's pixel art, drawn from text grids so every picture sits on a real pixel grid.
 * "#" is the main color, other letters are listed in each picture's palette.
 */

type Palette = Record<string, string>;

/** Merges neighbouring cells of one color in a row into one rectangle. */
function Bitmap({
  rows,
  palette,
  scale,
  className,
}: {
  rows: readonly string[];
  palette: Palette;
  scale: number;
  className?: string;
}) {
  const width = rows[0].length;
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === "." || !palette[ch]) {
        x++;
        continue;
      }
      let run = 1;
      while (row[x + run] === ch) run++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={run} height={1} fill={palette[ch]} />);
      x += run;
    }
  });
  return (
    <svg
      viewBox={`0 0 ${width} ${rows.length}`}
      width={width * scale}
      height={rows.length * scale}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {rects}
    </svg>
  );
}

/* -----------------------------------------------------------------------------
   Icons: one color (currentColor), 9 cells wide.
----------------------------------------------------------------------------- */
const ICONS = {
  home: [
    "....#....",
    "...###...",
    "..#####..",
    ".#######.",
    "#########",
    ".##...##.",
    ".##...##.",
    ".##...##.",
    ".#######.",
  ],
  decks: [
    "..#######",
    "..#.....#",
    "#######.#",
    "#.....#.#",
    "#.....#.#",
    "#.....###",
    "#.....#..",
    "#.....#..",
    "#######..",
  ],
  study: [
    ".###.###.",
    "#...#...#",
    "#.#.#.#.#",
    "#...#...#",
    "#.#.#.#.#",
    "#...#...#",
    ".###.###.",
  ],
  shop: [
    "...###...",
    "..#...#..",
    "#########",
    "#.......#",
    "#.......#",
    "#.......#",
    "#.......#",
    "#########",
  ],
  profile: [
    "...###...",
    "..#...#..",
    "..#...#..",
    "...###...",
    ".#######.",
    "#.......#",
    "#.......#",
    "#.......#",
  ],
  coin: [
    "..###..",
    ".#####.",
    "#######",
    "###.###",
    "#######",
    ".#####.",
    "..###..",
  ],
  spark: [
    "...#...",
    "...#...",
    "..###..",
    "#######",
    "..###..",
    "...#...",
    "...#...",
  ],
  check: [
    "......#",
    ".....##",
    "#...##.",
    "##.##..",
    ".###...",
    "..#....",
  ],
  close: [
    "#.....#",
    ".#...#.",
    "..#.#..",
    "...#...",
    "..#.#..",
    ".#...#.",
    "#.....#",
  ],
  lock: [
    "..###..",
    ".#...#.",
    ".#...#.",
    "#######",
    "#######",
    "###.###",
    "#######",
  ],
  clock: [
    "..###..",
    ".#...#.",
    "#..#..#",
    "#..##.#",
    "#.....#",
    ".#...#.",
    "..###..",
  ],
  flip: [
    ".######.",
    "#......#",
    "#.####.#",
    "#......#",
    ".######.",
  ],
} as const;

export type PixelIconName = keyof typeof ICONS;

/** A small pixel icon. `scale` is the size of one pixel in screen pixels. */
export function PixelIcon({ name, scale = 2, className }: { name: PixelIconName; scale?: number; className?: string }) {
  return <Bitmap rows={ICONS[name]} palette={{ "#": "currentColor" }} scale={scale} className={className} />;
}

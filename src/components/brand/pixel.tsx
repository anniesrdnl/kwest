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
  logout: [
    "#####....",
    "#........",
    "#....#...",
    "#....##..",
    "#.######.",
    "#....##..",
    "#....#...",
    "#........",
    "#####....",
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

/** A pixel cloud. Outline and fill follow the theme. */
export function Cloud({ scale = 6, className, style }: { scale?: number; className?: string; style?: React.CSSProperties }) {
  const rows = [
    ".......####.......",
    ".....##oooo##.....",
    "...##oooooooo##...",
    "..#oooooooooooo#..",
    ".#oooooooooooooo#.",
    ".################.",
  ];
  return (
    <span className={className} style={style}>
      <Bitmap rows={rows} palette={{ "#": "var(--border)", o: "var(--surface)" }} scale={scale} />
    </span>
  );
}

/** One-color pixel picture that follows the text color. Size it with CSS (height, width auto). */
export function PixelArt({ rows, className }: { rows: readonly string[]; className?: string }) {
  return <Bitmap rows={rows} palette={{ "#": "currentColor" }} scale={1} className={className} />;
}

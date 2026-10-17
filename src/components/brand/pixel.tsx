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

/* -----------------------------------------------------------------------------
   Kip: Kwest's mascot, a flashcard with a face and two little feet.
   "#" outline, "o" body, "C" cheek, "K" eyes and mouth.
----------------------------------------------------------------------------- */
export type KipMood = "happy" | "cheer" | "sad" | "think";

const KIP_TOP = ["..########..", ".#oooooooo#.", "#oooooooooo#", "#oooooooooo#"];
const KIP_FACE: Record<KipMood, string[]> = {
  happy: ["#ooKKooKKoo#", "#ooKKooKKoo#", "#oCooooooCo#", "#ooKooooKoo#", "#oooKKKKooo#"],
  cheer: ["#ooKooooKoo#", "#oKoKooKoKo#", "#oCooooooCo#", "#oooKKKKooo#", "#oooKKKKooo#"],
  sad: ["#ooKKooKKoo#", "#ooKKooKKoo#", "#oCooooooCo#", "#oooKKKKooo#", "#ooKooooKoo#"],
  think: ["#ooKKooKKoo#", "#ooKKooKKoo#", "#oCooooooCo#", "#ooooKKKKoo#", "#oooooooooo#"],
};
const KIP_BOTTOM = [".#oooooooo#.", "..########..", "..##....##..", "..##....##.."];

const KIP_PALETTE: Palette = {
  "#": "#111111",
  o: "#ffe6ed",
  C: "#cf7486",
  K: "#111111",
};

/** The mascot. `bob` makes it hop gently (switched off by reduced motion). */
export function Kip({
  mood = "happy",
  scale = 6,
  bob = false,
  className = "",
}: {
  mood?: KipMood;
  scale?: number;
  bob?: boolean;
  className?: string;
}) {
  return (
    <Bitmap
      rows={[...KIP_TOP, ...KIP_FACE[mood], ...KIP_BOTTOM]}
      palette={KIP_PALETTE}
      scale={scale}
      className={`${bob ? "kip-bob" : ""} ${className}`}
    />
  );
}

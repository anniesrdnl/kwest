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
   Kip: Kwest's mascot, a pixel bunny in a pink dress.
   "#" outline, "o" fur, "D" dress, "P" cheeks, "T" tear. Eyes and mouth are "#".
----------------------------------------------------------------------------- */
export type KipMood = "happy" | "cheer" | "sad" | "think";

/** The head row with some cells replaced (column to letter). */
const HEAD = ".#ooooooooooooooo#.";
const put = (marks: Record<number, string>) => [...HEAD].map((c, i) => marks[i] ?? c).join("");

const KIP_EARS = [
  "...###.......###...",
  "..#ooo#.....#ooo#..",
  "..#ooo#.....#ooo#..",
  "..#ooo#.....#ooo#..",
  "...#ooo#...#ooo#...",
  "...#ooo#...#ooo#...",
  "...#ooo#...#ooo#...",
  "...#ooo#...#ooo#...",
  "...#ooo#####ooo#...",
  "..#ooooooooooooo#..",
  HEAD,
  HEAD,
];

/** Face rows: two rows of eyes, a spacer, then the 3 x 3 cross mouth. */
const MOUTH = [put({ 8: "#", 10: "#" }), put({ 9: "#" }), put({ 8: "#", 10: "#" })];
const faceWith = (eyes: Record<number, string>) => [put(eyes), put(eyes), HEAD, ...MOUTH];
const EYES = { 5: "#", 6: "#", 12: "#", 13: "#" };
const KIP_FACE: Record<KipMood, string[]> = {
  happy: faceWith(EYES),
  cheer: [
    put({ 5: "#", 6: "#", 12: "#", 13: "#" }),
    put({ 4: "#", 7: "#", 11: "#", 14: "#" }),
    put({ 3: "P", 15: "P" }),
    ...MOUTH,
  ],
  sad: [put(EYES), put(EYES), put({ 5: "T" }), ...MOUTH],
  think: faceWith({ 6: "#", 7: "#", 13: "#", 14: "#" }),
};

const KIP_BODY = [
  HEAD,
  "..#ooooooooooooo#..",
  "...#############...",
  "...#DDDDDDDDDDD#...",
  "..#DDDDDDDDDDDDD#..",
  ".#o#DDDDDDDDDDD#o#.",
  ".###DDDDDDDDDDD###.",
  "...#DDDDDDDDDDD#...",
  "..#DDDDDDDDDDDDD#..",
  "..#DDDDDDDDDDDDD#..",
  "..###############..",
  "....#ooo#.#ooo#....",
  "....#####.#####....",
];

const KIP_PALETTE: Palette = {
  "#": "#111111",
  o: "#ffffff",
  D: "#e59aab",
  P: "#f2b3c0",
  T: "#8ec5e8",
};

/** The mascot. `bob` makes it hop gently (switched off by reduced motion). */
export function Kip({
  mood = "happy",
  scale = 3,
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
      rows={[...KIP_EARS, ...KIP_FACE[mood], ...KIP_BODY]}
      palette={KIP_PALETTE}
      scale={scale}
      className={`${bob ? "kip-bob" : ""} ${className}`}
    />
  );
}

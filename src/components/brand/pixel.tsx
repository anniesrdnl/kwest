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
   Kip: Kwest's mascot, an original pixel bunny with tall ears and a blush bow tie.
   "#" outline, "o" fur, "P" inner ear and cheeks, "B" bow, "K" eyes and mouth.
----------------------------------------------------------------------------- */
export type KipMood = "happy" | "cheer" | "sad" | "think";

/** A head row with some cells replaced (index to letter). */
const HEAD = "#oooooooooooo#";
const put = (marks: Record<number, string>) => [...HEAD].map((c, i) => marks[i] ?? c).join("");

const KIP_EARS = [
  "..###....###..",
  ".#ooo#..#ooo#.",
  ".#oPo#..#oPo#.",
  ".#oPo#..#oPo#.",
  ".#ooo#..#ooo#.",
  "..#oo####oo#..",
  ".#oooooooooo#.",
  HEAD,
];
const EYES = { 4: "K", 9: "K" };
const KIP_FACE: Record<KipMood, string[]> = {
  happy: [put(EYES), put(EYES), put({ 2: "P", 11: "P" }), put({ 5: "K", 8: "K" }), put({ 6: "K", 7: "K" })],
  cheer: [
    put(EYES),
    put({ 3: "K", 5: "K", 8: "K", 10: "K" }),
    put({ 2: "P", 11: "P" }),
    put({ 5: "K", 6: "K", 7: "K", 8: "K" }),
    put({ 5: "K", 6: "K", 7: "K", 8: "K" }),
  ],
  sad: [put(EYES), put(EYES), put({ 2: "P", 11: "P" }), put({ 5: "K", 6: "K", 7: "K", 8: "K" }), put({ 4: "K", 9: "K" })],
  think: [put(EYES), put(EYES), put({ 2: "P", 11: "P" }), put({ 6: "K", 7: "K", 8: "K", 9: "K" }), HEAD],
};
const KIP_BODY = [
  ".#oooooooooo#.",
  "..##########..",
  "..#oooooooo#..",
  "..#ooBBBBoo#..",
  "..#oooooooo#..",
  "..##########..",
  "..###....###..",
];

const KIP_PALETTE: Palette = {
  "#": "#111111",
  o: "#ffe6ed",
  P: "#e59aab",
  B: "#cf7486",
  K: "#111111",
};

/** The mascot. `bob` makes it hop gently (switched off by reduced motion). */
export function Kip({
  mood = "happy",
  scale = 4,
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

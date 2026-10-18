import { Bitmap, Cloud } from "./pixel";

/** One pixel of the hills, trees and sun is this many screen pixels. */
const UNIT = 4;

/** Slow clouds, kept clear of the top bar. */
const CLOUDS = [
  { top: "14%", delay: -20, scale: 5, duration: 110 },
  { top: "27%", delay: -75, scale: 7, duration: 140 },
  { top: "44%", delay: -40, scale: 4, duration: 100 },
  { top: "58%", delay: -95, scale: 6, duration: 125 },
  { top: "70%", delay: -10, scale: 5, duration: 115 },
] as const;

/** Tiny stars in the sky: left, top, delay and length of one twinkle (seconds). */
const SPECKS = [
  { left: "7%", top: "20%", delay: 0.2, duration: 2.6 },
  { left: "17%", top: "36%", delay: 1.4, duration: 3.1 },
  { left: "29%", top: "17%", delay: 0.8, duration: 2.4 },
  { left: "38%", top: "52%", delay: 2, duration: 3.4 },
  { left: "47%", top: "14%", delay: 1.1, duration: 2.8 },
  { left: "58%", top: "62%", delay: 0.5, duration: 2.5 },
  { left: "66%", top: "20%", delay: 1.8, duration: 3.2 },
  { left: "76%", top: "44%", delay: 0.9, duration: 2.7 },
  { left: "84%", top: "16%", delay: 2.3, duration: 3 },
  { left: "92%", top: "34%", delay: 0.4, duration: 2.9 },
  { left: "94%", top: "60%", delay: 1.6, duration: 2.5 },
  { left: "4%", top: "58%", delay: 2.1, duration: 3.3 },
] as const;

/** A little pine tree. */
const TREE = ["...#...", "..###..", ".#####.", "..###..", ".#####.", "#######", "...#...", "...#...", "...#..."];

/** A round pixel disc: `core` in the middle, `halo` (a lighter ring) around it. */
function disc(size: number, core: number, halo: number): string[] {
  const middle = (size - 1) / 2;
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      const distance = Math.hypot(x - middle, y - middle);
      return distance <= core ? "#" : distance <= halo ? "o" : ".";
    }).join(""),
  );
}

const SUN = disc(23, 7.5, 11);

/** Heights (in drawing pixels) along one tile of hills: two gentle waves added together. */
function skyline(columns: number, base: number, wave: number, phase: number): number[] {
  return Array.from({ length: columns }, (_, x) => {
    const t = (x / columns) * Math.PI * 2;
    return Math.round(base + wave * Math.sin(t + phase) + wave * 0.4 * Math.sin(2 * t + phase * 2));
  });
}

/**
 * A strip of hills along the bottom, with a few trees. It repeats sideways, and every step is a
 * whole number of pixels, so the edges stay even at any screen width. The color is the text color.
 * `trees` are the columns (away from the tile's edges) where a tree stands.
 */
function Hills({
  id,
  columns,
  base,
  wave,
  phase,
  trees,
  className,
}: {
  id: string;
  columns: number;
  base: number;
  wave: number;
  phase: number;
  trees: readonly number[];
  className: string;
}) {
  const heights = skyline(columns, base, wave, phase);
  const rows = Math.max(Math.max(...heights), ...trees.map((col) => heights[col] + TREE.length - 1));
  const rects: React.ReactNode[] = [];

  for (let x = 0; x < columns; ) {
    let run = 1;
    while (heights[x + run] === heights[x]) run++;
    rects.push(
      <rect key={`h${x}`} x={x * UNIT} y={(rows - heights[x]) * UNIT} width={run * UNIT} height={heights[x] * UNIT} />,
    );
    x += run;
  }

  // The tree's last row sits in the hill's top row, so there is never a gap on a step.
  for (const col of trees) {
    const top = rows - heights[col] - (TREE.length - 1);
    TREE.forEach((row, r) => {
      for (let c = 0; c < row.length; ) {
        if (row[c] !== "#") {
          c++;
          continue;
        }
        let run = 1;
        while (row[c + run] === "#") run++;
        rects.push(
          <rect key={`t${col}-${r}-${c}`} x={(col - 3 + c) * UNIT} y={(top + r) * UNIT} width={run * UNIT} height={UNIT} />,
        );
        c += run;
      }
    });
  }

  return (
    <svg
      aria-hidden
      width="100%"
      height={rows * UNIT}
      fill="currentColor"
      shapeRendering="crispEdges"
      className={`absolute left-0 ${className}`}
    >
      <defs>
        <pattern id={id} width={columns * UNIT} height={rows * UNIT} patternUnits="userSpaceOnUse">
          {rects}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * A soft, calm scene for the welcome page: a pale sun, slow clouds, tiny twinkling stars and hills
 * with little trees, on the plain page color. On phones the hills sit above the tab bar.
 * Decoration only. Put it inside a fixed or relative wrapper; it fills that wrapper.
 */
export function PixelMeadow({ flush = false }: { flush?: boolean }) {
  // With no tab bar below (first-run pages), the hills sit right on the bottom edge.
  const hillsAt = flush ? "bottom-0" : "bottom-16 md:bottom-0";
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {SPECKS.map((s, i) => (
        <span
          key={i}
          className="twinkle absolute size-1 bg-accent"
          style={{ left: s.left, top: s.top, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
        />
      ))}

      <Bitmap
        rows={SUN}
        scale={UNIT}
        palette={{
          "#": "color-mix(in srgb, var(--accent) 38%, var(--bg))",
          o: "color-mix(in srgb, var(--accent) 16%, var(--bg))",
        }}
        className="absolute top-[14%] right-[12%] hidden md:block"
      />

      {CLOUDS.map((c, i) => (
        <Cloud
          key={i}
          scale={c.scale}
          className="cloud absolute left-0 block"
          style={{ top: c.top, animationDelay: `${c.delay}s`, animationDuration: `${c.duration}s` }}
        />
      ))}

      <Hills id="hills-far" columns={192} base={18} wave={7} phase={0.6} trees={[]} className={`hills-far ${hillsAt}`} />
      <Hills id="hills-near" columns={144} base={10} wave={5} phase={2.4} trees={[28, 104]} className={`hills-near ${hillsAt}`} />
    </div>
  );
}

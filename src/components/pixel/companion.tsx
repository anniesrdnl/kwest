// PLACEHOLDER ART: a simple study companion until the avatar editor (Phase 11)
// draws the player's real avatar from the `avatars` table.

const ROWS = [
  "...hhhhhh...",
  "..hhhhhhhh..",
  "..hssssssh..",
  "..ssessess..",
  "..ssssssss..",
  "..sssmmsss..",
  "...ssssss...",
  "..tttttttt..",
  ".tttttttttt.",
  ".stttttttts.",
  ".stttttttts.",
  "..tttttttt..",
  "..pppppppp..",
  "..ppp..ppp..",
  "..ppp..ppp..",
  "..bbb..bbb..",
];

const FILL: Record<string, string> = {
  h: "#5a3a22",
  s: "#e0b48a",
  e: "#1b1f3b",
  m: "#a5562b",
  t: "var(--accent)",
  p: "var(--spine-2)",
  b: "#3a2a1e",
};

export const COMPANION_WIDTH = 12;
export const COMPANION_HEIGHT = 16;

/** The companion's pixels as <rect>s, for embedding in a larger scene. */
export function CompanionPixels({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {ROWS.flatMap((row, py) =>
        [...row].map((c, px) =>
          c === "." ? null : <rect key={`${px}-${py}`} x={px} y={py} width={1} height={1} fill={FILL[c]} />,
        ),
      )}
    </g>
  );
}

export function Companion({ className = "h-32 w-24", label = "Your study companion" }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox={`0 0 ${COMPANION_WIDTH} ${COMPANION_HEIGHT}`}
      className={`pixelated ${className}`}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <CompanionPixels />
    </svg>
  );
}

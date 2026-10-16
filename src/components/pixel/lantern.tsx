// PLACEHOLDER ART: the daily-goal Lantern.

const ROWS = [
  "..hhhh..",
  ".h....h.",
  "ffffffff",
  "fggggggf",
  "fggllggf",
  "fgllllgf",
  "fgllllgf",
  "fggllggf",
  "fggggggf",
  "ffffffff",
  ".ffffff.",
];

export function Lantern({ lit, className = "h-16 w-12" }: { lit: boolean; className?: string }) {
  const fill: Record<string, string> = {
    h: "var(--border)",
    f: "var(--border)",
    g: lit ? "var(--room-glow)" : "var(--surface-2)",
    l: lit ? "var(--accent)" : "var(--dust)",
  };
  return (
    <svg viewBox="0 0 8 11" className={`pixelated ${className}`} aria-hidden>
      {ROWS.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill[c]} />,
        ),
      )}
    </svg>
  );
}

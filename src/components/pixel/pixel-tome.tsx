const ROWS = [
  "........aa......",
  "........aaa.....",
  "........a.......",
  "........a.......",
  "..bbbbbba.bbbb..",
  ".bppppppbppppppb",
  ".bpttttpbpttttpb",
  ".bppppppbppppppb",
  ".bpttttpbptttppb",
  ".bppppppbppppppb",
  ".bpttttpbpttttpb",
  ".bppppppbppppppb",
  ".bbbbbbbbbbbbbbb",
  "..ssssssssssss..",
];

const FILL: Record<string, string> = {
  a: "var(--accent)",
  b: "var(--border)",
  p: "var(--surface)",
  t: "var(--dust)",
  s: "var(--surface-2)",
};

/** 16×14 open tome with a pennant (the Kwest mark). Placeholder art. */
export function PixelTome({ className = "h-28 w-32", label = "Kwest tome" }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 16 14"
      className={`pixelated ${className}`}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {ROWS.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={FILL[c]} />,
        ),
      )}
    </svg>
  );
}

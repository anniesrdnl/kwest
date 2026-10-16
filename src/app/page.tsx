import { ButtonLink } from "@/components/ui/button";

// Temporary landing page (Phase 5). The full landing page with the room scene
// is built later; /signup and /login are built in Phase 6.
export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <PixelTome />
      <div className="space-y-3">
        <h1 className="font-pixel text-4xl font-bold tracking-wide sm:text-5xl">KWEST</h1>
        <p className="font-pixel text-lg text-accent">Knowledge is the adventure.</p>
        <p className="mx-auto max-w-prose text-text-muted">
          Turn your notes into tomes, study them in a cozy pixel room, and watch your world grow as you learn.
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <ButtonLink href="/signup" size="lg">
          Start studying
        </ButtonLink>
        <ButtonLink href="/login" size="lg" variant="secondary">
          Log in
        </ButtonLink>
      </div>
    </main>
  );
}

/** 16×16 open tome with a pennant. Placeholder art, drawn from a pixel map. */
function PixelTome() {
  const rows = [
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
  const fill: Record<string, string> = {
    a: "var(--accent)",
    b: "var(--border)",
    p: "var(--surface)",
    t: "var(--dust)",
    s: "var(--surface-2)",
  };
  return (
    <svg viewBox="0 0 16 14" className="h-28 w-32 pixelated" role="img" aria-label="Kwest tome">
      {rows.flatMap((row, y) =>
        [...row].map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill[c]} />)),
      )}
    </svg>
  );
}

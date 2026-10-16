const COLOR_KEY = /^spine-([1-8])$/;

/** CSS color for a deck's color_key (stored as spine-1..8 in the database). */
export function deckColor(colorKey: string): string {
  const n = COLOR_KEY.exec(colorKey)?.[1] ?? "1";
  return `var(--deck-${n})`;
}

const SIZES = {
  sm: "size-9 text-sm rounded-lg",
  md: "size-11 text-base rounded-xl",
  lg: "size-14 text-xl rounded-xl",
};

/** Colored square with the deck's first letter. Decorative: show the title next to it. */
export function DeckBadge({ title, colorKey, size = "md" }: { title: string; colorKey: string; size?: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center font-semibold text-white ${SIZES[size]}`}
      style={{ backgroundColor: deckColor(colorKey) }}
    >
      {title.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

const SPINE_KEY = /^spine-[1-8]$/;

/** CSS color for a study set's color_key (spine-1..8). */
export function spineColor(colorKey: string): string {
  return `var(--${SPINE_KEY.test(colorKey) ? colorKey : "spine-1"})`;
}

/** Upright book spine with two bands. Decorative; put the title next to it, not on it. */
export function TomeSpine({ colorKey, className = "h-24 w-8" }: { colorKey: string; className?: string }) {
  return (
    <svg viewBox="0 0 8 24" className={`pixelated ${className}`} aria-hidden>
      <rect x={0} y={0} width={8} height={24} fill="var(--border)" />
      <rect x={1} y={1} width={6} height={22} fill={spineColor(colorKey)} />
      <rect x={1} y={4} width={6} height={1} fill="var(--gold)" />
      <rect x={1} y={19} width={6} height={1} fill="var(--gold)" />
      <rect x={3} y={9} width={2} height={5} fill="var(--surface)" opacity={0.7} />
    </svg>
  );
}

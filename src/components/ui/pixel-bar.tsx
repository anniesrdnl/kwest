/**
 * A game-style progress bar made of square blocks.
 * Shows `ratio` (0 to 1) rounded to whole blocks; any progress at all fills at least one.
 * Pass a label so screen readers hear it as a progress bar.
 * `animate` makes the filled blocks pop in one after another when the bar first appears.
 */
export function PixelBar({
  ratio,
  label,
  valueText,
  max = 100,
  now,
  segments = 10,
  size = "md",
  tone = "progress",
  animate = false,
  className = "",
}: {
  ratio: number;
  label: string;
  valueText?: string;
  max?: number;
  now?: number;
  segments?: number;
  size?: "sm" | "md";
  tone?: "progress" | "wrong";
  animate?: boolean;
  className?: string;
}) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const filled = clamped === 0 ? 0 : Math.max(1, Math.round(clamped * segments));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={now ?? Math.round(clamped * max)}
      aria-valuetext={valueText}
      className={`flex gap-0.5 ${size === "sm" ? "h-3" : "h-5"} ${className}`}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={`min-w-0 flex-1 ${
            i < filled
              ? `pixel-block ${tone === "wrong" ? "bg-wrong" : "bg-progress"} ${animate ? "block-in" : ""}`
              : "bg-track"
          }`}
          style={animate && i < filled ? { animationDelay: `${0.5 + i * 0.06}s` } : undefined}
        />
      ))}
    </div>
  );
}

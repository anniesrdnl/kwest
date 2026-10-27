import type { ReactNode } from "react";

/**
 * A row of big numbers inside one soft frame, split by thin lines (2 or 4 items).
 * Two by two on a phone, one row from tablet up.
 */
export function StatRow({ items, className = "" }: { items: readonly { label: string; value: ReactNode }[]; className?: string }) {
  return (
    <div className={`pixel-lift ${className}`}>
      <dl className="pixel-frame grid grid-cols-2 sm:grid-cols-4">
        {items.map(({ label, value }) => (
          <div
            key={label}
            className="border-border p-4 text-center max-sm:odd:border-r-2 max-sm:nth-[n+3]:border-t-2 sm:border-l-2 sm:first:border-l-0"
          >
            <dt className="text-sm text-text-muted">{label}</dt>
            <dd className="font-display text-2xl tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

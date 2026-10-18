/** Generic loading placeholder for a signed-in page. Soft blocks with square corners, like the cards. */
export function PageSkeleton({ blocks = 2 }: { blocks?: number }) {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only" role="status">
        Loading…
      </span>
      <div className="h-8 w-56 animate-pulse bg-surface-2" />
      {Array.from({ length: blocks }, (_, i) => (
        <div key={i} className="h-36 w-full animate-pulse border border-border bg-surface-2" />
      ))}
    </div>
  );
}

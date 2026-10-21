/** Generic loading placeholder for a signed-in page: a title and soft pixel frames that pulse. */
export function PageSkeleton({ blocks = 2 }: { blocks?: number }) {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only" role="status">
        Loading…
      </span>
      <div className="h-8 w-56 max-w-full animate-pulse bg-surface-2" />
      {Array.from({ length: blocks }, (_, i) => (
        <div key={i} className="pixel-lift">
          <div className="pixel-frame h-36 w-full animate-pulse [--frame-bg:var(--surface-2)]" />
        </div>
      ))}
    </div>
  );
}

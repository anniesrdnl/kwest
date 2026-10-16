export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-48 animate-pulse bg-surface-2" />
      <div className="h-40 w-full animate-pulse bg-surface-2" />
    </div>
  );
}

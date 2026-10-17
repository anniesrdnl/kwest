// Dashboard-shaped skeleton so the layout does not jump when data arrives.
export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <span className="sr-only" role="status">
        Loading your dashboard…
      </span>
      <div className="space-y-2">
        <div className="h-8 w-64 max-w-full animate-pulse bg-surface-2" />
        <div className="h-5 w-40 animate-pulse bg-surface-2" />
      </div>
      <div className="h-56 animate-pulse bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-36 animate-pulse bg-surface-2" />
        <div className="h-36 animate-pulse bg-surface-2" />
        <div className="h-36 animate-pulse bg-surface-2" />
      </div>
      <div className="h-24 animate-pulse bg-surface-2" />
    </div>
  );
}

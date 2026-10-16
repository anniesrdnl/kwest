// Dashboard-shaped skeleton so the layout doesn't jump when data arrives.
export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <span className="sr-only" role="status">
        Loading your dashboard…
      </span>
      <div className="h-8 w-40 animate-pulse rounded-lg bg-surface-2" />
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <div className="h-52 animate-pulse rounded-2xl bg-surface-2 md:col-span-2" />
        <div className="h-36 animate-pulse rounded-xl bg-surface-2" />
        <div className="h-32 animate-pulse rounded-xl bg-surface-2" />
      </div>
      <div className="h-24 animate-pulse rounded-xl bg-surface-2" />
    </div>
  );
}

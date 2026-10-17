// Profile-shaped skeleton: header, progress, chart.
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-10" aria-busy="true">
      <span className="sr-only" role="status">
        Loading your profile…
      </span>
      <div className="flex items-center gap-4">
        <div className="size-16 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-2" />
      </div>
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-xl bg-surface-2" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-2" />
          ))}
        </div>
        <div className="h-56 animate-pulse rounded-xl bg-surface-2" />
      </div>
    </div>
  );
}

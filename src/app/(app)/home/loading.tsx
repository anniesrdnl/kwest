// Dashboard-shaped skeleton so the layout doesn't jump when data arrives.
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only" role="status">
        Loading your dashboard…
      </span>
      <div className="h-9 w-48 animate-pulse bg-surface-2" />
      <div className="grid gap-6 md:grid-cols-[3fr_2fr] md:items-start">
        <div className="h-44 animate-pulse bg-surface-2 md:col-start-2 md:row-start-1" />
        <div className="h-32 animate-pulse bg-surface-2 md:col-start-2 md:row-start-2" />
        <div className="h-28 animate-pulse bg-surface-2 md:col-start-1 md:row-span-3 md:row-start-1 md:aspect-[5/3] md:h-auto" />
        <div className="h-20 animate-pulse bg-surface-2 md:col-start-2 md:row-start-3" />
      </div>
      <div className="h-48 animate-pulse bg-surface-2" />
    </div>
  );
}

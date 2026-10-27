// Profile-shaped placeholder: a card, a row of numbers and a chart, as soft pixel frames.
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" aria-busy="true">
      <span className="sr-only" role="status">
        Loading your profile…
      </span>
      <div className="pixel-lift">
        <div className="pixel-frame h-48 w-full animate-pulse [--frame-bg:var(--surface-2)]" />
      </div>
      <div className="pixel-lift">
        <div className="pixel-frame h-24 w-full animate-pulse [--frame-bg:var(--surface-2)]" />
      </div>
      <div className="pixel-lift">
        <div className="pixel-frame h-56 w-full animate-pulse [--frame-bg:var(--surface-2)]" />
      </div>
    </div>
  );
}

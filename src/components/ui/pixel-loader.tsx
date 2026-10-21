/** Three pixel blocks that hop one after another. For pages that cannot know their own shape yet. */
export function PixelLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-busy="true" className="flex min-h-[50dvh] flex-col items-center justify-center gap-4">
      <div aria-hidden className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="bob-sm block size-4 bg-accent"
            style={{ animationDuration: "0.45s", animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="font-pixel text-base text-text-muted">{label}</p>
    </div>
  );
}

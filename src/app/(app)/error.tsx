"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-md space-y-4 bg-surface p-6 text-center pixel-border">
      <h1 className="font-pixel text-xl">Something tipped over</h1>
      <p className="text-text-muted">We couldn&apos;t load this page. Your progress is safe.</p>
      {error.digest && <p className="text-sm text-text-muted">Error code: {error.digest}</p>}
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

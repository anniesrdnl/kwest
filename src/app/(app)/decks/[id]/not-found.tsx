import { ButtonLink } from "@/components/ui/button";

export default function DeckNotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border border-border bg-surface p-6 text-center shadow-card">
      <h1 className="text-xl font-semibold">Deck not found</h1>
      <p className="text-text-muted">This deck doesn&apos;t exist, or it was deleted.</p>
      <ButtonLink href="/decks" variant="secondary">
        Back to decks
      </ButtonLink>
    </div>
  );
}

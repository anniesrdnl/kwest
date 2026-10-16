import { PixelTome } from "@/components/pixel/pixel-tome";
import { ButtonLink } from "@/components/ui/button";

// Temporary landing page. The full landing page with the room scene is built later.
export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <PixelTome />
      <div className="space-y-3">
        <h1 className="font-pixel text-4xl font-bold tracking-wide sm:text-5xl">KWEST</h1>
        <p className="font-pixel text-lg text-accent-ink">Knowledge is the adventure.</p>
        <p className="mx-auto max-w-prose text-text-muted">
          Turn your notes into tomes, study them in a cozy pixel room, and watch your world grow as you learn.
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <ButtonLink href="/signup" size="lg">
          Start studying
        </ButtonLink>
        <ButtonLink href="/login" size="lg" variant="secondary">
          Log in
        </ButtonLink>
      </div>
    </main>
  );
}

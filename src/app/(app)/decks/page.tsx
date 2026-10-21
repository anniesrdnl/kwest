import type { Metadata } from "next";
import { Compass, Plus } from "lucide-react";
import { PixelBackdrop } from "@/components/brand/pixel-backdrop";
import { PixelMeadow } from "@/components/brand/pixel-meadow";
import { ButtonLink } from "@/components/ui/button";
import { DeckList } from "@/features/decks/components/deck-list";
import { EmptyDecks } from "@/features/decks/components/empty-decks";
import { getDecks } from "@/features/decks/queries";

export const metadata: Metadata = { title: "Decks" };

export default async function DecksPage() {
  const decks = await getDecks();
  const empty = decks.length === 0;

  return (
    <>
      <div aria-hidden className="fade-in pointer-events-none fixed inset-0 -z-10">
        {empty ? <PixelMeadow clouds={false} sunClassName="top-[30%] right-[5%]" /> : <PixelBackdrop calm />}
      </div>

      <div className="space-y-6">
        <div className="rise flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-[2rem] sm:leading-tight">Decks</h1>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/explore" variant="outline" className="group">
              <Compass size={18} aria-hidden className="transition-[rotate] duration-300 ease-out group-hover:rotate-45" />
              Explore
            </ButtonLink>
            {/* With no decks yet, the one button in the middle is enough. */}
            {!empty && (
              <ButtonLink href="/decks/new" className="group">
                <Plus size={18} aria-hidden className="transition-[rotate] duration-300 ease-out group-hover:rotate-90" />
                New deck
              </ButtonLink>
            )}
          </div>
        </div>

        {empty ? (
          <EmptyDecks />
        ) : (
          <div className="rise" style={{ animationDelay: "0.1s" }}>
            <DeckList decks={decks} />
          </div>
        )}
      </div>
    </>
  );
}

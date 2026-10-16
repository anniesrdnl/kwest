import Link from "next/link";
import { TomeSpine } from "@/components/pixel/tome-spine";
import { Panel } from "@/components/ui/panel";
import type { Tome } from "@/features/tomes/queries";

const SHOWN = 12;

function status(tome: Tome): string {
  if (tome.due > 0) return `${tome.due} dusty`;
  if (tome.fresh > 0) return `${tome.fresh} new`;
  return "All dusted";
}

/** Horizontal row of tome spines, most recently studied first. */
export function RecentTomes({ tomes }: { tomes: Tome[] }) {
  return (
    <Panel
      title="Recent tomes"
      actions={
        <Link href="/tomes" className="inline-flex min-h-11 items-center px-2 font-pixel text-sm text-accent-ink underline underline-offset-4">
          All tomes
        </Link>
      }
    >
      {/* Tome pages arrive with the editor (Phase 8), so spines aren't links yet. */}
      <ul
        className="flex snap-x gap-4 overflow-x-auto pb-2"
        tabIndex={0}
        aria-label="Recent tomes, scrolls sideways"
      >
        {tomes.slice(0, SHOWN).map((tome) => (
          <li key={tome.id} className="flex w-28 shrink-0 snap-start flex-col items-center gap-2 text-center">
            <TomeSpine colorKey={tome.colorKey} className="h-24 w-8" />
            <span className="line-clamp-2 text-sm">{tome.title}</span>
            <span className="font-pixel text-xs text-text-muted">{status(tome)}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

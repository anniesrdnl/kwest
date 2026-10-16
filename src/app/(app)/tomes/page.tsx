import type { Metadata } from "next";
import { Library } from "lucide-react";
import { TomeSpine } from "@/components/pixel/tome-spine";
import { ComingSoon } from "@/components/ui/coming-soon";
import { Panel } from "@/components/ui/panel";
import { getTomes } from "@/features/tomes/queries";

export const metadata: Metadata = { title: "Tomes" };

// The tome editor is Phase 8. Until then this page lists the shelf read-only.
export default async function TomesPage() {
  const tomes = await getTomes();

  return (
    <ComingSoon
      icon={Library}
      title="Tomes"
      phase={8}
      extra={
        <Panel title={`Your shelf (${tomes.length})`}>
          {tomes.length === 0 ? (
            <p className="text-text-muted">No tomes yet. You can add the starter tome from the home page.</p>
          ) : (
            <ul className="divide-y-2 divide-surface-2">
              {tomes.map((tome) => (
                <li key={tome.id} className="flex items-center gap-3 py-3">
                  <TomeSpine colorKey={tome.colorKey} className="h-12 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-pixel break-words">{tome.title}</p>
                    <p className="text-sm text-text-muted">
                      {tome.cardCount} cards · {tome.due} dusty · {tome.fresh} new
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      }
    >
      <p>Creating, editing and opening tomes arrives in Phase 8. Here&apos;s what&apos;s on your shelf so far.</p>
    </ComingSoon>
  );
}

import type { Metadata } from "next";
import { Store } from "lucide-react";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Shop" };

export default function Page() {
  return (
    <ComingSoon icon={Store} title="Shop" phase={11}>
      <p>Spending coins on furniture, decor and outfits opens in Phase 11. Coins you earn until then are kept.</p>
    </ComingSoon>
  );
}

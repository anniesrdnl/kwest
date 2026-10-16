import type { Metadata } from "next";
import { Map } from "lucide-react";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "World" };

export default function Page() {
  return (
    <ComingSoon icon={Map} title="World" phase={12}>
      <p>The world beyond your dorm, including Dust Duel, opens in Phase 12.</p>
    </ComingSoon>
  );
}

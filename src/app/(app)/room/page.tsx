import type { Metadata } from "next";
import { BedDouble } from "lucide-react";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Room" };

export default function Page() {
  return (
    <ComingSoon icon={BedDouble} title="Room" phase={11}>
      <p>Arranging furniture and decor in your dorm opens in Phase 11. For now, your room shows on the home page as a preview.</p>
    </ComingSoon>
  );
}

import type { Metadata } from "next";
import { Gamepad2 } from "lucide-react";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Play" };

export default function Page() {
  return (
    <ComingSoon icon={Gamepad2} title="Play" phase={9}>
      <p>Flashcards and quizzes open in Phase 9. Your cards and their dust are already being tracked, so nothing is lost while you wait.</p>
    </ComingSoon>
  );
}

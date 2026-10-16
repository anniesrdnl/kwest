import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Study" };

export default function Page() {
  return (
    <ComingSoon icon={BookOpen} title="Study" phase={9}>
      <p>Flashcards and quizzes come in Phase 9. Your decks are saved, so nothing is lost while you wait.</p>
    </ComingSoon>
  );
}

import { PageSkeleton } from "@/components/ui/page-skeleton";

// Fallback for routes without their own loading.tsx. Each page should still
// add one so navigating between pages is instant (a boundary below the shared layout).
export default function Loading() {
  return <PageSkeleton />;
}

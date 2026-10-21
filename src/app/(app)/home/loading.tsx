import { PixelLoader } from "@/components/ui/pixel-loader";

// Home is a welcome card for new players and a quest board for everyone else, so the loading
// screen does not pretend to be either one.
export default function Loading() {
  return <PixelLoader />;
}

import Link from "next/link";
import { PixelIcon } from "@/components/brand/pixel";
import { getPlayer } from "@/features/profile/queries";
import { UserAvatar, lookOf } from "@/features/shop/avatar";
import { levelProgress } from "@/lib/game/levels";

/** Your avatar, level and coins in the nav. Flat: a tint on hover, and it opens your profile. */
export async function PlayerPlate() {
  const { profile, stats } = await getPlayer();
  const { level } = levelProgress(stats.xp_total);

  return (
    <Link
      href="/profile"
      aria-label={`Your profile. Level ${level}, ${stats.coins} coins.`}
      className="group inline-flex h-10 items-center gap-3 px-2.5 transition-[background-color,translate] duration-150 ease-out hover:bg-track active:translate-y-0.5"
    >
      <UserAvatar name={profile.display_name} look={lookOf(profile)} size="sm" />
      <span className="font-pixel text-base">LV {level}</span>
      <span className="inline-flex items-center gap-1.5 font-pixel text-base tabular-nums">
        <PixelIcon name="coin" scale={2} className="text-gold" />
        {stats.coins}
      </span>
    </Link>
  );
}

/** Shown while the plate loads, so the nav does not jump. */
export function PlayerPlateSkeleton() {
  return <div aria-hidden className="h-10 w-32 animate-pulse bg-surface-2" />;
}

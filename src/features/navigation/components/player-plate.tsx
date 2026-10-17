import Link from "next/link";
import { PixelIcon } from "@/components/brand/pixel";
import { PixelBar } from "@/components/ui/pixel-bar";
import { getPlayer } from "@/features/profile/queries";
import { UserAvatar, lookOf } from "@/features/shop/avatar";
import { levelProgress } from "@/lib/game/levels";

/** The player's game plate in the nav: avatar, level with a block XP bar, and coins. Opens the profile. */
export async function PlayerPlate() {
  const { profile, stats } = await getPlayer();
  const { level, xpIntoLevel, xpNeeded, ratio } = levelProgress(stats.xp_total);

  return (
    <Link
      href="/profile"
      aria-label={`Your profile. Level ${level}, ${stats.coins} coins.`}
      className="group block transition-[translate] duration-150 active:translate-y-0.5"
    >
      <div className="pixel-lift">
        <div className="pixel-frame flex h-12 items-center gap-2.5 px-2.5 group-hover:[--frame-bg:var(--track)] sm:gap-3 sm:px-3">
          <UserAvatar name={profile.display_name} look={lookOf(profile)} size="sm" />
          <div className="flex flex-col gap-1">
            <span className="font-pixel text-base leading-none">LV {level}</span>
            <div className="hidden w-20 sm:block">
              <PixelBar
                ratio={ratio}
                label={`Level ${level} progress`}
                max={xpNeeded}
                now={xpIntoLevel}
                valueText={`${xpIntoLevel} of ${xpNeeded} XP to level ${level + 1}`}
                segments={6}
                size="sm"
              />
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 font-pixel text-base tabular-nums">
            <PixelIcon name="coin" scale={2} className="text-gold" />
            {stats.coins}
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Shown while the plate loads, so the nav does not jump. */
export function PlayerPlateSkeleton() {
  return <div aria-hidden className="h-12 w-28 animate-pulse bg-surface-2 sm:w-52" />;
}

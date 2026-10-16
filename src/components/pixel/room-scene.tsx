import { CompanionPixels } from "./companion";
import { spineColor } from "./deck-spine";

// PLACEHOLDER ART: a fixed dorm room until the room editor (Phase 11) draws
// the player's real room_placements. The bookshelf does show the real decks.

const W = 160; // 10 tiles × 16 px
const H = 96; // 6 tiles × 16 px
const SHELF = { x: 100, y: 14, w: 44, h: 50 };
const SPINES_PER_SHELF = 9;
const SHELF_ROWS = [29, 45, 61]; // y of each plank's top edge

type RoomSceneProps = {
  /** color_key of each deck, most recent first. Up to 27 are shown. */
  spines: string[];
  /** Compact strip for small screens: crops the scene to a short band. */
  compact?: boolean;
  className?: string;
};

export function RoomScene({ spines, compact = false, className = "" }: RoomSceneProps) {
  const label =
    spines.length === 0
      ? "Your dorm room. The bookshelf is empty."
      : `Your dorm room. ${spines.length} ${spines.length === 1 ? "deck" : "decks"} on the bookshelf.`;

  return (
    <svg
      viewBox={compact ? `0 24 ${W} 60` : `0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={`pixelated block w-full ${className}`}
      role="img"
      aria-label={label}
    >
      {/* wall + floor */}
      <rect x={0} y={0} width={W} height={64} fill="var(--room-wall)" />
      <rect x={0} y={64} width={W} height={32} fill="var(--room-floor)" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={i * 16} y={64} width={1} height={32} fill="var(--room-wood)" opacity={0.35} />
      ))}
      <rect x={0} y={62} width={W} height={2} fill="var(--room-wood)" />

      {/* window */}
      <rect x={14} y={10} width={36} height={30} fill="var(--room-wood)" />
      <rect x={16} y={12} width={32} height={26} fill="var(--room-sky)" />
      <rect x={31} y={12} width={2} height={26} fill="var(--room-wood)" />
      <rect x={16} y={24} width={32} height={2} fill="var(--room-wood)" />

      {/* rug */}
      <rect x={34} y={76} width={64} height={12} fill="var(--accent)" opacity={0.45} />
      <rect x={38} y={79} width={56} height={6} fill="var(--accent)" opacity={0.35} />

      {/* desk with lamp */}
      <rect x={54} y={50} width={36} height={4} fill="var(--room-wood)" />
      <rect x={56} y={54} width={3} height={14} fill="var(--room-wood)" />
      <rect x={85} y={54} width={3} height={14} fill="var(--room-wood)" />
      <rect x={80} y={40} width={2} height={10} fill="var(--border)" />
      <rect x={76} y={37} width={10} height={4} fill="var(--accent)" />
      <rect x={74} y={41} width={14} height={2} fill="var(--room-glow)" opacity={0.6} />
      <rect x={60} y={47} width={10} height={3} fill="var(--surface)" />

      {/* bookshelf */}
      <rect x={SHELF.x} y={SHELF.y} width={SHELF.w} height={SHELF.h} fill="var(--room-wood)" />
      <rect x={SHELF.x + 2} y={SHELF.y + 2} width={SHELF.w - 4} height={SHELF.h - 2} fill="var(--border)" opacity={0.35} />
      {SHELF_ROWS.map((y) => (
        <rect key={y} x={SHELF.x} y={y} width={SHELF.w} height={2} fill="var(--room-wood)" />
      ))}
      {spines.slice(0, SPINES_PER_SHELF * SHELF_ROWS.length).map((key, i) => {
        const row = Math.floor(i / SPINES_PER_SHELF);
        const col = i % SPINES_PER_SHELF;
        const height = 11 + ((i * 7) % 3);
        return (
          <rect
            key={i}
            x={SHELF.x + 4 + col * 4}
            y={SHELF_ROWS[row] - height}
            width={3}
            height={height}
            fill={spineColor(key)}
          />
        );
      })}

      {/* companion */}
      <CompanionPixels x={40} y={58} />
    </svg>
  );
}

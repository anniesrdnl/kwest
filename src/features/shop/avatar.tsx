import {
  BookOpen,
  Brain,
  Coffee,
  Crown,
  GraduationCap,
  Headphones,
  Leaf,
  Moon,
  Rocket,
  Star,
  type LucideIcon,
} from "lucide-react";

// Shop item keys (0009_shop.sql) -> what to draw. null = the default look.

export const AVATAR_ICONS: Record<string, LucideIcon> = {
  "icon-book": BookOpen,
  "icon-star": Star,
  "icon-coffee": Coffee,
  "icon-leaf": Leaf,
  "icon-moon": Moon,
  "icon-headphones": Headphones,
  "icon-rocket": Rocket,
  "icon-brain": Brain,
  "icon-crown": Crown,
  "icon-scholar": GraduationCap,
};

export const AVATAR_COLORS: Record<string, string> = {
  "color-butter": "var(--avatar-butter)",
  "color-sage": "var(--avatar-sage)",
  "color-sky": "var(--avatar-sky)",
  "color-blush": "var(--avatar-blush)",
  "color-lilac": "var(--avatar-lilac)",
  "color-mint": "var(--avatar-mint)",
  "color-espresso": "var(--avatar-espresso)",
};

/** Rings drawn around the avatar. ring = box-shadow, outline = a second ring further out. */
export const AVATAR_FRAMES: Record<string, string> = {
  "frame-simple": "ring-2 ring-text ring-offset-2 ring-offset-transparent",
  "frame-dashed": "outline-2 outline-offset-2 outline-dashed outline-text",
  "frame-gold": "ring-3 ring-[var(--frame-gold)] ring-offset-2 ring-offset-transparent",
  "frame-double": "ring-2 ring-text ring-offset-2 ring-offset-transparent outline-2 outline-offset-[6px] outline-text",
  "frame-scholar":
    "ring-4 ring-[var(--frame-gold)] ring-offset-2 ring-offset-transparent outline-2 outline-offset-[8px] outline-[var(--frame-gold)]",
};

export type AvatarLook = { icon: string | null; color: string | null; frame: string | null };

const SIZES = {
  sm: { box: "size-8 rounded-lg text-sm", icon: 16 },
  md: { box: "size-11 rounded-xl text-lg", icon: 22 },
  lg: { box: "size-16 rounded-2xl text-2xl", icon: 30 },
  xl: { box: "size-24 rounded-3xl text-4xl", icon: 44 },
};

/** The player's avatar: an icon (or their first letter) on a color, with an optional frame. Decorative. */
export function UserAvatar({
  name,
  look,
  size = "md",
  className = "",
}: {
  name: string;
  look: AvatarLook;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const Icon = look.icon ? AVATAR_ICONS[look.icon] : undefined;
  const dark = look.color === "color-espresso";
  const s = SIZES[size];

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center font-bold ${s.box} ${
        look.frame ? (AVATAR_FRAMES[look.frame] ?? "") : ""
      } ${className}`}
      style={{
        backgroundColor: AVATAR_COLORS[look.color ?? "color-butter"] ?? "var(--avatar-butter)",
        color: dark ? "var(--butter)" : "var(--espresso)",
      }}
    >
      {Icon ? <Icon size={s.icon} strokeWidth={2} /> : name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

/** The avatar fields from a profile row (missing before 0009_shop.sql is run). */
export function lookOf(profile: { avatar_icon?: string | null; avatar_color?: string | null; avatar_frame?: string | null }): AvatarLook {
  return { icon: profile.avatar_icon ?? null, color: profile.avatar_color ?? null, frame: profile.avatar_frame ?? null };
}

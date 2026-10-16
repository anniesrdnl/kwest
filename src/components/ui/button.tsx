import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 font-pixel tracking-wide pixel-raised " +
  "transition-transform duration-75 active:translate-y-1 active:shadow-none " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "bg-surface text-text hover:bg-surface-2",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 text-base",
  lg: "min-h-12 px-6 text-lg",
};

type StyleProps = { variant?: Variant; size?: Size; className?: string };

function classes({ variant = "primary", size = "md", className = "" }: StyleProps) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={classes({ variant, size, className })} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={classes({ variant, size, className })} {...props} />;
}

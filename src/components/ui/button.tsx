import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium " +
  "transition-colors duration-150 " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "bg-secondary text-secondary-fg hover:bg-secondary-hover",
  outline: "border border-border-strong/50 bg-surface text-text hover:border-text",
  ghost: "text-text-muted hover:text-text",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 text-[15px]",
  lg: "min-h-12 px-5 text-base",
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

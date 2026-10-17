import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-lg font-pixel font-semibold tracking-wide " +
  "transition-[color,background-color,border-color,translate,transform,box-shadow] duration-150 ease-out " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "border-2 border-ink bg-accent text-accent-fg shadow-[3px_3px_0_0_var(--ink)] hover:bg-accent-hover active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
  secondary: "border-2 border-ink bg-secondary text-secondary-fg shadow-[3px_3px_0_0_var(--ink)] hover:bg-secondary-hover active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
  outline: "border-2 border-border-strong bg-surface text-text hover:bg-surface-2",
  ghost: "text-text-muted hover:text-text",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 text-base",
  lg: "min-h-12 px-6 text-base",
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

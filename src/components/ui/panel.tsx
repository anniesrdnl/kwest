import type { ComponentProps, ReactNode } from "react";

type PanelProps = ComponentProps<"section"> & {
  title?: ReactNode;
  actions?: ReactNode;
  /** Fill color: white (default) or the blush hero color. */
  tone?: "plain" | "hero";
};

/** Main container: a box with stepped pixel corners, a 2px outline and a pixel shadow. */
export function Panel({ title, actions, tone = "plain", className = "", children, ...props }: PanelProps) {
  return (
    <div className="pixel-lift">
      <section
        className={`pixel-frame ${tone === "hero" ? "text-hero-fg [--frame-bg:var(--hero)]" : ""} ${className}`}
        {...props}
      >
        {(title || actions) && (
          <header className="flex min-h-11 items-center justify-between gap-3 px-5 pt-4">
            {title && (
              <h2 className={`font-pixel text-base ${tone === "hero" ? "text-hero-muted" : "text-text-muted"}`}>{title}</h2>
            )}
            {actions}
          </header>
        )}
        <div className={title || actions ? "px-5 pt-2 pb-5" : "p-5"}>{children}</div>
      </section>
    </div>
  );
}

import type { ComponentProps, ReactNode } from "react";

type PanelProps = ComponentProps<"section"> & {
  title?: ReactNode;
  actions?: ReactNode;
};

/** Main container: white card with a thick outline and a pixel shadow. */
export function Panel({ title, actions, className = "", children, ...props }: PanelProps) {
  return (
    <section className={`rounded-xl border border-border bg-surface shadow-card ${className}`} {...props}>
      {(title || actions) && (
        <header className="flex min-h-11 items-center justify-between gap-3 px-5 pt-4">
          {title && <h2 className="text-sm font-medium text-text-muted">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={title || actions ? "px-5 pt-2 pb-5" : "p-5"}>{children}</div>
    </section>
  );
}

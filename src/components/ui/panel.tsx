import type { ComponentProps, ReactNode } from "react";

type PanelProps = ComponentProps<"section"> & {
  title?: ReactNode;
  actions?: ReactNode;
};

/** Main container: surface color, notched pixel border, optional header strip. */
export function Panel({ title, actions, className = "", children, ...props }: PanelProps) {
  return (
    <section className={`bg-surface pixel-border ${className}`} {...props}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b-2 border-border bg-surface-2 px-4 py-2">
          {title && <h2 className="font-pixel text-base">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

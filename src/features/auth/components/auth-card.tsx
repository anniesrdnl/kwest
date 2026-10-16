import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children, footer }: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <header className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-text-muted">{subtitle}</p>}
        </header>
        {children}
      </section>
      {footer && <p className="text-center text-text-muted">{footer}</p>}
    </div>
  );
}

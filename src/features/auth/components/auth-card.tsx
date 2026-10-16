import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children, footer }: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="bg-surface p-6 pixel-border sm:p-8">
        <header className="mb-6 space-y-1">
          <h1 className="font-pixel text-2xl">{title}</h1>
          {subtitle && <p className="text-text-muted">{subtitle}</p>}
        </header>
        {children}
      </section>
      {footer && <p className="text-center text-text-muted">{footer}</p>}
    </div>
  );
}

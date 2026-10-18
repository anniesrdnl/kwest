import type { ReactNode } from "react";

/** One soft frame for several settings, split by thin lines (instead of a box for each). */
export function SettingsList({ children }: { children: ReactNode }) {
  return (
    <div className="pixel-lift">
      <div className="pixel-frame divide-y-2 divide-border">{children}</div>
    </div>
  );
}

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 p-5">
      <h3 className="text-base">{title}</h3>
      {children}
    </section>
  );
}

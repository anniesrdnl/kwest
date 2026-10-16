import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { HOME_ROUTE } from "@/lib/routes";

type ComingSoonProps = {
  icon: LucideIcon;
  title: string;
  phase: number;
  children: ReactNode;
  /** Extra content under the message (e.g. what already exists). */
  extra?: ReactNode;
};

/** Honest placeholder for a section that isn't built yet. */
export function ComingSoon({ icon: Icon, title, phase, children, extra }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="space-y-4 bg-surface p-6 pixel-border">
        <div className="flex items-center gap-3">
          <Icon size={28} aria-hidden className="text-accent-ink" />
          <h1 className="font-pixel text-3xl">{title}</h1>
        </div>
        <p className="inline-block bg-surface-2 px-2 py-1 font-pixel text-sm pixel-border">Coming in Phase {phase}</p>
        <div className="space-y-2 text-text-muted">{children}</div>
        <ButtonLink href={HOME_ROUTE} variant="secondary">
          Back to home
        </ButtonLink>
      </section>
      {extra}
    </div>
  );
}

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
      <section className="space-y-4 rounded-xl border border-border bg-surface p-6 sm:p-8">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <Icon size={22} aria-hidden />
        </span>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-fg">
            Coming in Phase {phase}
          </p>
        </div>
        <div className="space-y-2 text-text-muted">{children}</div>
        <ButtonLink href={HOME_ROUTE} variant="outline">
          Back to home
        </ButtonLink>
      </section>
      {extra}
    </div>
  );
}

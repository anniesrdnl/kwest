import type { ReactNode } from "react";

/** Notches the top corners of the title bar to match the card's stepped corners. */
const BAR_CLIP =
  "polygon(0 2px, 2px 2px, 2px 0, calc(100% - 2px) 0, calc(100% - 2px) 2px, 100% 2px, 100% 100%, 0 100%)";

/**
 * The card around every log in and sign up form: a small pixel window with a title bar.
 * The card rises in, then the form's fields follow one after another (see .stagger).
 */
export function AuthCard({ title, subtitle, children, footer }: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="rise pixel-lift">
        <section className="pixel-frame">
          <div
            aria-hidden
            className="m-[2px] mb-0 flex h-8 items-center gap-2 border-b-2 border-border bg-track px-3"
            style={{ clipPath: BAR_CLIP }}
          >
            {[0, 1, 2].map((i) => (
              <span key={i} className="twinkle size-2.5 bg-accent" style={{ animationDelay: `${i * 0.4}s` }} />
            ))}
          </div>
          <div className="stagger p-6 sm:p-8">
            <header className="mb-6 space-y-1">
              <h1 className="text-2xl sm:text-[2rem] sm:leading-tight">{title}</h1>
              {subtitle && <p className="text-text-muted">{subtitle}</p>}
            </header>
            {children}
          </div>
        </section>
      </div>
      {footer && (
        <p className="rise mx-auto w-fit bg-bg px-3 py-1 text-center text-text-muted" style={{ animationDelay: "0.5s" }}>
          {footer}
        </p>
      )}
    </div>
  );
}

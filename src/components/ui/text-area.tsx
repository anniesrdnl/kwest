"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

type TextAreaProps = Omit<ComponentProps<"textarea">, "id"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** Hide the label visually (it stays available to screen readers). */
  hideLabel?: boolean;
};

export const textAreaClass =
  "block w-full min-h-11 resize-y rounded-lg border border-border-strong bg-surface px-3 py-2 text-base text-text " +
  "placeholder:text-text-muted/70 transition-colors focus-visible:border-accent focus-visible:outline-2 " +
  "focus-visible:outline-offset-0 focus-visible:outline-focus/30 aria-invalid:border-wrong";

export function TextArea({ label, hint, error, hideLabel = false, className = "", rows = 2, ...props }: TextAreaProps) {
  const id = useId();
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "block text-sm font-medium"}>
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        className={textAreaClass}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-wrong">
          {error}
        </p>
      )}
    </div>
  );
}

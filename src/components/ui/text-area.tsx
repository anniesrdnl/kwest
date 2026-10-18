"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { inputBase } from "./input-styles";

type TextAreaProps = Omit<ComponentProps<"textarea">, "id"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** Hide the label visually (it stays available to screen readers). */
  hideLabel?: boolean;
};

export const textAreaClass = `${inputBase} block resize-y px-3`;

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

"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentProps, type ReactNode } from "react";

type FieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  hint?: ReactNode;
  errors?: string[];
  /** Extra element to the right of the label (e.g. a "Forgot?" link). */
  labelAside?: ReactNode;
};

const inputClass =
  "w-full min-h-11 rounded-lg border border-border-strong bg-surface px-3 py-2 text-base text-text " +
  "placeholder:text-text-muted/70 transition-colors focus-visible:border-accent focus-visible:outline-2 " +
  "focus-visible:outline-offset-0 focus-visible:outline-focus/30 aria-invalid:border-wrong";

export function Field({ label, hint, errors, labelAside, className = "", ...props }: FieldProps) {
  const id = useId();
  const hintId = hint && !errors?.length ? `${id}-hint` : undefined;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {labelAside}
      </div>
      <input
        id={id}
        className={inputClass}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        {...props}
      />
      {hint && !errors?.length && (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      {errors?.length ? (
        <p id={errorId} className="text-sm text-wrong">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

/** Password input with a show/hide toggle. */
export function PasswordField({ label, hint, errors, labelAside, ...props }: Omit<FieldProps, "type">) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const hintId = hint && !errors?.length ? `${id}-hint` : undefined;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={`${inputClass} pr-12`}
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 rounded-r-lg items-center justify-center text-text-muted hover:text-text"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
      {hint && !errors?.length && (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      {errors?.length ? (
        <p id={errorId} className="text-sm text-wrong">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

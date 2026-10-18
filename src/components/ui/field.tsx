"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { inputBase } from "./input-styles";

type FieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  hint?: ReactNode;
  errors?: string[];
  /** Extra element to the right of the label (e.g. a "Forgot?" link). */
  labelAside?: ReactNode;
};

const inputClass = `${inputBase} px-3`;

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
          className="absolute inset-y-[2px] right-[2px] flex w-11 items-center justify-center text-text-muted transition-colors hover:bg-track hover:text-text active:bg-accent active:text-accent-fg"
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

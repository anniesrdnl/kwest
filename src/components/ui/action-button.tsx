"use client";

import { useActionState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { idleState, type FormState } from "@/lib/forms";

type ActionButtonProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  pendingLabel: string;
  /** "link" renders a quiet text button (e.g. "Skip"). */
  appearance?: "primary" | "secondary" | "outline" | "link";
  size?: "md" | "lg";
  className?: string;
};

/** A one-button form for a Server Action, with a pending label and an announced error. */
export function ActionButton({
  action,
  children,
  pendingLabel,
  appearance = "primary",
  size,
  className = "",
}: ActionButtonProps) {
  const [state, formAction, pending] = useActionState(action, idleState);

  return (
    <form action={formAction} className={`space-y-3 ${className}`}>
      {appearance === "link" ? (
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-text-muted underline-offset-4 transition-colors hover:text-text hover:underline disabled:opacity-50"
        >
          {pending ? pendingLabel : children}
        </button>
      ) : (
        <Button type="submit" variant={appearance} size={size} disabled={pending} className="w-full sm:w-auto">
          {pending ? pendingLabel : children}
        </Button>
      )}
      <FormMessage state={state} />
    </form>
  );
}

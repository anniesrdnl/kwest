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
  appearance?: "primary" | "secondary" | "link";
  className?: string;
};

/** A one-button form for a Server Action, with a pending label and an announced error. */
export function ActionButton({ action, children, pendingLabel, appearance = "primary", className = "" }: ActionButtonProps) {
  const [state, formAction, pending] = useActionState(action, idleState);

  return (
    <form action={formAction} className={`space-y-3 ${className}`}>
      {appearance === "link" ? (
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center px-3 font-pixel text-sm text-text-muted underline underline-offset-4 hover:text-text disabled:opacity-50"
        >
          {pending ? pendingLabel : children}
        </button>
      ) : (
        <Button type="submit" variant={appearance} disabled={pending} className="w-full sm:w-auto">
          {pending ? pendingLabel : children}
        </Button>
      )}
      <FormMessage state={state} />
    </form>
  );
}

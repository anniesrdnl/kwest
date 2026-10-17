"use client";

import { useActionState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { idleState } from "@/lib/forms";
import { HOME_ROUTE } from "@/lib/routes";
import { updatePassword } from "../actions";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, idleState);

  if (state.status === "success") {
    return (
      <div className="space-y-5">
        <FormMessage state={state} />
        <ButtonLink href={HOME_ROUTE} size="lg" className="w-full">
          Go to Home
        </ButtonLink>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <PasswordField
        label="New password"
        name="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters."
        errors={state.fieldErrors?.password}
      />
      <PasswordField
        label="Confirm new password"
        name="confirmPassword"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.confirmPassword}
      />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}

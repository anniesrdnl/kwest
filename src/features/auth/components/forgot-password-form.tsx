"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { idleState, type FormState } from "@/lib/forms";
import { requestPasswordReset } from "../actions";

export function ForgotPasswordForm({ notice }: { notice?: FormState }) {
  const [state, action, pending] = useActionState(requestPasswordReset, notice ?? idleState);

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.fields?.email}
        errors={state.fieldErrors?.email}
      />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

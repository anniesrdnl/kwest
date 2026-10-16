"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, PasswordField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { idleState } from "@/lib/forms";
import { readTimeZone, useBrowserValue } from "@/lib/hooks/use-browser-value";
import { signUp } from "../actions";

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, idleState);
  // The browser's time zone (the server doesn't know it).
  const timezone = useBrowserValue(readTimeZone);

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field
        label="What should we call you?"
        name="displayName"
        autoComplete="nickname"
        required
        maxLength={40}
        defaultValue={state.fields?.displayName}
        errors={state.fieldErrors?.displayName}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.fields?.email}
        errors={state.fieldErrors?.email}
      />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters."
        errors={state.fieldErrors?.password}
      />
      <input type="hidden" name="timezone" value={timezone} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating your room…" : "Create account"}
      </Button>
    </form>
  );
}

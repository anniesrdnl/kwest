"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, PasswordField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { idleState, type FormState } from "@/lib/forms";
import { logIn } from "../actions";

export function LoginForm({ next, notice }: { next?: string; notice?: FormState }) {
  const [state, action, pending] = useActionState(logIn, notice ?? idleState);

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
      <PasswordField
        label="Password"
        name="password"
        autoComplete="current-password"
        required
        errors={state.fieldErrors?.password}
        labelAside={
          <Link href="/forgot-password" className="text-sm text-text-muted underline underline-offset-4 hover:text-text">
            Forgot password?
          </Link>
        }
      />
      {next && <input type="hidden" name="next" value={next} />}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Opening your room…" : "Log in"}
      </Button>
    </form>
  );
}

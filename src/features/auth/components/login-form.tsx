"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, PasswordField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { idleState } from "@/lib/forms";
import { readSearchParam, useBrowserValue } from "@/lib/hooks/use-browser-value";
import { logIn } from "../actions";

const readNext = readSearchParam("next");

export function LoginForm() {
  const [state, action, pending] = useActionState(logIn, idleState);

  // Where to go after logging in (?next=...). Read in the browser so the form
  // itself is static. The server action re-validates it (same-site paths only).
  const next = useBrowserValue(readNext);

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
      <input type="hidden" name="next" value={next} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Opening your room…" : "Log in"}
      </Button>
    </form>
  );
}

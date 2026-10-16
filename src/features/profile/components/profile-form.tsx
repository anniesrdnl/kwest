"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { idleState } from "@/lib/forms";
import { updateProfile } from "../actions";

export function ProfileForm({ displayName, username }: { displayName: string; username: string | null }) {
  const [state, action, pending] = useActionState(updateProfile, idleState);

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field
        label="Display name"
        name="displayName"
        required
        maxLength={40}
        defaultValue={state.fields?.displayName ?? displayName}
        errors={state.fieldErrors?.displayName}
      />
      <Field
        label="Username"
        name="username"
        autoComplete="username"
        maxLength={20}
        hint="Optional. 3–20 letters, numbers or underscores."
        defaultValue={state.fields?.username ?? username ?? ""}
        errors={state.fieldErrors?.username}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { formValue, validationError, type FormState } from "@/lib/forms";
import { getUser, safeNextPath } from "@/lib/auth/session";
import { HOME_ROUTE } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import { authErrorMessage } from "./errors";
import { forgotPasswordSchema, logInSchema, resetPasswordSchema, signUpSchema } from "./schemas";

/** Origin of the current request, so email links work on localhost, previews and production. */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  return origin && /^https?:\/\//.test(origin) ? origin : env.siteUrl;
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const fields = { displayName: formValue(formData, "displayName"), email: formValue(formData, "email") };
  const parsed = signUpSchema.safeParse({ ...fields, password: formValue(formData, "password") });
  if (!parsed.success) return validationError(parsed.error, fields);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${HOME_ROUTE}`,
    },
  });
  if (error) return { status: "error", message: authErrorMessage(error), fields };

  // With "Confirm email" on, there is no session yet.
  if (!data.session) {
    return { status: "success", message: "Check your email to confirm your account, then log in." };
  }

  // Store the browser's time zone so the daily goal resets at the student's midnight.
  const timezone = formValue(formData, "timezone");
  if (timezone && data.user) {
    // Invalid zones are rejected by the database trigger; the default (UTC) is kept then.
    await supabase.from("profiles").update({ timezone }).eq("id", data.user.id);
  }

  redirect(HOME_ROUTE);
}

export async function logIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const fields = { email: formValue(formData, "email") };
  const parsed = logInSchema.safeParse({ ...fields, password: formValue(formData, "password") });
  if (!parsed.success) return validationError(parsed.error, fields);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { status: "error", message: authErrorMessage(error), fields };

  redirect(safeNextPath(formValue(formData, "next"), HOME_ROUTE));
}

export async function logOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const fields = { email: formValue(formData, "email") };
  const parsed = forgotPasswordSchema.safeParse(fields);
  if (!parsed.success) return validationError(parsed.error, fields);

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=/reset-password`,
  });

  // Rate limits are worth reporting. Anything else gets the same answer,
  // so this form can't be used to find out who has an account.
  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { status: "error", message: authErrorMessage(error), fields };
  }
  return {
    status: "success",
    message: "If an account exists for that email, a reset link is on its way. Check your inbox (and spam).",
  };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) {
    return { status: "error", message: "This reset link has expired. Request a new one." };
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formValue(formData, "password"),
    confirmPassword: formValue(formData, "confirmPassword"),
  });
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: authErrorMessage(error) };

  return { status: "success", message: "Password updated." };
}

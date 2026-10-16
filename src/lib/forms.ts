import type { z } from "zod";

/** Shape returned by every form Server Action used with useActionState. */
export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /** Submitted values to refill the form after an error. Never includes passwords. */
  fields?: Record<string, string>;
};

export const idleState: FormState = { status: "idle" };

export function formValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function validationError(error: z.ZodError, fields?: Record<string, string>): FormState {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return { status: "error", message: "Please fix the highlighted fields.", fieldErrors, fields };
}

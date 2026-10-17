"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { formValue, validationError, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, { error: "Tell us what to call you." })
    .max(40, { error: "Keep it under 40 characters." }),
  username: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[A-Za-z0-9_]{3,20}$/.test(v), {
      error: "3–20 letters, numbers or underscores.",
    }),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const fields = { displayName: formValue(formData, "displayName"), username: formValue(formData, "username") };
  const parsed = profileSchema.safeParse(fields);
  if (!parsed.success) return validationError(parsed.error, fields);

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName, username: parsed.data.username || null })
    .eq("id", user.id);

  if (error?.code === "23505") {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: { username: ["That username is taken."] }, fields };
  }
  if (error) return { status: "error", message: "Couldn't save your profile. Please try again.", fields };

  refresh();
  return { status: "success", message: "Profile saved.", fields };
}

const dailyGoalSchema = z.coerce
  .number()
  .int()
  .min(5, { error: "Pick a goal between 5 and 200 cards." })
  .max(200, { error: "Pick a goal between 5 and 200 cards." });

/** Changes player_stats.daily_goal (the only stats column players may edit). */
export async function updateDailyGoal(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = dailyGoalSchema.safeParse(formValue(formData, "dailyGoal"));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("player_stats").update({ daily_goal: parsed.data }).eq("user_id", user.id);
  if (error) return { status: "error", message: "Couldn't save your daily goal. Please try again." };

  refresh();
  return { status: "success", message: `Daily goal set to ${parsed.data} cards.` };
}

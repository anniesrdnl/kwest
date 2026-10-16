import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email({ error: "Enter a valid email address." }));

// Supabase is set to a minimum of 8. bcrypt ignores anything past 72 bytes.
const newPassword = z
  .string()
  .min(8, { error: "Use at least 8 characters." })
  .max(72, { error: "Use 72 characters or fewer." });

export const signUpSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, { error: "Tell us what to call you." })
    .max(40, { error: "Keep it under 40 characters." }),
  email,
  password: newPassword,
});

export const logInSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password." }),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    error: "Passwords don't match.",
    path: ["confirmPassword"],
  });

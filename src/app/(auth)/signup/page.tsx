import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link";
import { SignUpForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Start your Kwest"
      subtitle="Free, no credit card. Ready in seconds."
      footer={
        <>
          Already have an account?{" "}
          <AuthSwitchLink href="/login">Log in</AuthSwitchLink>
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}

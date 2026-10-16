import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { SignUpForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Start your Kwest"
      subtitle="Free, no credit card. Your room is ready in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-text underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}

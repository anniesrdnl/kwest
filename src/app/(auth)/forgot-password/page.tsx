import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { LinkErrorNotice } from "@/features/auth/components/link-error-notice";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to choose a new one."
      footer={
        <Link href="/login" className="px-1 py-0.5 text-text underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:bg-track active:bg-accent">
          Back to log in
        </Link>
      }
    >
      <Suspense fallback={null}>
        <LinkErrorNotice
          searchParams={searchParams}
          message="That reset link is invalid or has expired. Request a new one below. Open the link in the same browser you requested it from."
        />
      </Suspense>
      <ForgotPasswordForm />
    </AuthCard>
  );
}

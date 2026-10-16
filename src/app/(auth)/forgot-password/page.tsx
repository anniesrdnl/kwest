import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import type { FormState } from "@/lib/forms";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to choose a new one."
      footer={
        <Link href="/login" className="text-text underline underline-offset-4">
          Back to log in
        </Link>
      }
    >
      <Suspense fallback={<ForgotPasswordForm />}>
        <FormWithParams searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function FormWithParams({ searchParams }: Pick<PageProps<"/forgot-password">, "searchParams">) {
  const params = await searchParams;
  const notice: FormState | undefined =
    params.error === "link_expired"
      ? { status: "error", message: "That reset link is invalid or has expired. Request a new one below." }
      : undefined;
  return <ForgotPasswordForm notice={notice} />;
}

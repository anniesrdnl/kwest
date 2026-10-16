import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LinkErrorNotice } from "@/features/auth/components/link-error-notice";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Your tomes are waiting."
      footer={
        <>
          New to Kwest?{" "}
          <Link href="/signup" className="text-text underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LinkErrorNotice searchParams={searchParams} message="That link is invalid or has expired. Please log in." />
      </Suspense>
      <LoginForm />
    </AuthCard>
  );
}

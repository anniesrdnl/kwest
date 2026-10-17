import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link";
import { LinkErrorNotice } from "@/features/auth/components/link-error-notice";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Your decks are waiting."
      footer={
        <>
          New to Kwest?{" "}
          <AuthSwitchLink href="/signup">Create an account</AuthSwitchLink>
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

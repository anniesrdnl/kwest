import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import type { FormState } from "@/lib/forms";

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
      {/* The search params are request data, so the form that uses them streams in. */}
      <Suspense fallback={<LoginForm />}>
        <LoginFormWithParams searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function LoginFormWithParams({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const notice: FormState | undefined =
    params.error === "link_expired"
      ? { status: "error", message: "That link is invalid or has expired. Please log in." }
      : undefined;
  return <LoginForm next={next} notice={notice} />;
}

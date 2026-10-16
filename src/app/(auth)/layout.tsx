import { Wordmark } from "@/components/pixel/wordmark";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <Wordmark />
      <main className="mt-8 w-full max-w-md">{children}</main>
    </div>
  );
}

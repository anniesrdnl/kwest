import { PixelBackdrop } from "@/components/brand/pixel-backdrop";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-center overflow-x-clip px-4 py-10">
      <PixelBackdrop />
      <main className="w-full max-w-md">{children}</main>
    </div>
  );
}

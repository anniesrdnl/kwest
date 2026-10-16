import { FormMessage } from "@/components/ui/form-message";

/** Shown when /auth/callback bounced an expired or invalid email link (?error=link_expired). */
export async function LinkErrorNotice({
  searchParams,
  message,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  message: string;
}) {
  const { error } = await searchParams;
  if (error !== "link_expired") return null;
  return (
    <div className="mb-5">
      <FormMessage state={{ status: "error", message }} />
    </div>
  );
}

import { CircleAlert, CircleCheck } from "lucide-react";
import type { FormState } from "@/lib/forms";

/** Announces the result of a form action. Color is never the only signal. */
export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) {
    return <div aria-live="polite" className="sr-only" />;
  }
  const isError = state.status === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2 px-3 py-2 text-sm pixel-border ${
        isError ? "bg-wrong/10 text-wrong" : "bg-correct/10 text-correct"
      }`}
    >
      {isError ? (
        <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden />
      ) : (
        <CircleCheck size={18} className="mt-0.5 shrink-0" aria-hidden />
      )}
      <p>{state.message}</p>
    </div>
  );
}

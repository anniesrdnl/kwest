import { LogOut } from "lucide-react";
import { PixelIcon } from "@/components/brand/pixel";
import { logOut } from "../actions";

/** `compact` is a square icon key (used in the nav). The default is a text button. */
export function LogOutButton({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <form action={logOut}>
      {compact ? (
        <button
          type="submit"
          aria-label="Log out"
          title="Log out"
          className={`group inline-flex size-10 items-center justify-center border-2 border-border bg-surface text-text-muted shadow-[0_3px_0_0_var(--shadow-soft)] transition-[background-color,border-color,color,translate,box-shadow] duration-150 ease-out hover:border-border-strong hover:bg-track hover:text-text active:translate-y-[3px] active:shadow-none ${className}`}
        >
          <PixelIcon name="logout" scale={2} className="transition-transform duration-150 group-hover:translate-x-0.5" />
        </button>
      ) : (
        <button
          type="submit"
          className={`inline-flex min-h-11 items-center gap-2 px-3 text-sm font-medium text-text-muted transition-colors hover:text-text ${className}`}
        >
          <LogOut size={16} aria-hidden />
          Log out
        </button>
      )}
    </form>
  );
}

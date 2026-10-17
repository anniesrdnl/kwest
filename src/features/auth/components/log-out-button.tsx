import { LogOut } from "lucide-react";
import { PixelIcon } from "@/components/brand/pixel";
import { logOut } from "../actions";

/** `compact` is a flat icon button (used in the nav). The default is a text button. */
export function LogOutButton({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <form action={logOut}>
      {compact ? (
        <button
          type="submit"
          aria-label="Log out"
          title="Log out"
          className={`group inline-flex size-10 items-center justify-center text-text-muted transition-[background-color,color,translate] duration-150 ease-out hover:bg-track hover:text-text active:translate-y-0.5 ${className}`}
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

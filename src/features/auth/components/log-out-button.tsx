import { LogOut } from "lucide-react";
import { logOut } from "../actions";

export function LogOutButton({ className = "" }: { className?: string }) {
  return (
    <form action={logOut}>
      <button
        type="submit"
        className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-text-muted hover:bg-surface-2 hover:text-text ${className}`}
      >
        <LogOut size={16} aria-hidden />
        Log out
      </button>
    </form>
  );
}

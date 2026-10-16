import { LogOut } from "lucide-react";
import { logOut } from "../actions";

export function LogOutButton({ className = "" }: { className?: string }) {
  return (
    <form action={logOut}>
      <button
        type="submit"
        className={`inline-flex min-h-11 items-center gap-2 px-3 font-pixel text-sm text-text-muted hover:text-text ${className}`}
      >
        <LogOut size={16} aria-hidden />
        Log out
      </button>
    </form>
  );
}

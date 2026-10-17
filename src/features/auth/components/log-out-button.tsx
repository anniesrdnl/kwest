import { LogOut } from "lucide-react";
import { logOut } from "../actions";

export function LogOutButton({ className = "" }: { className?: string }) {
  return (
    <form action={logOut}>
      <button
        type="submit"
        className={`inline-flex min-h-11 items-center gap-2 px-3 text-sm font-medium text-text-muted transition-[color,background-color,translate] duration-150 hover:bg-track hover:text-text active:translate-y-px ${className}`}
      >
        <LogOut size={16} aria-hidden />
        Log out
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { idleState } from "@/lib/forms";
import { updateDailyGoal } from "../actions";
import { DAILY_GOAL_OPTIONS } from "../constants";

export function DailyGoalForm({ goal }: { goal: number }) {
  const [state, action, pending] = useActionState(updateDailyGoal, idleState);
  const options: number[] = DAILY_GOAL_OPTIONS.includes(goal as (typeof DAILY_GOAL_OPTIONS)[number])
    ? [...DAILY_GOAL_OPTIONS]
    : [...DAILY_GOAL_OPTIONS, goal].sort((a, b) => a - b);

  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Cards to review each day</legend>
        <div className="flex flex-wrap gap-2">
          {options.map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name="dailyGoal" value={n} defaultChecked={n === goal} className="peer sr-only" />
              <span className="inline-flex min-h-11 min-w-14 items-center justify-center border-2 border-border px-3 font-medium tabular-nums transition-colors hover:bg-accent-soft peer-checked:border-border-strong peer-checked:bg-accent-soft peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
                {n}
              </span>
            </label>
          ))}
        </div>
        <p className="text-sm text-text-muted">Missing a day is fine. Nothing resets.</p>
      </fieldset>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save goal"}
      </Button>
    </form>
  );
}

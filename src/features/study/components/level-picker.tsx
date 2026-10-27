import { LEVELS, type Level } from "../logic";

/** Choose how hard the quiz is. Three big choices; the radio buttons are native, so the keyboard works. */
export function LevelPicker({ level, onChange }: { level: Level; onChange: (level: Level) => void }) {
  return (
    <fieldset className="text-left">
      <legend className="mb-2 font-display text-base">Choose a level</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LEVELS.map((l) => (
          <label key={l.key} className="block cursor-pointer">
            <input
              type="radio"
              name="level"
              value={l.key}
              checked={level === l.key}
              onChange={() => onChange(l.key)}
              className="peer sr-only"
            />
            <span className="flex h-full flex-col gap-1 border-2 border-border bg-surface p-3 transition-colors hover:bg-accent-soft peer-checked:border-border-strong peer-checked:bg-accent-soft peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
              <span className="font-display text-base">{l.label}</span>
              <span className="text-sm font-medium">{l.way}</span>
              <span className="text-sm text-text-muted">{l.blurb}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const PAIRS = [
  ["hola", "hello"],
  ["photosynthesis", "how plants make food"],
  ["7 × 8", "56"],
  ["bonjour", "hello"],
  ["Paris", "capital of France"],
  ["noun", "a name for a thing"],
  ["gracias", "thank you"],
  ["H₂O", "water"],
] as const;

function Row() {
  return (
    <ul className="flex shrink-0 items-center gap-10 pr-10">
      {PAIRS.map(([front, back]) => (
        <li key={front} className="flex items-center gap-3 whitespace-nowrap">
          <span className="font-pixel text-xl">{front}</span>
          <span aria-hidden className="text-accent-ink">
            →
          </span>
          <span className="text-text-muted">{back}</span>
        </li>
      ))}
    </ul>
  );
}

/** A scrolling strip of example cards. Hover to pause. */
export function Ticker() {
  return (
    <div className="ticker-pause overflow-hidden border-y border-border bg-surface py-4" role="region" aria-label="Example cards">
      <div className="ticker flex w-max">
        <Row />
        <div aria-hidden>
          <Row />
        </div>
      </div>
    </div>
  );
}

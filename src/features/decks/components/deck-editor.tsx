"use client";

import { ArrowDown, ArrowUp, ClipboardPaste, Plus, StickyNote, Trash2 } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { TextArea, textAreaClass } from "@/components/ui/text-area";
import type { CardKind } from "@/lib/types/database";
import { saveDeck } from "../actions";
import { DECK_COLORS, LIMITS, parseCardText, type DeckInput } from "../schemas";
import { deckColor } from "./deck-badge";

type Row = {
  key: string;
  id: string | null;
  kind: CardKind;
  prompt: string;
  answer: string;
  explanation: string;
  showNote: boolean;
};

type EditorProps = {
  initial: DeckInput;
  /** Where Cancel goes. */
  cancelHref: string;
};

const LABELS: Record<CardKind, { front: string; back: string }> = {
  term: { front: "Word", back: "Meaning" },
  question: { front: "Question", back: "Answer" },
};

function blankRow(key: string, card?: Partial<Row>): Row {
  return { key, id: null, kind: "term", prompt: "", answer: "", explanation: "", showNote: false, ...card };
}

const isBlank = (r: Row) => !r.prompt.trim() && !r.answer.trim() && !r.explanation.trim();

/**
 * Create or edit a deck: details, color and an ordered list of cards. Saves everything at once.
 *
 * Next.js keeps pages you leave hidden (React <Activity>), so form state survives navigation.
 * That's good for an unsaved draft, but after a successful save the editor must start fresh
 * next time (otherwise "New deck" would still show the last deck). So after a save, the form
 * remounts with a new key when the page is hidden.
 */
export function DeckEditor(props: EditorProps) {
  const [generation, setGeneration] = useState(0);
  const saved = useRef(false);

  useLayoutEffect(() => {
    return () => {
      if (saved.current) {
        saved.current = false;
        setGeneration((g) => g + 1);
      }
    };
  }, []);

  return <EditorForm key={generation} {...props} onSaving={(v) => (saved.current = v)} />;
}

function EditorForm({ initial, cancelHref, onSaving }: EditorProps & { onSaving: (saving: boolean) => void }) {
  const [title, setTitle] = useState(initial.title);
  const [subject, setSubject] = useState(initial.subject);
  const [description, setDescription] = useState(initial.description);
  const [colorKey, setColorKey] = useState(initial.colorKey);
  // Keys must match on the server and in the browser, so they come from a counter, not random ids.
  const [rows, setRows] = useState<Row[]>(() => {
    const cards = initial.cards.map((c, i) =>
      blankRow(`row-${i}`, { ...c, explanation: c.explanation ?? "", showNote: Boolean(c.explanation) }),
    );
    return cards.length ? cards : [blankRow("row-0"), blankRow("row-1")];
  });
  const nextKey = useRef(Math.max(initial.cards.length, 2));
  const makeRow = (card?: Partial<Row>) => blankRow(`row-${nextKey.current++}`, card);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showImport, setShowImport] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const savingRef = useRef(false);
  const focusKey = useRef<string | null>(null);

  const snapshot = (r: Row[]) =>
    JSON.stringify([title, subject, description, colorKey, r.filter((x) => !isBlank(x)).map((c) => ({ id: c.id, kind: c.kind, prompt: c.prompt, answer: c.answer, explanation: c.explanation }))]);
  const initialSnapshot = useMemo(
    () =>
      JSON.stringify([
        initial.title,
        initial.subject,
        initial.description,
        initial.colorKey,
        initial.cards.map((c) => ({ id: c.id, kind: c.kind, prompt: c.prompt, answer: c.answer, explanation: c.explanation ?? "" })),
      ]),
    [initial],
  );
  const dirty = snapshot(rows) !== initialSnapshot;

  // Warn before closing or reloading the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!savingRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Move focus to a newly added card.
  useEffect(() => {
    if (!focusKey.current) return;
    formRef.current?.querySelector<HTMLTextAreaElement>(`[data-row="${focusKey.current}"] textarea`)?.focus();
    focusKey.current = null;
  }, [rows]);

  // After a failed save, move focus to the first problem.
  useEffect(() => {
    if (!message) return;
    const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (first ?? document.getElementById("deck-editor-message"))?.focus();
  }, [message, errors]);

  /** Clears a field's error as soon as the user changes it. */
  const clearError = (...names: string[]) =>
    setErrors((e) => (names.some((n) => n in e) ? Object.fromEntries(Object.entries(e).filter(([k]) => !names.includes(k))) : e));

  const update = (key: string, patch: Partial<Row>) => {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    clearError(...Object.keys(patch).map((field) => `${key}.${field}`), "cards");
  };

  const move = (index: number, by: -1 | 1) =>
    setRows((rs) => {
      const to = index + by;
      if (to < 0 || to >= rs.length) return rs;
      const copy = [...rs];
      [copy[index], copy[to]] = [copy[to], copy[index]];
      return copy;
    });

  const remove = (key: string) => setRows((rs) => (rs.length === 1 ? [makeRow()] : rs.filter((r) => r.key !== key)));

  const addRow = () => {
    const row = makeRow({ kind: rows.at(-1)?.kind ?? "term" });
    focusKey.current = row.key;
    setRows((rs) => [...rs, row]);
  };

  const importCards = (cards: { prompt: string; answer: string }[]) => {
    setRows((rs) => [...rs.filter((r) => !isBlank(r)), ...cards.map((c) => makeRow(c))].slice(0, LIMITS.cards));
    setShowImport(false);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const kept = rows.filter((r) => !isBlank(r));
    // Map "cards.N.field" errors back to the row they belong to.
    const keyFor = (path: string) => {
      const m = /^cards\.(\d+)\.(\w+)$/.exec(path);
      return m ? `${kept[Number(m[1])]?.key}.${m[2]}` : path;
    };

    startTransition(async () => {
      savingRef.current = true;
      onSaving(true);
      const result = await saveDeck({
        id: initial.id,
        title,
        subject,
        description,
        colorKey,
        cards: kept.map((r) => ({ id: r.id, kind: r.kind, prompt: r.prompt, answer: r.answer, explanation: r.explanation })),
      });
      // On success the action redirects, so only failures come back here.
      if (result && !result.ok) {
        savingRef.current = false;
        onSaving(false);
        setErrors(Object.fromEntries(Object.entries(result.errors ?? {}).map(([k, v]) => [keyFor(k), v])));
        setMessage(result.message);
      }
    });
  };

  const cardCount = rows.filter((r) => !isBlank(r)).length;

  return (
    <form ref={formRef} onSubmit={save} noValidate className="space-y-8">
      <section aria-labelledby="details-heading" className="space-y-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 id="details-heading" className="text-lg font-semibold">
          Details
        </h2>
        <Field
          label="Name"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            clearError("title");
          }}
          maxLength={LIMITS.title}
          placeholder="e.g. Biology: The Cell"
          errors={errors.title ? [errors.title] : undefined}
          required
        />
        <Field
          label="Subject (optional)"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            clearError("subject");
          }}
          maxLength={LIMITS.subject}
          placeholder="e.g. Biology"
          errors={errors.subject ? [errors.subject] : undefined}
        />
        <TextArea
          label="Description (optional)"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearError("description");
          }}
          maxLength={LIMITS.description}
          error={errors.description}
        />
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Color</legend>
          <div className="flex flex-wrap gap-2">
            {DECK_COLORS.map(({ key, name }) => (
              <label key={key} className="relative inline-flex size-11 cursor-pointer items-center justify-center">
                <input
                  type="radio"
                  name="color"
                  value={key}
                  checked={colorKey === key}
                  onChange={() => setColorKey(key)}
                  className="peer sr-only"
                />
                <span className="sr-only">{name}</span>
                <span
                  aria-hidden
                  className="size-8 rounded-full ring-offset-2 ring-offset-surface peer-checked:ring-2 peer-checked:ring-text peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-focus"
                  style={{ backgroundColor: deckColor(key) }}
                />
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section aria-labelledby="cards-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="cards-heading" className="text-lg font-semibold">
            Cards <span className="font-normal text-text-muted">({cardCount})</span>
          </h2>
          <Button variant="secondary" onClick={() => setShowImport((v) => !v)} aria-expanded={showImport}>
            <ClipboardPaste size={18} aria-hidden />
            Paste a list
          </Button>
        </div>

        {showImport && <ImportPanel onImport={importCards} onCancel={() => setShowImport(false)} />}
        {errors.cards && <p className="text-sm text-wrong">{errors.cards}</p>}

        <ol className="space-y-3">
          {rows.map((row, i) => (
            <CardRow
              key={row.key}
              row={row}
              number={i + 1}
              isFirst={i === 0}
              isLast={i === rows.length - 1}
              errors={errors}
              onChange={(patch) => update(row.key, patch)}
              onMove={(by) => move(i, by)}
              onRemove={() => remove(row.key)}
            />
          ))}
        </ol>

        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= LIMITS.cards}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong text-[15px] font-medium text-text-muted transition-colors hover:border-accent hover:text-accent-ink disabled:opacity-50"
        >
          <Plus size={18} aria-hidden />
          Add card
        </button>
        <p className="text-sm text-text-muted">
          Empty cards are skipped when you save. A deck can have up to {LIMITS.cards} cards.
        </p>
      </section>

      <div className="space-y-3 border-t border-border pt-6">
        {message && (
          <p id="deck-editor-message" role="alert" tabIndex={-1} className="rounded-lg border border-wrong/30 bg-wrong/10 px-3 py-2 text-sm text-wrong">
            {message}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <ButtonLink href={cancelHref} variant="ghost">
            Cancel
          </ButtonLink>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Saving…" : "Save deck"}
          </Button>
        </div>
      </div>
    </form>
  );
}

type CardRowProps = {
  row: Row;
  number: number;
  isFirst: boolean;
  isLast: boolean;
  errors: Record<string, string>;
  onChange: (patch: Partial<Row>) => void;
  onMove: (by: -1 | 1) => void;
  onRemove: () => void;
};

function CardRow({ row, number, isFirst, isLast, errors, onChange, onMove, onRemove }: CardRowProps) {
  const labels = LABELS[row.kind];
  const iconButton =
    "inline-flex size-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-text disabled:opacity-30";

  return (
    <li data-row={row.key} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-muted tabular-nums">{number}</span>
          <fieldset className="inline-flex rounded-lg bg-surface-2 p-1">
            <legend className="sr-only">Card {number} type</legend>
            {(["term", "question"] as const).map((kind) => (
              <label key={kind} className="cursor-pointer">
                <input
                  type="radio"
                  name={`kind-${row.key}`}
                  value={kind}
                  checked={row.kind === kind}
                  onChange={() => onChange({ kind })}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium text-text-muted peer-checked:bg-surface peer-checked:text-text peer-checked:shadow-card peer-focus-visible:outline-2 peer-focus-visible:outline-focus">
                  {kind === "term" ? "Word" : "Question"}
                </span>
              </label>
            ))}
          </fieldset>
        </div>
        <div className="flex items-center">
          <button type="button" className={iconButton} onClick={() => onMove(-1)} disabled={isFirst} aria-label={`Move card ${number} up`}>
            <ArrowUp size={18} aria-hidden />
          </button>
          <button type="button" className={iconButton} onClick={() => onMove(1)} disabled={isLast} aria-label={`Move card ${number} down`}>
            <ArrowDown size={18} aria-hidden />
          </button>
          <button
            type="button"
            className={`${iconButton} hover:text-wrong`}
            onClick={onRemove}
            aria-label={`Delete card ${number}`}
          >
            <Trash2 size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <TextArea
          label={
            <>
              {labels.front}
              <span className="sr-only"> for card {number}</span>
            </>
          }
          value={row.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
          maxLength={LIMITS.side}
          error={errors[`${row.key}.prompt`]}
        />
        <TextArea
          label={
            <>
              {labels.back}
              <span className="sr-only"> for card {number}</span>
            </>
          }
          value={row.answer}
          onChange={(e) => onChange({ answer: e.target.value })}
          maxLength={LIMITS.side}
          error={errors[`${row.key}.answer`]}
        />
      </div>

      {row.showNote ? (
        <TextArea
          label={
            <>
              Note<span className="sr-only"> for card {number}</span>{" "}
              <span className="font-normal text-text-muted">(shown after you answer)</span>
            </>
          }
          value={row.explanation}
          onChange={(e) => onChange({ explanation: e.target.value })}
          maxLength={LIMITS.note}
          error={errors[`${row.key}.explanation`]}
        />
      ) : (
        <button
          type="button"
          onClick={() => onChange({ showNote: true })}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-text-muted hover:text-text"
        >
          <StickyNote size={16} aria-hidden />
          Add a note<span className="sr-only"> to card {number}</span>
        </button>
      )}
    </li>
  );
}

function ImportPanel({
  onImport,
  onCancel,
}: {
  onImport: (cards: { prompt: string; answer: string }[]) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const found = parseCardText(text);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-4">
      <label htmlFor="import-text" className="block text-sm font-medium">
        Paste one card per line
      </label>
      <p id="import-help" className="text-sm text-text-muted">
        Put a tab, &quot; - &quot; or &quot;:&quot; between the front and the back. Lists copied from Quizlet work as they are.
      </p>
      <textarea
        id="import-text"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-describedby="import-help import-count"
        placeholder={"Photosynthesis - How plants make food from light\nMitochondria - The cell's power plant"}
        className={textAreaClass}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p id="import-count" aria-live="polite" className="text-sm text-text-muted">
          {found.length === 1 ? "1 card found" : `${found.length} cards found`}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onImport(found)} disabled={found.length === 0}>
            Add {found.length || ""} cards
          </Button>
        </div>
      </div>
    </div>
  );
}

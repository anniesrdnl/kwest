import { z } from "zod";

// Limits match the database (0001_schema.sql and the 500-card trigger).
export const LIMITS = {
  title: 120,
  subject: 60,
  description: 1000,
  side: 500,
  note: 1000,
  cards: 500,
} as const;

export const DECK_COLORS = [
  { key: "spine-1", name: "Red" },
  { key: "spine-2", name: "Blue" },
  { key: "spine-3", name: "Green" },
  { key: "spine-4", name: "Purple" },
  { key: "spine-5", name: "Gold" },
  { key: "spine-6", name: "Teal" },
  { key: "spine-7", name: "Orange" },
  { key: "spine-8", name: "Indigo" },
] as const;

export const cardSchema = z.object({
  id: z.uuid().nullable(),
  kind: z.enum(["term", "question"]),
  prompt: z
    .string()
    .trim()
    .min(1, { error: "Fill in the front." })
    .max(LIMITS.side, { error: `Keep it under ${LIMITS.side} characters.` }),
  answer: z
    .string()
    .trim()
    .min(1, { error: "Fill in the back." })
    .max(LIMITS.side, { error: `Keep it under ${LIMITS.side} characters.` }),
  explanation: z.string().trim().max(LIMITS.note, { error: `Keep the note under ${LIMITS.note} characters.` }),
});

export const deckSchema = z.object({
  id: z.uuid().nullable(),
  title: z
    .string()
    .trim()
    .min(1, { error: "Give your deck a name." })
    .max(LIMITS.title, { error: `Keep the name under ${LIMITS.title} characters.` }),
  subject: z.string().trim().max(LIMITS.subject, { error: `Keep the subject under ${LIMITS.subject} characters.` }),
  description: z
    .string()
    .trim()
    .max(LIMITS.description, { error: `Keep the description under ${LIMITS.description} characters.` }),
  colorKey: z.string().regex(/^spine-[1-8]$/),
  cards: z
    .array(cardSchema)
    .min(1, { error: "Add at least one card." })
    .max(LIMITS.cards, { error: `A deck can have up to ${LIMITS.cards} cards.` }),
});

export type CardInput = z.input<typeof cardSchema>;
export type DeckInput = z.input<typeof deckSchema>;

/** Result of saveDeck. `errors` keys are paths like "title" or "cards.3.prompt". */
export type SaveDeckResult = { ok: false; message: string; errors?: Record<string, string> };

export type ParsedCard = { prompt: string; answer: string; explanation?: string };

// A first row like "Term<tab>Definition" is a header from a spreadsheet, not a card.
const HEADER_WORDS = /^(front|back|term|terms|definition|definitions|word|words|meaning|meanings|question|questions|answer|answers|note|notes)$/i;

/**
 * Turns pasted text into cards. One card per line; the front and back are split
 * by a tab (what Quizlet and spreadsheets export), or by " - " or ":" when there's no tab.
 * With tabs, a third column becomes the card's note.
 */
export function parseCardText(text: string): ParsedCard[] {
  const cards: ParsedCard[] = [];
  let first = true;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const isFirst = first;
    first = false;

    if (raw.includes("\t")) {
      const [prompt = "", answer = "", ...rest] = raw.split("\t").map((s) => s.trim());
      if (isFirst && HEADER_WORDS.test(prompt) && HEADER_WORDS.test(answer)) continue;
      const explanation = rest.filter(Boolean).join(" ");
      if (prompt && answer) cards.push(explanation ? { prompt, answer, explanation } : { prompt, answer });
      continue;
    }

    const sep = line.includes(" - ") ? " - " : line.includes(":") ? ":" : null;
    if (!sep) continue;
    const at = line.indexOf(sep);
    const prompt = line.slice(0, at).trim();
    const answer = line.slice(at + sep.length).trim();
    if (prompt && answer) cards.push({ prompt, answer });
  }
  return cards;
}

/**
 * Turns a CSV file (what Excel and Google Sheets save) into tab-separated lines,
 * so it can go through parseCardText. Handles quoted cells with commas, quotes and line breaks.
 */
export function csvToTabText(csv: string): string {
  // Excel in some regions saves with ";" instead of ",".
  const firstLine = csv.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (quoted) {
      if (ch === '"' && csv[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && csv[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  row.push(cell);
  rows.push(row);

  // Line breaks and tabs inside a cell would split the card, so they become spaces.
  return rows.map((r) => r.map((c) => c.replace(/\s+/g, " ").trim()).join("\t")).join("\n");
}

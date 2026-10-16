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

/**
 * Turns pasted text into cards. One card per line; the front and back are split
 * by a tab (what Quizlet exports), or by " - " or ":" when there's no tab.
 */
export function parseCardText(text: string): { prompt: string; answer: string }[] {
  const cards: { prompt: string; answer: string }[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const sep = raw.includes("\t") ? "\t" : line.includes(" - ") ? " - " : line.includes(":") ? ":" : null;
    if (!sep) continue;
    const at = raw.indexOf(sep);
    const prompt = raw.slice(0, at).trim();
    const answer = raw.slice(at + sep.length).trim();
    if (prompt && answer) cards.push({ prompt, answer });
  }
  return cards;
}

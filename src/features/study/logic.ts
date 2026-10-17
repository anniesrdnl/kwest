import type { CardKind, QuestionType } from "@/lib/types/database";

export type StudyMode = "flashcards" | "quiz";

/** A card plus the player's progress on it (no progress = never studied). */
export type StudyCard = {
  id: string;
  kind: CardKind;
  prompt: string;
  answer: string;
  explanation: string | null;
  box: number | null;
  dueAt: string | null;
  recentWrong: number;
};

export const SESSION_SIZE: Record<StudyMode, number> = { flashcards: 20, quiz: 10 };

/** Cards answered faster than this earn no XP on the server (anti click-through). */
export const MIN_ANSWER_MS = 700;

/**
 * Picks the cards for one session, most useful first:
 * due reviews, then cards often missed, then new cards, then everything else
 * (soonest review first).
 */
export function pickSessionCards(cards: StudyCard[], mode: StudyMode, now = Date.now()): StudyCard[] {
  const rank = (c: StudyCard) => {
    if (c.box !== null && (c.dueAt === null || Date.parse(c.dueAt) <= now)) return 0; // due
    if (c.recentWrong > 0) return 1; // weak
    if (c.box === null) return 2; // new
    return 3;
  };
  return [...cards]
    .map((c, i) => ({ c, i, r: rank(c) }))
    .sort((a, b) => a.r - b.r || b.c.recentWrong - a.c.recentWrong || dueTime(a.c) - dueTime(b.c) || a.i - b.i)
    .slice(0, SESSION_SIZE[mode])
    .map(({ c }) => c);
}

const dueTime = (c: StudyCard) => (c.dueAt ? Date.parse(c.dueAt) : 0);

/** Same rule as private.normalize_answer in the database: lowercase, no punctuation, single spaces. */
export function normalize(text: string): string {
  return text
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type QuizQuestion =
  | { type: "mc"; card: StudyCard; options: string[] }
  | { type: "tf"; card: StudyCard; shownAnswer: string }
  | { type: "id"; card: StudyCard };

/** Other cards' answers that don't look like this card's answer. */
export function wrongAnswers(card: StudyCard, pool: StudyCard[]): string[] {
  const seen = new Set([normalize(card.answer)]);
  const out: string[] = [];
  for (const c of shuffle(pool)) {
    const key = normalize(c.answer);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(c.answer);
  }
  return out;
}

/**
 * Builds quiz questions. New cards get easier formats (multiple choice, true/false);
 * cards you already know get typed answers. Runs in the browser after "Start",
 * so the random choices never differ between server and browser.
 */
export function buildQuiz(cards: StudyCard[], pool: StudyCard[]): QuizQuestion[] {
  return cards.map((card, i): QuizQuestion => {
    const wrong = wrongAnswers(card, pool);
    const known = (card.box ?? 0) >= 2;
    let type: QuestionType = known ? "id" : i % 3 === 2 ? "tf" : "mc";
    if (type === "mc" && wrong.length < 3) type = wrong.length >= 1 ? "tf" : "id";
    if (type === "tf" && wrong.length < 1) type = "id";

    if (type === "mc") return { type, card, options: shuffle([card.answer, ...wrong.slice(0, 3)]) };
    if (type === "tf") return { type, card, shownAnswer: Math.random() < 0.5 ? card.answer : wrong[0] };
    return { type: "id", card };
  });
}

export type Level = "easy" | "average" | "difficult";

/** The quiz levels, from gentlest to hardest. */
export const LEVELS: readonly { key: Level; label: string; way: string; blurb: string }[] = [
  { key: "easy", label: "Easy", way: "Multiple choice", blurb: "Pick the right answer from a short list." },
  { key: "average", label: "Average", way: "Matching", blurb: "Match each card with its answer." },
  { key: "difficult", label: "Difficult", way: "Identification", blurb: "Type each answer from memory." },
];

/** One round of matching: a few cards, and their answers in a shuffled order. */
export type MatchRound = { cards: StudyCard[]; answers: string[] };

/** One step of a quiz: a single question, or a round of matching. */
export type QuizUnit = { question: QuizQuestion } | { round: MatchRound };

const MATCH_MAX = 5;

/** Splits n cards into rounds of 2 to 5 that are as even as possible: 10 is 5+5, 7 is 4+3, 6 is 3+3. */
function roundSizes(n: number): number[] {
  const rounds = Math.ceil(n / MATCH_MAX);
  const base = Math.floor(n / rounds);
  return Array.from({ length: rounds }, (_, i) => base + (i < n % rounds ? 1 : 0));
}

/**
 * Builds a quiz for one level. Easy is multiple choice, average is matching and difficult is a typed answer.
 * A deck with too few other answers can't make choices, and one card can't make a match, so those fall back
 * to a typed answer. Runs in the browser after "Start", so the random order never differs from the server.
 */
export function buildLevelQuiz(cards: StudyCard[], pool: StudyCard[], level: Level): QuizUnit[] {
  if (level === "average" && cards.length >= 2) {
    let at = 0;
    return roundSizes(cards.length).map((size) => {
      const group = cards.slice(at, at + size);
      at += size;
      return { round: { cards: group, answers: shuffle(group.map((c) => c.answer)) } };
    });
  }
  return cards.map((card): QuizUnit => {
    const wrong = level === "easy" ? wrongAnswers(card, pool) : [];
    if (wrong.length === 0) return { question: { type: "id", card } };
    return { question: { type: "mc", card, options: shuffle([card.answer, ...wrong.slice(0, 3)]) } };
  });
}

/** The instruction above a matching round. */
export function matchAsk(cards: StudyCard[]): string {
  if (cards.every((c) => c.kind === "term")) return "Match each word with its meaning";
  if (cards.every((c) => c.kind === "question")) return "Match each question with its answer";
  return "Match each card with its answer";
}

/** What the player sees as the question, per type. Typed answers on word cards ask for the word. */
export function questionText(q: QuizQuestion): { ask: string; text: string } {
  if (q.type === "id" && q.card.kind === "term") return { ask: "Type the word for this meaning", text: q.card.answer };
  if (q.type === "id") return { ask: "Type the answer", text: q.card.prompt };
  if (q.type === "tf") return { ask: "True or false?", text: q.card.prompt };
  return { ask: q.card.kind === "term" ? "Pick the meaning" : "Pick the answer", text: q.card.prompt };
}

import { shuffle, wrongAnswers, type QuizQuestion, type StudyCard } from "./logic";

/**
 * Challenge rules. The win check mirrors finish_session's "dust-duel" rule in
 * 0002_functions.sql (8 correct with at most 2 wrong), so keep them in sync.
 */
export const CHALLENGE = {
  /** Right answers needed to win. */
  winHits: 8,
  /** The game ends on this many misses. */
  maxMisses: 3,
  /** Fewer cards would repeat too often and leave no wrong options for multiple choice. */
  minCards: 4,
  /** Seconds to answer, per question type. */
  timeMs: { mc: 15_000, tf: 15_000, id: 25_000 },
} as const;

/** Most questions a game can take: every win needs winHits, every loss ends at maxMisses. */
const MAX_QUESTIONS = CHALLENGE.winHits + CHALLENGE.maxMisses - 1;

/**
 * Cards for one game. Goes through the deck in random order, then starts over,
 * so small decks repeat cards but never the same card twice in a row.
 */
export function pickChallengeCards(cards: StudyCard[]): StudyCard[] {
  const out: StudyCard[] = [];
  while (out.length < MAX_QUESTIONS && cards.length > 0) {
    let round = shuffle(cards);
    if (round.length > 1 && round[0].id === out.at(-1)?.id) round = [...round.slice(1), round[0]];
    out.push(...round);
  }
  return out.slice(0, MAX_QUESTIONS);
}

/** Multiple choice for most cards; cards you know well (box 3+) ask you to type. */
export function challengeQuestion(card: StudyCard, pool: StudyCard[]): QuizQuestion {
  const wrong = wrongAnswers(card, pool);
  if ((card.box ?? 0) >= 3 || wrong.length < 3) return { type: "id", card };
  return { type: "mc", card, options: shuffle([card.answer, ...wrong.slice(0, 3)]) };
}

export const isGameOver = (hits: number, misses: number) => hits >= CHALLENGE.winHits || misses >= CHALLENGE.maxMisses;

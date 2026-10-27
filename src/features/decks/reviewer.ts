import { LIMITS } from "./schemas";

export type ParsedCard = { prompt: string; answer: string; explanation?: string; kind?: "term" | "question" };

/** What the reader found: the cards, and how many lines were left out as not review material. */
export type Reviewer = { cards: ParsedCard[]; left: number };

// A first row like "Term<tab>Definition" or "Command<tab>What it does" is a table header, not a card.
const HEADER_WORDS =
  /^(front|back|terms?|definitions?|words?|meanings?|questions?|answers?|notes?|commands?|syntax|usage|descriptions?|functions?|purpose|examples?|options?|flags?|tools?|concepts?|topics?|keywords?|items?|details?|explanations?|what (?:it|this) (?:does|means|is)|how to use(?: it)?)$/i;

/** A line near the top that names the document ("Kali Linux Commands - Simple Reviewer"), not a card. */
const TITLE_END = /\b(reviewer|review|study guide|cheat ?sheet|handout|worksheet|lecture notes|reference|syllabus|module|lesson)$/i;

/** Page headers and footers print the same line on every page. A line seen this often is not a card. */
const REPEATS = 3;

/** Headings and labels. A line that starts like this is not a term. */
const LABEL =
  /^(?:(?:step|figure|fig|table|chapter|section|part|unit|lesson|module|page|slide|appendix)\.?\s*[\dIVXL]+\b.*|source|sources|reference|references|summary|objectives?|introduction|conclusion|agenda|outline|contents|overview|key points?|learning outcomes?|in summary|in conclusion|however|therefore|first|second|third|finally|date|time|name|author|subject|topic|prepared by|course|course code|code|student|instructor|lecturer|professor|school|department|semester|title|version)$/i;

/** A date such as "August, 2026" or "12 March 2025". */
const DATE = /^(\d{1,2}(st|nd|rd|th)?\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?,?\s*(\d{1,2},?\s*)?(\d{4})?$/i;

/** Questions start with one of these, or have at least three words. */
const QUESTION_START = /^(what|why|how|which|who|whom|whose|when|where|define|explain|describe|list|name|state|identify|is|are|do|does|can|should)\b/i;

/** "Example: ..." and friends. Under a card they become its note. */
const NOTE_LINE = /^(e\.?g\.?|examples?|for example|for instance|note|notes|tip|hint|remember|important|caution|warning)\s*[:\-–—]\s*(.+)$/i;

/** Links, emails, page numbers and the like. */
const NOISE = /^(https?:\/\/|www\.)\S+$|^\S+@\S+\.\S+$|^(page\s*)?\d+(\s*(of|\/)\s*\d+)?$|^slide\s*\d+$|^©|^copyright/i;

/** A subject that starts with one of these is not a term ("This is...", "It means..."). */
const NOT_A_SUBJECT = /^(this|that|these|those|it|its|they|there|here|he|she|we|you|i|which|what|who|how|why|when|where|if|as|so|but|and|or|also)$/i;
const HAS_VERB = /\b(was|were|will|can|may|has|have|had|do|does|did|should|could|would|not)\b/i;

const DEFINE = /^(\p{Lu}[^,;:()?!.]{0,60}?)\s+(is|are|refers to|means|is defined as|are defined as|can be defined as)\s+(.{12,})$/u;

const QUESTION_LINE = /^q(?:uestion)?\s*\d*\s*[.:)\-–]\s*(.+)$/i;
const ANSWER_LINE = /^a(?:nswer)?\s*\d*\s*[.:)\-–]\s*(.+)$/i;
const BULLET = /^([•·▪●*\-–]|\d+[.)]|[a-z][.)])\s+/;

const wordCount = (s: string) => s.split(/\s+/).length;

/** Cuts text to fit a card side, at the end of a sentence or a word. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  if (sentence > max / 2) return cut.slice(0, sentence + 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).trimEnd()}…`;
}

/** "term: meaning" or "term - meaning". The colon needs a space after it, so times and links are left alone. */
function splitPair(line: string): [string, string] | null {
  const m = /:\s+|\s[-–—]\s+/.exec(line);
  if (!m || m.index === 0) return null;
  return [line.slice(0, m.index).trim(), line.slice(m.index + m[0].length).trim()];
}

function goodTerm(term: string): boolean {
  return (
    term.length <= 80 &&
    wordCount(term) <= 8 &&
    /^[\p{L}\p{N}"'“‘(]/u.test(term) &&
    !/[.!;?]$/.test(term) &&
    !/\.\s/.test(term) &&
    !LABEL.test(term)
  );
}

/** A meaning is not just a number, a time or a date. */
function goodMeaning(meaning: string): boolean {
  return meaning.length >= 2 && !/^[\d\s:.,/\-–apm%$]+$/i.test(meaning) && !DATE.test(meaning);
}

/** A real question, not a leftover word from a wrapped line such as "Management?". */
function isQuestion(line: string): boolean {
  return line.endsWith("?") && line.length <= 300 && (wordCount(line) >= 3 || QUESTION_START.test(line));
}

/** Lines that are one bullet of a short list: brief, and not a card on their own. */
function isItem(row: string): boolean {
  return (
    !row.includes("\t") &&
    row.length <= 100 &&
    wordCount(row) <= 14 &&
    !row.endsWith("?") &&
    !row.endsWith(":") &&
    !NOISE.test(row) &&
    !splitPair(row)
  );
}

/**
 * PDFs break paragraphs at the page width. Join a long line with the lowercase line that continues it,
 * and a line that stops in the middle of a thought (after a comma, "and", "of", ...) with the next one.
 */
function unwrap(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    const prev = out.at(-1);
    if (
      prev &&
      !prev.includes("\t") &&
      !line.includes("\t") &&
      ((prev.length >= 45 && !/[.!?:;]$/.test(prev) && /^\p{Ll}/u.test(line)) ||
        (prev.length >= 30 && /(,|\b(and|or|of|the|to|a|an|in|for|with|by|that|which))$/i.test(prev)))
    ) {
      out[out.length - 1] = `${prev} ${line}`;
    } else out.push(line);
  }
  return out;
}

/** "A cell is the smallest unit of life." becomes the question "What is a cell?". */
function definition(sentence: string): ParsedCard | null {
  const m = DEFINE.exec(sentence.trim());
  if (!m) return null;
  const [, subject, verb, rest] = m;
  const first = subject.split(/\s+/)[0];
  if (wordCount(subject) > 6 || NOT_A_SUBJECT.test(first) || HAS_VERB.test(subject)) return null;
  const meaning = rest.replace(/[.]+$/, "").trim();
  if (!goodMeaning(meaning)) return null;
  const plural = verb.startsWith("are");
  // "A cell" becomes "a cell", and "Nurses" becomes "nurses". A single name like "Paris" keeps its capital.
  const asked = subject
    .replace(/^(A|An|The)\b/, (d) => d.toLowerCase())
    .replace(/^\p{Lu}(?=\p{Ll}+$)/u, (c) => (plural ? c.toLowerCase() : c));
  return {
    kind: "question",
    prompt: `What ${plural ? "are" : "is"} ${asked}?`,
    answer: clip(meaning.charAt(0).toUpperCase() + meaning.slice(1), LIMITS.side),
  };
}

/**
 * Reads notes the way a teacher would when writing a reviewer. It keeps what is worth studying:
 *   - table and spreadsheet rows (term, meaning, optional note)
 *   - "term: meaning" and "term - meaning" lines, but not labels, times, links or headings
 *   - questions with the answer on the next line, and "Q: ... / A: ..." pairs
 *   - a heading ending in ":" with a short list under it (the list becomes the meaning)
 *   - sentences like "A cell is ...", asked back as "What is a cell?"
 * "Example: ..." and "Note: ..." lines under a card become that card's note. Everything else is left out.
 * This follows fixed rules. It does not understand the text, so the cards are meant to be checked.
 */
export function buildReviewer(text: string): Reviewer {
  const all = unwrap(text.split(/\r?\n/).map((l) => l.replace(/[  ]+/g, " ").trim())).filter(Boolean);
  // Page headers and footers: the same line (page numbers aside) on many pages.
  const norm = (l: string) => l.toLowerCase().replace(/\d+/g, "#");
  const counts = new Map<string, number>();
  for (const l of all) counts.set(norm(l), (counts.get(norm(l)) ?? 0) + 1);
  const isRepeat = (l: string) =>
    l.length >= 12 && !l.endsWith("?") && !NOTE_LINE.test(l) && !BULLET.test(l) && (counts.get(norm(l)) ?? 0) >= REPEATS;
  const rows = all.filter((l) => !isRepeat(l));
  const cards: ParsedCard[] = [];
  const seen = new Set<string>();
  let left = all.length - rows.length;
  /** Index of the line that made the latest card, so a note only attaches to the card right above it. */
  let lastAt = -2;

  const add = (card: ParsedCard, at: number): boolean => {
    const key = card.prompt.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    cards.push(card);
    lastAt = at;
    return true;
  };

  for (let i = 0; i < rows.length; i++) {
    const line = rows[i];

    // A table or spreadsheet row.
    if (line.includes("\t")) {
      const [prompt = "", answer = "", ...rest] = line.split("\t").map((s) => s.trim());
      if (HEADER_WORDS.test(prompt) && HEADER_WORDS.test(answer)) continue;
      const explanation = rest.filter(Boolean).join(" ");
      const card: ParsedCard = {
        kind: prompt.endsWith("?") || wordCount(prompt) > 10 ? "question" : "term",
        prompt: clip(prompt, LIMITS.side),
        answer: clip(answer, LIMITS.side),
      };
      if (explanation) card.explanation = clip(explanation, LIMITS.note);
      // Page layouts also make tab gaps (cover pages, headers), so rows with labels or dates are not cards.
      // A title next to a page number or date ("Kali Linux Commands - Simple Reviewer / Page 1") is a header.
      const layout =
        LABEL.test(prompt) ||
        NOISE.test(prompt) ||
        NOISE.test(answer) ||
        (i < 5 && TITLE_END.test(prompt)) ||
        !goodMeaning(answer);
      if (!prompt || !answer || layout || !add(card, i)) left++;
      continue;
    }

    if (NOISE.test(line)) {
      left++;
      continue;
    }

    // "Example: ..." under a card is that card's note.
    const note = NOTE_LINE.exec(line);
    if (note) {
      const last = cards.at(-1);
      if (last && lastAt === i - 1) {
        // The note field is already called "Note", so only the other labels are kept.
        const label = /^(e\.?g\.?|examples?|for example|for instance)$/i.test(note[1])
          ? "Example"
          : /^notes?$/i.test(note[1])
            ? ""
            : note[1].charAt(0).toUpperCase() + note[1].slice(1).toLowerCase();
        last.explanation = clip(`${last.explanation ? `${last.explanation} ` : ""}${label ? `${label}: ` : ""}${note[2]}`, LIMITS.note);
        lastAt = i;
      } else left++;
      continue;
    }

    // "Q: question" then "A: answer".
    const q = QUESTION_LINE.exec(line);
    if (q) {
      const a = ANSWER_LINE.exec(rows[i + 1] ?? "");
      if (a && add({ kind: "question", prompt: clip(q[1], LIMITS.side), answer: clip(a[1], LIMITS.side) }, i + 1)) i++;
      else left++;
      continue;
    }

    // A question with its answer on the next line.
    if (line.endsWith("?")) {
      const next = rows[i + 1];
      if (
        isQuestion(line) &&
        next &&
        next.length >= 3 &&
        !next.includes("\t") &&
        !next.endsWith("?") &&
        !next.endsWith(":") &&
        !NOISE.test(next) &&
        add({ kind: "question", prompt: line, answer: clip(next.replace(/^a(?:nswer)?\s*[:.)\-–]\s*/i, ""), LIMITS.side) }, i + 1)
      ) {
        i++;
      } else left++;
      continue;
    }

    // "term: meaning" or "term - meaning".
    const pair = splitPair(line);
    if (pair && i < 5 && TITLE_END.test(line)) {
      left++;
      continue;
    }
    if (pair && goodTerm(pair[0]) && goodMeaning(pair[1])) {
      if (!add({ kind: "term", prompt: pair[0], answer: clip(pair[1], LIMITS.side) }, i)) left++;
      continue;
    }

    // A heading with a short list under it.
    if (line.endsWith(":") && line.length <= 100) {
      const items: string[] = [];
      let j = i + 1;
      while (j < rows.length && items.length < 12 && isItem(rows[j])) items.push(rows[j++].replace(BULLET, ""));
      if (items.length >= 2 && add({ kind: "term", prompt: line.slice(0, -1).trim(), answer: clip(items.join("; "), LIMITS.side) }, j - 1)) {
        i = j - 1;
      } else left++;
      continue;
    }

    // Sentences that define something.
    let found = false;
    for (const sentence of line.split(/(?<=[.!?])\s+(?=\p{Lu})/u)) {
      const card = definition(sentence);
      if (card && add(card, i)) found = true;
    }
    if (!found) left++;
  }

  return { cards, left };
}

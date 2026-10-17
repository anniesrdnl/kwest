"use client";

import { ArrowRight, Check, Coins, Layers, ListChecks, RotateCcw, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import { HOME_ROUTE } from "@/lib/routes";
import type { FinishSessionResult, SubmitAnswerResult } from "@/lib/types/database";
import { answerCard, finishStudySession, startStudySession } from "../actions";
import { buildQuiz, pickSessionCards, questionText, type QuizQuestion, type StudyCard, type StudyMode } from "../logic";

type DeckInfo = { id: string; title: string; colorKey: string };

type SessionProps = { deck: DeckInfo; mode: StudyMode; cards: StudyCard[] };

/**
 * One study session (flashcards or quiz).
 * Next.js keeps pages you leave hidden (React <Activity>). A session in progress
 * should survive that, but a finished one should start fresh next time, so after
 * the results screen the session remounts with a new key when the page is hidden.
 */
export function StudySession(props: SessionProps) {
  const [generation, setGeneration] = useState(0);
  const finished = useRef(false);

  useLayoutEffect(() => {
    return () => {
      if (finished.current) {
        finished.current = false;
        setGeneration((g) => g + 1);
      }
    };
  }, []);

  return (
    <Session
      key={generation}
      {...props}
      onFinished={() => (finished.current = true)}
      onRestart={() => setGeneration((g) => g + 1)}
    />
  );
}

type Item = { card: StudyCard; question: QuizQuestion | null; retry: boolean };

function Session({ deck, mode, cards, onFinished, onRestart }: SessionProps & { onFinished: () => void; onRestart: () => void }) {
  const [phase, setPhase] = useState<"intro" | "running" | "done">("intro");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [tally, setTally] = useState({ correct: 0, wrong: 0, xp: 0, levelBefore: 0 });
  const [result, setResult] = useState<FinishSessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const planned = pickSessionCards(cards, mode);

  const start = () =>
    startTransition(async () => {
      setError(null);
      const res = await startStudySession(deck.id, mode);
      if (!res.ok) return setError(res.message);
      const picked = pickSessionCards(cards, mode);
      const questions = mode === "quiz" ? buildQuiz(picked, cards) : null;
      setItems(picked.map((card, i) => ({ card, question: questions?.[i] ?? null, retry: false })));
      setSessionId(res.sessionId);
      setIndex(0);
      setPhase("running");
    });

  /** Records one answer. Missed cards come back once at the end of the session. Returns true if re-queued. */
  const record = (r: SubmitAnswerResult, item: Item): boolean => {
    setTally((t) => ({
      correct: t.correct + (r.isCorrect ? 1 : 0),
      wrong: t.wrong + (r.isCorrect ? 0 : 1),
      xp: t.xp + r.xp,
      levelBefore: t.levelBefore || r.levelBefore,
    }));
    if (!r.isCorrect && !item.retry) {
      const question = mode === "quiz" ? buildQuiz([item.card], cards)[0] : null;
      setItems((list) => [...list, { card: item.card, question, retry: true }]);
      return true;
    }
    return false;
  };

  const finish = useCallback(() => {
    if (!sessionId) return;
    startTransition(async () => {
      const res = await finishStudySession(sessionId);
      if (!res.ok) return setError(res.message);
      setResult(res.result);
      setPhase("done");
      onFinished();
    });
  }, [sessionId, onFinished]);

  /** `added` = cards just re-queued that `items` doesn't include yet. */
  const next = (added = 0) => {
    if (index + 1 >= items.length + added) finish();
    else setIndex(index + 1);
  };

  if (phase === "intro") {
    const ModeIcon = mode === "quiz" ? ListChecks : Layers;
    return (
      <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <ModeIcon size={24} aria-hidden />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{mode === "quiz" ? "Quiz" : "Flashcards"}</h1>
          <p className="flex items-center justify-center gap-2 text-text-muted">
            <DeckBadge title={deck.title} colorKey={deck.colorKey} size="sm" />
            <span className="min-w-0 truncate">{deck.title}</span>
          </p>
        </div>
        <p className="text-text-muted">
          {mode === "quiz"
            ? `${planned.length} questions. Answers you get right move cards to a later review.`
            : `${planned.length} cards. Flip each card, then say if you knew it.`}
        </p>
        {error && (
          <p role="alert" className="text-sm text-wrong">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href={`/decks/${deck.id}`} variant="ghost">
            Back to deck
          </ButtonLink>
          <Button size="lg" onClick={start} disabled={pending || planned.length === 0} autoFocus>
            {pending ? "Starting…" : "Start"}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    return <Results deck={deck} mode={mode} result={result} levelBefore={tally.levelBefore} onRestart={onRestart} />;
  }

  const item = items[index];
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SessionHeader deck={deck} done={index} total={items.length} />
      {error && (
        <p role="alert" className="rounded-lg border border-wrong/30 bg-wrong/10 px-3 py-2 text-sm text-wrong">
          {error}
        </p>
      )}
      {item.question ? (
        <QuizStep
          key={`${index}-${item.card.id}`}
          sessionId={sessionId!}
          question={item.question}
          retry={item.retry}
          isLast={index + 1 >= items.length}
          busy={pending}
          onAnswered={(r) => record(r, item)}
          onError={setError}
          onNext={() => next()}
        />
      ) : (
        <FlashcardStep
          key={`${index}-${item.card.id}`}
          sessionId={sessionId!}
          card={item.card}
          busy={pending}
          onAnswered={(r) => next(record(r, item) ? 1 : 0)}
          onError={setError}
        />
      )}
    </div>
  );
}

function SessionHeader({ deck, done, total }: { deck: DeckInfo; done: number; total: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-medium text-text-muted">{deck.title}</p>
        <Link href={`/decks/${deck.id}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-text-muted hover:text-text">
          <X size={16} aria-hidden />
          Stop
        </Link>
      </div>
      <div
        role="progressbar"
        aria-label="Session progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={`${done} of ${total} done`}
        className="h-1.5 overflow-hidden rounded-full bg-track"
      >
        <div className="h-full rounded-full bg-progress transition-[width] duration-300" style={{ width: `${(done / total) * 100}%` }} />
      </div>
    </div>
  );
}

/** Flip the card, then self-report. Self-reports don't move cards between review boxes (server rule). */
function FlashcardStep({
  sessionId,
  card,
  busy,
  onAnswered,
  onError,
}: {
  sessionId: string;
  card: StudyCard;
  busy: boolean;
  onAnswered: (r: SubmitAnswerResult) => void;
  onError: (m: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [sending, startTransition] = useTransition();
  const shownAt = useRef(0);
  const flipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    shownAt.current = performance.now();
    flipRef.current?.focus();
  }, []);

  const answer = useCallback(
    (known: boolean) =>
      startTransition(async () => {
        const res = await answerCard({
          sessionId,
          cardId: card.id,
          type: "flash",
          given: known ? "known" : "learning",
          responseMs: performance.now() - shownAt.current,
        });
        if (!res.ok) return onError(res.message);
        onAnswered(res.result);
      }),
    [sessionId, card.id, onAnswered, onError],
  );

  // Keyboard: Space flips; once flipped, 1 = still learning, 2 = knew it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (flipped && !sending && (e.key === "1" || e.key === "2")) answer(e.key === "2");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, sending, answer]);

  const front = card.kind === "term" ? "Word" : "Question";
  const back = card.kind === "term" ? "Meaning" : "Answer";

  return (
    <div className="space-y-5">
      <div className="perspective-distant">
        <button
          ref={flipRef}
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? `${back}: ${card.answer}. Press to see the ${front.toLowerCase()} again.` : `${front}: ${card.prompt}. Press to show the ${back.toLowerCase()}.`}
          className={`relative grid min-h-72 w-full rounded-2xl text-left transition-transform duration-500 transform-3d ${flipped ? "rotate-y-180" : ""}`}
        >
          <Face label={front} text={card.prompt} hint="Tap or press Space to flip" />
          <Face label={back} text={card.answer} note={card.explanation} back />
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {flipped ? `${back}: ${card.answer}` : ""}
      </p>

      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={() => answer(false)} disabled={sending || busy}>
            <RotateCcw size={18} aria-hidden className="hidden sm:block" />
            Still learning
          </Button>
          <Button size="lg" onClick={() => answer(true)} disabled={sending || busy}>
            <Check size={18} aria-hidden />
            I knew it
          </Button>
        </div>
      ) : (
        <Button variant="secondary" size="lg" className="w-full" onClick={() => setFlipped(true)}>
          Show {back.toLowerCase()}
        </Button>
      )}
      <p className="hidden text-center text-sm text-text-muted sm:block">Keys: Space to flip · 1 still learning · 2 I knew it</p>
    </div>
  );
}

function Face({ label, text, note, hint, back = false }: { label: string; text: string; note?: string | null; hint?: string; back?: boolean }) {
  return (
    <div
      aria-hidden
      className={`col-start-1 row-start-1 flex flex-col justify-between gap-4 rounded-2xl border border-border p-6 backface-hidden sm:p-8 ${
        back ? "rotate-y-180 bg-hero" : "bg-surface"
      }`}
    >
      <span className="text-sm font-medium text-text-muted">{label}</span>
      <span className="text-center text-2xl font-semibold break-words whitespace-pre-line sm:text-3xl">{text}</span>
      <span className="min-h-5 text-center text-sm text-text-muted">{note ?? hint ?? ""}</span>
    </div>
  );
}

function QuizStep({
  sessionId,
  question,
  retry,
  isLast,
  busy,
  onAnswered,
  onError,
  onNext,
}: {
  sessionId: string;
  question: QuizQuestion;
  retry: boolean;
  isLast: boolean;
  busy: boolean;
  onAnswered: (r: SubmitAnswerResult) => void;
  onError: (m: string) => void;
  onNext: () => void;
}) {
  const [given, setGiven] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<SubmitAnswerResult | null>(null);
  const [sending, startTransition] = useTransition();
  const shownAt = useRef(0);
  const nextRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    shownAt.current = performance.now();
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (feedback) nextRef.current?.focus();
  }, [feedback]);

  const submit = (value: string) => {
    if (feedback || sending) return;
    setGiven(value);
    startTransition(async () => {
      const res = await answerCard({
        sessionId,
        cardId: question.card.id,
        type: question.type,
        given: value,
        responseMs: performance.now() - shownAt.current,
        shownAnswer: question.type === "tf" ? question.shownAnswer : undefined,
      });
      if (!res.ok) {
        setGiven(null);
        return onError(res.message);
      }
      setFeedback(res.result);
      onAnswered(res.result);
    });
  };

  const { ask, text } = questionText(question);

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm font-medium text-text-muted">
          {ask}
          {retry && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-fg">Try again</span>}
        </p>
        <p className="text-2xl font-semibold break-words whitespace-pre-line">{text}</p>
        {question.type === "tf" && (
          <p className="rounded-lg bg-surface-2 px-4 py-3 text-lg break-words">
            <span className="sr-only">Answer shown: </span>
            {question.shownAnswer}
          </p>
        )}
      </div>

      {question.type === "mc" && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {question.options.map((option, i) => {
            const isRight = feedback && option === feedback.expected;
            const isPickedWrong = feedback && !feedback.isCorrect && option === given;
            return (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => submit(option)}
                  disabled={Boolean(feedback) || sending || busy}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    isRight
                      ? "border-correct bg-correct/10"
                      : isPickedWrong
                        ? "border-wrong bg-wrong/10"
                        : given === option
                          ? "border-text"
                          : "border-border bg-surface hover:border-border-strong/60"
                  }`}
                >
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-sm font-semibold text-text-muted">
                    {isRight ? <Check size={16} className="text-correct" aria-label="Correct answer" /> : isPickedWrong ? <X size={16} className="text-wrong" aria-label="Your answer" /> : i + 1}
                  </span>
                  <span className="break-words">{option}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {question.type === "tf" && (
        <div className="grid grid-cols-2 gap-3">
          {(["true", "false"] as const).map((v) => (
            <Button
              key={v}
              variant={given === v ? "primary" : "outline"}
              size="lg"
              onClick={() => submit(v)}
              disabled={Boolean(feedback) || sending || busy}
            >
              {v === "true" ? "True" : "False"}
            </Button>
          ))}
        </div>
      )}

      {question.type === "id" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (typed.trim()) submit(typed);
          }}
          className="space-y-3"
        >
          <label htmlFor="typed-answer" className="block text-sm font-medium">
            Your answer
          </label>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              id="typed-answer"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              readOnly={Boolean(feedback)}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="min-h-12 w-full rounded-lg border border-border-strong bg-surface px-3 text-base focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus/30"
            />
            {!feedback && (
              <Button type="submit" size="lg" disabled={!typed.trim() || sending || busy}>
                Check
              </Button>
            )}
          </div>
          <p className="text-sm text-text-muted">Small typos are okay on longer answers.</p>
        </form>
      )}

      {sending && !feedback && <p className="text-sm text-text-muted">Checking…</p>}

      {feedback && (
        <div
          role="status"
          className={`space-y-2 rounded-xl border p-4 ${feedback.isCorrect ? "border-correct/40 bg-correct/10" : "border-wrong/40 bg-wrong/10"}`}
        >
          <p className={`flex items-center gap-2 font-semibold ${feedback.isCorrect ? "text-correct" : "text-wrong"}`}>
            {feedback.isCorrect ? <Check size={18} aria-hidden /> : <X size={18} aria-hidden />}
            {feedback.isCorrect ? "Correct" : "Not quite"}
            {feedback.xp > 0 && (
              <span className="ml-auto rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-fg">+{feedback.xp} XP</span>
            )}
          </p>
          {!feedback.isCorrect && (
            <p>
              The answer is <strong className="font-semibold">{feedback.expected}</strong>.
            </p>
          )}
          {feedback.pickedPrompt && (
            <p className="text-sm text-text-muted">You picked the answer for &ldquo;{feedback.pickedPrompt}&rdquo;.</p>
          )}
          {feedback.explanation && <p className="text-sm text-text-muted">{feedback.explanation}</p>}
          {feedback.masteredNow && <p className="text-sm font-medium">You&apos;ve mastered this card.</p>}
        </div>
      )}

      {feedback && (
        <Button ref={nextRef} size="lg" className="w-full" onClick={onNext} disabled={busy}>
          {busy ? "Saving…" : isLast ? "See results" : "Next"}
          <ArrowRight size={18} aria-hidden />
        </Button>
      )}
    </div>
  );
}

function Results({
  deck,
  mode,
  result,
  levelBefore,
  onRestart,
}: {
  deck: DeckInfo;
  mode: StudyMode;
  result: FinishSessionResult;
  levelBefore: number;
  onRestart: () => void;
}) {
  const total = result.correct + result.incorrect;
  const leveledUp = levelBefore > 0 && result.level > levelBefore;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  const tiles =
    mode === "quiz"
      ? [
          { label: "Correct", value: `${result.correct}/${total}` },
          { label: "Score", value: `${Math.round(result.accuracy * 100)}%` },
        ]
      : [
          { label: "Cards", value: String(total) },
          { label: "Knew it", value: String(result.correct) },
        ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2 text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-fg">
          <Sparkles size={26} aria-hidden />
        </span>
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none sm:text-3xl">
          Session complete
        </h1>
        <p className="text-text-muted">{deck.title}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ...tiles,
          { label: "XP earned", value: `+${result.xpEarned}` },
          { label: "Coins", value: `+${result.coinsEarned}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4 text-center">
            <dt className="text-sm text-text-muted">{label}</dt>
            <dd className="text-2xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {(leveledUp || result.masteredSet || result.sessionBonus > 0) && (
        <ul className="space-y-2 rounded-xl border border-hero-border bg-hero p-4 text-hero-fg">
          {leveledUp && (
            <li className="flex items-center gap-2 font-semibold">
              <Sparkles size={18} aria-hidden /> You reached level {result.level}!
            </li>
          )}
          {result.masteredSet && (
            <li className="flex items-center gap-2 font-semibold">
              <Check size={18} aria-hidden /> You mastered this deck.
            </li>
          )}
          {result.sessionBonus > 0 && (
            <li className="flex items-center gap-2 text-hero-muted">
              <Coins size={18} aria-hidden /> Includes a +{result.sessionBonus} XP bonus for finishing.
            </li>
          )}
        </ul>
      )}

      {mode === "flashcards" && (
        <p className="text-center text-sm text-text-muted">
          Flashcards help you learn. Take the quiz to move cards to a later review.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={onRestart}>
          <RotateCcw size={18} aria-hidden />
          Study again
        </Button>
        {mode === "flashcards" && (
          <ButtonLink href={`/decks/${deck.id}/quiz`} variant="secondary" size="lg">
            Take the quiz
          </ButtonLink>
        )}
        <ButtonLink href={HOME_ROUTE} variant="outline" size="lg">
          Home
        </ButtonLink>
      </div>
    </div>
  );
}

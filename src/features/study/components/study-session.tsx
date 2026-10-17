"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { Kip, PixelIcon } from "@/components/brand/pixel";
import { Button, ButtonLink } from "@/components/ui/button";
import { PixelBar } from "@/components/ui/pixel-bar";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import { HOME_ROUTE } from "@/lib/routes";
import type { FinishSessionResult, SubmitAnswerResult } from "@/lib/types/database";
import { answerCard, finishStudySession, startStudySession } from "../actions";
import { QuizStep } from "./quiz-step";
import { buildQuiz, pickSessionCards, type QuizQuestion, type StudyCard, type StudyMode } from "../logic";

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
    return (
      <div className="pixel-lift mx-auto max-w-xl">
        <section className="pixel-frame space-y-6 p-6 text-center sm:p-8">
          <Kip mood="think" scale={6} bob className="mx-auto" />
          <div className="space-y-2">
            <h1 className="text-3xl">{mode === "quiz" ? "Quiz" : "Flashcards"}</h1>
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
        </section>
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
        <Link href={`/decks/${deck.id}`} className="inline-flex min-h-11 items-center gap-2 font-pixel text-base text-text-muted hover:text-text">
          <PixelIcon name="close" scale={2} />
          Stop
        </Link>
      </div>
      <PixelBar
        ratio={done / total}
        label="Session progress"
        max={total}
        now={done}
        valueText={`${done} of ${total} done`}
        segments={Math.min(total, 20)}
      />
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
            <PixelIcon name="check" scale={2} />
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
      className={`col-start-1 row-start-1 flex flex-col justify-between gap-4 border border-border p-6 shadow-card backface-hidden sm:p-8 ${
        back ? "rotate-y-180 bg-hero" : "bg-surface"
      }`}
    >
      <span className="font-pixel text-base text-text-muted">{label}</span>
      <span className="text-center text-2xl font-semibold break-words whitespace-pre-line sm:text-3xl">{text}</span>
      <span className="min-h-5 text-center text-sm text-text-muted">{note ?? hint ?? ""}</span>
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

  const great = total > 0 && result.accuracy >= 0.7;
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-3 text-center">
        <Kip mood={great ? "cheer" : "happy"} scale={6} bob className="mx-auto" />
        <h1 ref={headingRef} tabIndex={-1} className="text-3xl outline-none sm:text-4xl">
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
          <div key={label} className="border border-border bg-surface p-4 text-center shadow-card">
            <dt className="text-sm text-text-muted">{label}</dt>
            <dd className="font-pixel text-3xl tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {(leveledUp || result.masteredSet || result.sessionBonus > 0) && (
        <ul className="space-y-2 border border-hero-border bg-hero p-4 text-hero-fg shadow-card">
          {leveledUp && (
            <li className="flex items-center gap-2 font-pixel text-lg">
              <PixelIcon name="spark" scale={2} /> You reached level {result.level}!
            </li>
          )}
          {result.masteredSet && (
            <li className="flex items-center gap-2 font-pixel text-lg">
              <PixelIcon name="check" scale={2} /> You mastered this deck.
            </li>
          )}
          {result.sessionBonus > 0 && (
            <li className="flex items-center gap-2 text-hero-muted">
              <PixelIcon name="coin" scale={2} /> Includes a +{result.sessionBonus} XP bonus for finishing.
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

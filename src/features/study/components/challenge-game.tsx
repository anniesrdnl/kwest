"use client";

import { Heart, RotateCcw, Sparkles, Trophy, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import type { FinishSessionResult, SubmitAnswerResult } from "@/lib/types/database";
import { finishStudySession, startChallenge } from "../actions";
import { createChallengeLink } from "../link-actions";
import { CHALLENGE, challengeQuestion, isGameOver, pickChallengeCards } from "../challenge";
import type { QuizQuestion, StudyCard } from "../logic";
import { QuizStep } from "./quiz-step";
import { ShareLink } from "./share-link";

type DeckInfo = { id: string; title: string; colorKey: string };
type GameProps = { deck: DeckInfo; cards: StudyCard[] };

/**
 * Challenge: get 8 right before you miss 3, against the clock.
 * Like StudySession, a finished game remounts fresh when its hidden page comes back.
 */
export function ChallengeGame(props: GameProps) {
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
    <Game
      key={generation}
      {...props}
      onFinished={() => (finished.current = true)}
      onRestart={() => setGeneration((g) => g + 1)}
    />
  );
}

function Game({ deck, cards, onFinished, onRestart }: GameProps & { onFinished: () => void; onRestart: () => void }) {
  const [phase, setPhase] = useState<"intro" | "running" | "done">("intro");
  const [timer, setTimer] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState({ hits: 0, misses: 0, levelBefore: 0 });
  const [result, setResult] = useState<FinishSessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const tooFew = cards.length < CHALLENGE.minCards;

  const start = () =>
    startTransition(async () => {
      setError(null);
      const res = await startChallenge(deck.id);
      if (!res.ok) return setError(res.message);
      setQuestions(pickChallengeCards(cards).map((card) => challengeQuestion(card, cards)));
      setSessionId(res.sessionId);
      setPhase("running");
    });

  const record = (r: SubmitAnswerResult) =>
    setScore((s) => ({
      hits: s.hits + (r.isCorrect ? 1 : 0),
      misses: s.misses + (r.isCorrect ? 0 : 1),
      levelBefore: s.levelBefore || r.levelBefore,
    }));

  const over = isGameOver(score.hits, score.misses) || index + 1 >= questions.length;

  const next = () => {
    if (!over) return setIndex(index + 1);
    startTransition(async () => {
      const res = await finishStudySession(sessionId!);
      if (!res.ok) return setError(res.message);
      setResult(res.result);
      setPhase("done");
      onFinished();
    });
  };

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <Trophy size={24} aria-hidden />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Challenge</h1>
          <p className="flex items-center justify-center gap-2 text-text-muted">
            <DeckBadge title={deck.title} colorKey={deck.colorKey} size="sm" />
            <span className="min-w-0 truncate">{deck.title}</span>
          </p>
        </div>

        {tooFew ? (
          <p className="text-text-muted">
            A challenge needs at least {CHALLENGE.minCards} cards. This deck has {cards.length}.
          </p>
        ) : (
          <>
            <ul className="space-y-2 text-left">
              <Rule>
                Get <strong className="font-semibold">{CHALLENGE.winHits} right</strong> to win.
              </Rule>
              <Rule>
                You have <strong className="font-semibold">{CHALLENGE.maxMisses} hearts</strong>. Each miss costs one.
              </Rule>
              <Rule>Win to earn bonus XP and coins.</Rule>
            </ul>
            <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-border px-4 py-2 text-left">
              <span>
                <span className="block font-medium">Timer</span>
                <span className="block text-sm text-text-muted">
                  {CHALLENGE.timeMs.mc / 1000} seconds a question ({CHALLENGE.timeMs.id / 1000} to type). Running out counts as a miss.
                </span>
              </span>
              <input
                type="checkbox"
                checked={timer}
                onChange={(e) => setTimer(e.target.checked)}
                className="size-5 shrink-0 accent-accent"
              />
            </label>
          </>
        )}

        {error && (
          <p role="alert" className="text-sm text-wrong">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href={`/decks/${deck.id}`} variant="ghost">
            Back to deck
          </ButtonLink>
          {tooFew ? (
            <ButtonLink href={`/decks/${deck.id}/edit`} size="lg">
              Add cards
            </ButtonLink>
          ) : (
            <Button size="lg" onClick={start} disabled={pending} autoFocus>
              {pending ? "Starting…" : "Start"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <Results
        deck={deck}
        result={result}
        levelBefore={score.levelBefore}
        sessionId={sessionId!}
        timer={timer}
        onRestart={onRestart}
      />
    );
  }

  const question = questions[index];
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-medium text-text-muted">{deck.title}</p>
        <Link href={`/decks/${deck.id}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-text-muted hover:text-text">
          <X size={16} aria-hidden />
          Stop
        </Link>
      </div>
      <Scoreboard hits={score.hits} misses={score.misses} />
      {error && (
        <p role="alert" className="rounded-lg border border-wrong/30 bg-wrong/10 px-3 py-2 text-sm text-wrong">
          {error}
        </p>
      )}
      <QuizStep
        key={index}
        sessionId={sessionId!}
        question={question}
        isLast={over}
        lastLabel="See how you did"
        busy={pending}
        timeLimitMs={timer ? CHALLENGE.timeMs[question.type] : undefined}
        onAnswered={record}
        onError={setError}
        onNext={next}
      />
    </div>
  );
}

export function Rule({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-progress" />
      <span>{children}</span>
    </li>
  );
}

export function Scoreboard({ hits, misses }: { hits: number; misses: number }) {
  const hearts = CHALLENGE.maxMisses - misses;
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-sm font-semibold tabular-nums">
          {hits} of {CHALLENGE.winHits} right
        </p>
        <div
          role="progressbar"
          aria-label="Right answers"
          aria-valuemin={0}
          aria-valuemax={CHALLENGE.winHits}
          aria-valuenow={hits}
          aria-valuetext={`${hits} of ${CHALLENGE.winHits} right`}
          className="h-1.5 max-w-60 overflow-hidden rounded-full bg-track"
        >
          <div className="h-full rounded-full bg-progress transition-[width] duration-300" style={{ width: `${(hits / CHALLENGE.winHits) * 100}%` }} />
        </div>
      </div>
      <p className="flex items-center gap-1" aria-label={`${hearts} of ${CHALLENGE.maxMisses} hearts left`}>
        {Array.from({ length: CHALLENGE.maxMisses }, (_, i) => (
          <Heart
            key={i}
            size={22}
            aria-hidden
            className={i < hearts ? "fill-wrong text-wrong" : "text-border-strong"}
          />
        ))}
      </p>
    </div>
  );
}

function Results({
  deck,
  result,
  levelBefore,
  sessionId,
  timer,
  onRestart,
}: {
  deck: DeckInfo;
  result: FinishSessionResult;
  levelBefore: number;
  sessionId: string;
  timer: boolean;
  onRestart: () => void;
}) {
  const leveledUp = levelBefore > 0 && result.level > levelBefore;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2 text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-fg">
          {result.won ? <Trophy size={26} aria-hidden /> : <Heart size={26} aria-hidden />}
        </span>
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none sm:text-3xl">
          {result.won ? "You won!" : "Out of hearts"}
        </h1>
        <p className="text-text-muted">
          {result.won
            ? `${result.correct} right with ${result.incorrect === 1 ? "1 miss" : `${result.incorrect} misses`}.`
            : `You got ${result.correct} of ${CHALLENGE.winHits}. Missed cards come up again in your next review.`}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Right", value: String(result.correct) },
          { label: "Missed", value: String(result.incorrect) },
          { label: "XP earned", value: `+${result.xpEarned}` },
          { label: "Coins", value: `+${result.coinsEarned}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4 text-center">
            <dt className="text-sm text-text-muted">{label}</dt>
            <dd className="text-2xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {(result.won || leveledUp || result.masteredSet) && (
        <ul className="space-y-2 rounded-xl border border-hero-border bg-hero p-4 text-hero-fg">
          {result.won && (
            <li className="flex items-center gap-2 font-semibold">
              <Trophy size={18} aria-hidden /> Includes a bonus for winning.
            </li>
          )}
          {leveledUp && (
            <li className="flex items-center gap-2 font-semibold">
              <Sparkles size={18} aria-hidden /> You reached level {result.level}!
            </li>
          )}
          {result.masteredSet && (
            <li className="flex items-center gap-2 font-semibold">
              <Sparkles size={18} aria-hidden /> You mastered this deck.
            </li>
          )}
        </ul>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={onRestart}>
          <RotateCcw size={18} aria-hidden />
          Play again
        </Button>
        <ButtonLink href={`/decks/${deck.id}`} variant="outline" size="lg">
          Back to deck
        </ButtonLink>
      </div>

      <ChallengeFriend deck={deck} sessionId={sessionId} timer={timer} correct={result.correct} />
    </div>
  );
}

/** Make a "beat my score" link for this game. */
function ChallengeFriend({ deck, sessionId, timer, correct }: { deck: DeckInfo; sessionId: string; timer: boolean; correct: number }) {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const make = () =>
    startTransition(async () => {
      setError(null);
      const res = await createChallengeLink(sessionId, timer);
      if (!res.ok) return setError(res.message);
      setCode(res.code);
    });

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Challenge a friend</h2>
        <p className="text-sm text-text-muted">
          Get a link to this deck. Friends play the same game and try to beat your score.
        </p>
      </div>
      {code ? (
        <ShareLink code={code} text={`I got ${correct} right on "${deck.title}" in Kwest. Can you beat me?`} />
      ) : (
        <Button variant="secondary" onClick={make} disabled={pending}>
          <UserPlus size={18} aria-hidden />
          {pending ? "Making link…" : "Get a link"}
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-wrong">
          {error}
        </p>
      )}
    </div>
  );
}

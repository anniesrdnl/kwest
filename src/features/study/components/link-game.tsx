"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { PixelIcon } from "@/components/brand/pixel";
import { Button, ButtonLink } from "@/components/ui/button";
import { ShareLink } from "@/components/ui/share-link";
import { DeckBadge } from "@/features/decks/components/deck-badge";
import { UserAvatar } from "@/features/shop/avatar";
import type { ChallengeAttemptResult, ChallengeBoardRow, ChallengeLinkData, SubmitAnswerResult } from "@/lib/types/database";
import { CHALLENGE, challengeQuestion, isGameOver, pickChallengeCards } from "../challenge";
import { answerLinkCard, finishLinkAttempt, startLinkAttempt } from "../link-actions";
import type { QuizQuestion, StudyCard } from "../logic";
import { Rule, Scoreboard } from "./challenge-game";
import { QuizStep } from "./quiz-step";

/** "1:05" from milliseconds. */
export function formatTime(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function scoreLine(row: { correct: number; incorrect: number; timeMs: number }): string {
  return `${row.correct} right · ${row.incorrect === 1 ? "1 miss" : `${row.incorrect} misses`} · ${formatTime(row.timeMs)}`;
}

/**
 * A friend's "beat my score" link: same deck, same rules as Challenge.
 * Like ChallengeGame, a finished game remounts fresh when its hidden page comes back.
 */
export function LinkGame({ link }: { link: ChallengeLinkData }) {
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
      link={link}
      onFinished={() => (finished.current = true)}
      onRestart={() => setGeneration((g) => g + 1)}
    />
  );
}

function Game({ link, onFinished, onRestart }: { link: ChallengeLinkData; onFinished: () => void; onRestart: () => void }) {
  const [phase, setPhase] = useState<"intro" | "running" | "done">("intro");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState({ hits: 0, misses: 0 });
  const [result, setResult] = useState<ChallengeAttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cards: StudyCard[] = link.cards.map((c) => ({ ...c, explanation: null, box: null, dueAt: null, recentWrong: 0 }));
  const target = link.board.find((r) => r.isOwner);
  const tooFew = cards.length < CHALLENGE.minCards;

  const start = () =>
    startTransition(async () => {
      setError(null);
      const res = await startLinkAttempt(link.code);
      if (!res.ok) return setError(res.message);
      setQuestions(pickChallengeCards(cards).map((card) => challengeQuestion(card, cards)));
      setAttemptId(res.attemptId);
      setPhase("running");
    });

  const record = (r: SubmitAnswerResult) =>
    setScore((s) => ({ hits: s.hits + (r.isCorrect ? 1 : 0), misses: s.misses + (r.isCorrect ? 0 : 1) }));

  const over = isGameOver(score.hits, score.misses) || index + 1 >= questions.length;

  const next = () => {
    if (!over) return setIndex(index + 1);
    startTransition(async () => {
      const res = await finishLinkAttempt(attemptId!);
      if (!res.ok) return setError(res.message);
      setResult(res.result);
      setPhase("done");
      onFinished();
    });
  };

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-xl space-y-8">
        <div className="pixel-lift">
          <section className="pixel-frame space-y-6 p-6 text-center sm:p-8">
            <div className="space-y-2">
              <h1 className="text-2xl break-words sm:text-[2rem] sm:leading-tight">
                {link.isOwner ? "Your challenge link" : `Beat ${link.ownerName}'s score`}
              </h1>
              <p className="flex items-center justify-center gap-2 text-text-muted">
                <DeckBadge title={link.deck.title} colorKey={link.deck.colorKey} size="sm" />
                <span className="min-w-0 truncate">{link.deck.title}</span>
              </p>
            </div>

            {target && (
              <p className="bg-accent-soft px-3 py-3">
                <span className="block text-sm text-text-muted">Score to beat</span>
                <span className="font-display text-base">{scoreLine(target)}</span>
              </p>
            )}

            {tooFew ? (
              <p className="text-text-muted">This deck doesn&apos;t have enough cards to play anymore.</p>
            ) : (
              <ul className="space-y-2 text-left">
                <Rule>
                  Get <strong className="font-semibold">{CHALLENGE.winHits} right</strong> before you miss {CHALLENGE.maxMisses}.
                </Rule>
                <Rule>More right wins. A tie goes to fewer misses, then the faster time.</Rule>
                <Rule>
                  {link.timer
                    ? `Timer is on: ${CHALLENGE.timeMs.mc / 1000} seconds a question (${CHALLENGE.timeMs.id / 1000} to type).`
                    : "No timer."}
                </Rule>
                <Rule>Just for fun: no XP or coins.</Rule>
              </ul>
            )}

            {error && (
              <p role="alert" className="text-sm text-wrong">
                {error}
              </p>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <ButtonLink href="/home" variant="ghost">
                Not now
              </ButtonLink>
              {!tooFew && (
                <Button size="lg" onClick={start} disabled={pending} autoFocus>
                  {pending ? "Starting…" : link.isOwner ? "Play it yourself" : "Start"}
                </Button>
              )}
            </div>
          </section>
        </div>

        {link.isOwner && <ShareLink path={`/challenge/${link.code}`} text={`Can you beat my score on "${link.deck.title}"?`} />}
        <Board rows={link.board} />
      </div>
    );
  }

  if (phase === "done" && result) {
    const heading = result.beatOwner && !link.isOwner ? `You beat ${link.ownerName}!` : result.won ? "You won!" : "Not this time";
    return (
      <div className="mx-auto max-w-xl space-y-8">
        <div className="space-y-3 text-center">
          <PixelIcon name={result.won ? "spark" : "heart"} scale={5} className={`mx-auto ${result.won ? "text-progress" : "text-wrong"}`} />
          <ResultHeading>{heading}</ResultHeading>
          <p className="text-text-muted">{scoreLine(result)}</p>
        </div>
        <Board rows={link.board} />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={onRestart}>
            <RotateCcw size={18} aria-hidden />
            Try again
          </Button>
          <ButtonLink href="/home" variant="outline" size="lg">
            Back home
          </ButtonLink>
        </div>
      </div>
    );
  }

  const question = questions[index];
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-medium text-text-muted">
          {link.deck.title}
          {target && <span> · to beat: {target.correct} right</span>}
        </p>
        <Link href="/home" className="inline-flex min-h-11 items-center gap-2 font-pixel text-base text-text-muted hover:text-text">
          <PixelIcon name="close" scale={2} />
          Stop
        </Link>
      </div>
      <Scoreboard hits={score.hits} misses={score.misses} />
      {error && (
        <p role="alert" className="border border-wrong/30 bg-wrong/10 px-3 py-2 text-sm text-wrong">
          {error}
        </p>
      )}
      <QuizStep
        key={index}
        grade={(input) => answerLinkCard(attemptId!, input)}
        question={question}
        isLast={over}
        lastLabel="See how you did"
        busy={pending}
        timeLimitMs={link.timer ? CHALLENGE.timeMs[question.type] : undefined}
        onAnswered={record}
        onError={setError}
        onNext={next}
      />
    </div>
  );
}

function ResultHeading({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <h1 ref={ref} tabIndex={-1} className="text-[2rem] break-words outline-none sm:text-[2.5rem]">
      {children}
    </h1>
  );
}

/** Everyone's best game on this link, best first. */
function Board({ rows }: { rows: ChallengeBoardRow[] }) {
  return (
    <section aria-labelledby="board-heading" className="space-y-4">
      <h2 id="board-heading" className="text-2xl">
        Scoreboard
      </h2>
      <div className="pixel-lift">
        <ol className="pixel-frame divide-y-2 divide-border">
          {rows.map((row, i) => (
            <li key={i} className={`flex items-center gap-3 px-4 py-3 ${row.isYou && !row.isOwner ? "bg-accent-soft" : ""}`}>
              <span className="w-6 shrink-0 text-center font-display text-base tabular-nums">{i + 1}</span>
              <UserAvatar name={row.name} look={{ icon: row.icon, color: row.color, frame: row.frame }} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {row.name}
                  {row.isYou && <span className="text-text-muted"> (you)</span>}
                </p>
                <p className="text-sm text-text-muted">{scoreLine(row)}</p>
              </div>
              {row.isOwner && <span className="shrink-0 bg-accent-soft px-2 py-0.5 text-xs font-semibold">To beat</span>}
            </li>
          ))}
        </ol>
      </div>
      {rows.length < 2 && <p className="text-sm text-text-muted">No one else has played yet.</p>}
    </section>
  );
}

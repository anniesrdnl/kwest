"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { PixelIcon } from "@/components/brand/pixel";
import { Button } from "@/components/ui/button";
import { PixelBar } from "@/components/ui/pixel-bar";
import type { SubmitAnswerResult } from "@/lib/types/database";
import { answerCard, type AnswerInput } from "../actions";
import { questionText, type QuizQuestion } from "../logic";

/** Grades one answer. The default sends it to the player's own study session. */
export type GradeAnswer = (
  input: Omit<AnswerInput, "sessionId">,
) => Promise<{ ok: true; result: SubmitAnswerResult } | { ok: false; message: string }>;

type QuizStepProps = {
  /** Study session the answer counts toward. Not needed when `grade` is given. */
  sessionId?: string;
  /** Grades somewhere else, like a friend's challenge link. */
  grade?: GradeAnswer;
  question: QuizQuestion;
  retry?: boolean;
  isLast: boolean;
  busy: boolean;
  /** Challenge mode: answer within this time or it counts as a miss. Not used for true/false. */
  timeLimitMs?: number;
  /** Text on the button after the last question. */
  lastLabel?: string;
  onAnswered: (r: SubmitAnswerResult) => void;
  onError: (m: string) => void;
  onNext: () => void;
};

/** One quiz question: multiple choice, true/false or a typed answer. Graded on the server. */
export function QuizStep({
  sessionId,
  grade,
  question,
  retry = false,
  isLast,
  busy,
  timeLimitMs,
  lastLabel = "See results",
  onAnswered,
  onError,
  onNext,
}: QuizStepProps) {
  const [given, setGiven] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<SubmitAnswerResult | null>(null);
  const [timedOut, setTimedOut] = useState(false);
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

  const submit = (value: string, outOfTime = false) => {
    if (feedback || sending) return;
    setGiven(value);
    setTimedOut(outOfTime);
    startTransition(async () => {
      const input = {
        cardId: question.card.id,
        type: question.type,
        given: value,
        responseMs: performance.now() - shownAt.current,
        shownAnswer: question.type === "tf" ? question.shownAnswer : undefined,
      };
      const res = grade ? await grade(input) : await answerCard({ sessionId: sessionId!, ...input });
      if (!res.ok) {
        setGiven(null);
        setTimedOut(false);
        return onError(res.message);
      }
      setFeedback(res.result);
      onAnswered(res.result);
    });
  };

  const { ask, text } = questionText(question);
  const timed = timeLimitMs !== undefined && question.type !== "tf";

  return (
    <div className="space-y-5">
      {timed && (
        <Countdown
          limitMs={timeLimitMs}
          stopped={given !== null}
          onTimeUp={() => submit("", true)}
        />
      )}
      <div className="pixel-lift">
        <section className="pixel-frame space-y-3 p-6 sm:p-8">
          <p className="font-pixel text-base text-text-muted">
            {ask}
            {retry && <span className="ml-2 bg-secondary px-2 py-0.5 font-sans text-sm text-secondary-fg">Try again</span>}
          </p>
          <p className="text-2xl font-semibold break-words whitespace-pre-line">{text}</p>
          {question.type === "tf" && (
            <p className="bg-surface-2 px-4 py-3 text-lg break-words">
              <span className="sr-only">Answer shown: </span>
              {question.shownAnswer}
            </p>
          )}
        </section>
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
                  className={`flex min-h-14 w-full items-center gap-3 border px-4 py-3 text-left transition-colors enabled:active:translate-y-px ${
                    isRight
                      ? "border-correct bg-surface ring-1 ring-correct"
                      : isPickedWrong
                        ? "border-wrong bg-surface ring-1 ring-wrong"
                        : given === option
                          ? "border-border-strong bg-accent-soft"
                          : "border-border bg-surface enabled:hover:bg-accent-soft"
                  }`}
                >
                  <span className="inline-flex size-8 shrink-0 items-center justify-center bg-secondary font-pixel text-base text-secondary-fg">
                    {isRight ? (
                      <>
                        <PixelIcon name="check" scale={2} />
                        <span className="sr-only">Correct answer</span>
                      </>
                    ) : isPickedWrong ? (
                      <>
                        <PixelIcon name="close" scale={2} />
                        <span className="sr-only">Your answer</span>
                      </>
                    ) : (
                      i + 1
                    )}
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
          <label htmlFor="typed-answer" className="block font-pixel text-base">
            Your answer
          </label>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              id="typed-answer"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              readOnly={given !== null}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="min-h-12 w-full border border-border-strong bg-surface px-3 text-base focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus/30"
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
          className={`flex items-start gap-4 border p-4 ${feedback.isCorrect ? "border-correct bg-correct/10" : "border-wrong bg-wrong/10"}`}
        >
          <PixelIcon name={feedback.isCorrect ? "check" : "close"} scale={4} className={`mt-1 shrink-0 ${feedback.isCorrect ? "text-correct" : "text-wrong"}`} />
          <div className="min-w-0 flex-1 space-y-2">
            <p className={`flex items-center gap-2 font-pixel text-2xl ${feedback.isCorrect ? "text-correct" : "text-wrong"}`}>
              {feedback.isCorrect ? "Correct!" : timedOut ? "Time's up" : "Not quite"}
              {feedback.xp > 0 && (
                <span className="ml-auto bg-secondary px-2.5 py-0.5 font-sans text-sm text-secondary-fg">+{feedback.xp} XP</span>
              )}
            </p>
            {!feedback.isCorrect && (
              <p>
                The answer is <strong className="font-semibold">{feedback.expected}</strong>.
              </p>
            )}
            {feedback.pickedPrompt && !timedOut && (
              <p className="text-sm text-text-muted">You picked the answer for &ldquo;{feedback.pickedPrompt}&rdquo;.</p>
            )}
            {feedback.explanation && <p className="text-sm text-text-muted">{feedback.explanation}</p>}
            {feedback.masteredNow && <p className="text-sm font-medium">You&apos;ve mastered this card.</p>}
          </div>
        </div>
      )}

      {feedback && (
        <Button ref={nextRef} size="lg" className="w-full" onClick={onNext} disabled={busy}>
          {busy ? "Saving…" : isLast ? lastLabel : "Next"}
          <ArrowRight size={18} aria-hidden />
        </Button>
      )}
    </div>
  );
}

/** A shrinking bar with the seconds left. Calls onTimeUp once when it reaches zero. */
function Countdown({ limitMs, stopped, onTimeUp }: { limitMs: number; stopped: boolean; onTimeUp: () => void }) {
  const [leftMs, setLeftMs] = useState(limitMs);
  const timeUp = useRef(onTimeUp);
  useEffect(() => {
    timeUp.current = onTimeUp;
  });

  useEffect(() => {
    if (stopped) return;
    const endsAt = performance.now() + leftMs;
    const id = window.setInterval(() => {
      const left = Math.max(0, endsAt - performance.now());
      setLeftMs(left);
      if (left === 0) {
        window.clearInterval(id);
        timeUp.current();
      }
    }, 100);
    return () => window.clearInterval(id);
    // Restarting only when it's stopped or resumed; leftMs is read once per run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopped]);

  const seconds = Math.ceil(leftMs / 1000);
  const low = seconds <= 5;
  return (
    <div className="flex items-center gap-3">
      <PixelBar
        ratio={leftMs / limitMs}
        label="Time left"
        max={Math.ceil(limitMs / 1000)}
        now={seconds}
        valueText={`${seconds} seconds left`}
        segments={10}
        size="sm"
        tone={low ? "wrong" : "progress"}
        className="flex-1"
      />
      <p className={`inline-flex w-16 items-center justify-end gap-1.5 font-pixel text-base tabular-nums ${low ? "text-wrong" : "text-text-muted"}`}>
        <PixelIcon name="clock" scale={2} />
        <span className="sr-only">Time left: </span>
        {seconds}s
      </p>
    </div>
  );
}

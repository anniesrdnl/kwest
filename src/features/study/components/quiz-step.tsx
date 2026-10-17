"use client";

import { ArrowRight, Check, Clock, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { SubmitAnswerResult } from "@/lib/types/database";
import { answerCard } from "../actions";
import { questionText, type QuizQuestion } from "../logic";

type QuizStepProps = {
  sessionId: string;
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
              readOnly={given !== null}
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
            {feedback.isCorrect ? <Check size={18} aria-hidden /> : timedOut ? <Clock size={18} aria-hidden /> : <X size={18} aria-hidden />}
            {feedback.isCorrect ? "Correct" : timedOut ? "Time's up" : "Not quite"}
            {feedback.xp > 0 && (
              <span className="ml-auto rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-fg">+{feedback.xp} XP</span>
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
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-track" aria-hidden>
        <div
          className={`h-full rounded-full ${low ? "bg-wrong" : "bg-progress"}`}
          style={{ width: `${(leftMs / limitMs) * 100}%` }}
        />
      </div>
      <p className={`inline-flex w-14 items-center justify-end gap-1 text-sm font-semibold tabular-nums ${low ? "text-wrong" : "text-text-muted"}`}>
        <Clock size={14} aria-hidden />
        <span className="sr-only">Time left: </span>
        {seconds}s
      </p>
    </div>
  );
}

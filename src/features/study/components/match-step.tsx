"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { PixelIcon } from "@/components/brand/pixel";
import { Button } from "@/components/ui/button";
import type { SubmitAnswerResult } from "@/lib/types/database";
import { answerCard } from "../actions";
import { matchAsk, type MatchRound } from "../logic";

type MatchStepProps = {
  sessionId: string;
  round: MatchRound;
  isLast: boolean;
  busy: boolean;
  onAnswered: (r: SubmitAnswerResult) => void;
  onError: (m: string) => void;
  onNext: () => void;
};

const tile =
  "flex min-h-14 w-full items-center gap-2 border px-3 py-3 text-left break-words transition-colors enabled:active:translate-y-px";

/**
 * A round of matching: tap a card on the left, then its answer on the right. Each pair is graded on the
 * server as a multiple-choice answer, so XP and review dates work like any other question. A wrong pair
 * counts as a miss and the round goes on until every card is matched.
 */
export function MatchStep({ sessionId, round, isLast, busy, onAnswered, onError, onNext }: MatchStepProps) {
  const { cards, answers } = round;
  const [promptAt, setPromptAt] = useState<number | null>(null);
  const [answerAt, setAnswerAt] = useState<number | null>(null);
  /** Card number to answer number, for the pairs that were right. */
  const [pairs, setPairs] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [miss, setMiss] = useState<{ p: number; a: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const [xp, setXp] = useState(0);
  const [sending, startTransition] = useTransition();
  const lastAt = useRef(0);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    lastAt.current = performance.now();
  }, []);

  const matched = Object.keys(pairs).length;
  const done = matched === cards.length;
  const usedAnswers = new Set(Object.values(pairs));

  useEffect(() => {
    if (done) nextRef.current?.focus();
  }, [done]);

  const grade = (p: number, a: number) =>
    startTransition(async () => {
      const res = await answerCard({
        sessionId,
        cardId: cards[p].id,
        type: "mc",
        given: answers[a],
        responseMs: performance.now() - lastAt.current,
      });
      lastAt.current = performance.now();
      setPromptAt(null);
      setAnswerAt(null);
      if (!res.ok) return onError(res.message);
      onAnswered(res.result);
      setXp((x) => x + res.result.xp);
      if (res.result.isCorrect) {
        setPairs((m) => ({ ...m, [p]: a }));
        const note = res.result.explanation;
        if (note) setNotes((n) => ({ ...n, [p]: note }));
      } else {
        setMisses((m) => m + 1);
        setMiss({ p, a });
        window.setTimeout(() => setMiss(null), 700);
      }
    });

  const pickPrompt = (i: number) => {
    if (sending || done || pairs[i] !== undefined) return;
    if (answerAt !== null) {
      setPromptAt(i);
      grade(i, answerAt);
    } else setPromptAt(promptAt === i ? null : i);
  };

  const pickAnswer = (j: number) => {
    if (sending || done || usedAnswers.has(j)) return;
    if (promptAt !== null) {
      setAnswerAt(j);
      grade(promptAt, j);
    } else setAnswerAt(answerAt === j ? null : j);
  };

  const style = (isMatched: boolean, isMiss: boolean, isPicked: boolean) =>
    isMatched
      ? "border-correct bg-surface ring-1 ring-correct"
      : isMiss
        ? "shake border-wrong bg-surface ring-1 ring-wrong"
        : isPicked
          ? "border-border-strong bg-accent-soft"
          : "border-border bg-surface enabled:hover:bg-accent-soft";

  return (
    <div className="space-y-5">
      <div className="pixel-lift">
        <section className="pixel-frame space-y-2 p-6 sm:p-8">
          <p className="font-display text-base text-text-muted">{matchAsk(cards)}</p>
          <p className="text-lg">Tap one on the left, then its match on the right.</p>
          <p aria-live="polite" className="text-sm text-text-muted">
            {matched} of {cards.length} matched
          </p>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <ul className="space-y-3" aria-label="Cards">
          {cards.map((card, i) => {
            const isMatched = pairs[i] !== undefined;
            return (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => pickPrompt(i)}
                  disabled={isMatched || sending || busy}
                  aria-pressed={promptAt === i}
                  className={`${tile} ${style(isMatched, miss?.p === i, promptAt === i)}`}
                >
                  {isMatched && <PixelIcon name="check" scale={2} className="shrink-0 text-correct" />}
                  <span className="min-w-0">
                    <span className="block">{card.prompt}</span>
                    {notes[i] && <span className="mt-1 block text-sm text-text-muted">{notes[i]}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="space-y-3" aria-label="Answers">
          {answers.map((answer, j) => {
            const isMatched = usedAnswers.has(j);
            return (
              <li key={j}>
                <button
                  type="button"
                  onClick={() => pickAnswer(j)}
                  disabled={isMatched || sending || busy}
                  aria-pressed={answerAt === j}
                  className={`${tile} ${style(isMatched, miss?.a === j, answerAt === j)}`}
                >
                  {isMatched && <PixelIcon name="check" scale={2} className="shrink-0 text-correct" />}
                  <span className="min-w-0">{answer}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {done && (
        <div role="status" className="flex items-start gap-4 border border-correct bg-correct/10 p-4">
          <PixelIcon name="check" scale={4} className="mt-1 shrink-0 text-correct" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="flex items-center gap-2 font-display text-2xl text-correct">
              All matched!
              {xp > 0 && <span className="ml-auto bg-secondary px-2.5 py-0.5 font-sans text-sm text-secondary-fg">+{xp} XP</span>}
            </p>
            <p className="text-sm text-text-muted">
              {misses === 0 ? "No misses." : `${misses} ${misses === 1 ? "miss" : "misses"} along the way.`}
            </p>
          </div>
        </div>
      )}

      {done && (
        <Button ref={nextRef} size="lg" className="w-full" onClick={onNext} disabled={busy}>
          {busy ? "Saving…" : isLast ? "See results" : "Next"}
          <ArrowRight size={18} aria-hidden />
        </Button>
      )}
    </div>
  );
}

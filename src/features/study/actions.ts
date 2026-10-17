"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { FinishSessionResult, QuestionType, SubmitAnswerResult } from "@/lib/types/database";
import type { StudyMode } from "./logic";

type Fail = { ok: false; message: string };

// Grading, XP, coins and spaced-repetition updates all happen in the database
// RPCs (0002_functions.sql). These actions only pass the player's input along.

export async function startStudySession(deckId: string, mode: StudyMode): Promise<{ ok: true; sessionId: string } | Fail> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_session", { p_set_id: deckId, p_mode: mode });
  if (error) {
    if (error.message === "no_cards") return { ok: false, message: "This deck has no cards yet." };
    return { ok: false, message: "Couldn't start studying. Please try again." };
  }
  return { ok: true, sessionId: data };
}

/** Challenge mode is the database's "dust-duel" game: the server checks the win and pays the game bonus. */
export async function startChallenge(deckId: string): Promise<{ ok: true; sessionId: string } | Fail> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_session", { p_set_id: deckId, p_mode: "game", p_game_key: "dust-duel" });
  if (error) {
    if (error.message === "no_cards") return { ok: false, message: "This deck has no cards yet." };
    return { ok: false, message: "Couldn't start the challenge. Please try again." };
  }
  return { ok: true, sessionId: data };
}

export type AnswerInput = {
  sessionId: string;
  cardId: string;
  type: QuestionType;
  given: string;
  responseMs: number;
  /** True/false only: the answer that was shown. */
  shownAnswer?: string;
};

export async function answerCard(input: AnswerInput): Promise<{ ok: true; result: SubmitAnswerResult } | Fail> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_answer", {
    p_session_id: input.sessionId,
    p_card_id: input.cardId,
    p_question_type: input.type,
    p_given: input.given.slice(0, 500),
    p_response_ms: Math.max(0, Math.round(input.responseMs)),
    p_shown_answer: input.shownAnswer ?? null,
  });
  if (error) return { ok: false, message: "Couldn't save that answer. Please try again." };
  return { ok: true, result: data as unknown as SubmitAnswerResult };
}

export async function finishStudySession(sessionId: string): Promise<{ ok: true; result: FinishSessionResult } | Fail> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("finish_session", { p_session_id: sessionId });
  if (error) return { ok: false, message: "Couldn't finish the session. Please try again." };
  // XP, coins and level changed: re-render the header and dashboard.
  refresh();
  return { ok: true, result: data as unknown as FinishSessionResult };
}

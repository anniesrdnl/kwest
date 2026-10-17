"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ChallengeAttemptResult, SubmitAnswerResult } from "@/lib/types/database";
import type { AnswerInput } from "./actions";

type Fail = { ok: false; message: string };

// "Beat my score" links. Grading and the scoreboard live in the database
// (0010_challenge_links.sql). Playing a link earns no XP or coins.

/** Share a finished challenge game. Returns the link code. */
export async function createChallengeLink(sessionId: string, timer: boolean): Promise<{ ok: true; code: string } | Fail> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_challenge_link", { p_session_id: sessionId, p_timer: timer });
  if (error) return { ok: false, message: "Couldn't make a link. Please try again." };
  return { ok: true, code: data };
}

export async function startLinkAttempt(code: string): Promise<{ ok: true; attemptId: string } | Fail> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_challenge_attempt", { p_code: code });
  if (error) {
    if (error.message === "not_found") return { ok: false, message: "This link doesn't work anymore." };
    if (error.message === "no_cards") return { ok: false, message: "This deck doesn't have enough cards anymore." };
    return { ok: false, message: "Couldn't start the challenge. Please try again." };
  }
  return { ok: true, attemptId: data };
}

export async function answerLinkCard(
  attemptId: string,
  input: Omit<AnswerInput, "sessionId">,
): Promise<{ ok: true; result: SubmitAnswerResult } | Fail> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_challenge_answer", {
    p_attempt_id: attemptId,
    p_card_id: input.cardId,
    p_question_type: input.type,
    p_given: input.given.slice(0, 500),
  });
  if (error) return { ok: false, message: "Couldn't save that answer. Please try again." };
  return { ok: true, result: data as unknown as SubmitAnswerResult };
}

export async function finishLinkAttempt(attemptId: string): Promise<{ ok: true; result: ChallengeAttemptResult } | Fail> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("finish_challenge_attempt", { p_attempt_id: attemptId });
  if (error) return { ok: false, message: "Couldn't save your score. Please try again." };
  // The scoreboard changed.
  refresh();
  return { ok: true, result: data as unknown as ChallengeAttemptResult };
}

"use server";
import { revalidatePath } from "next/cache";
import { q, J } from "@/lib/db";
import { requireStudent } from "@/lib/guards";
import { getT } from "@/lib/i18n/server";
import { finishIntake, type ChatTurn, type IntakeSummary, type ParsedCv } from "@/lib/ai/services";
import { tryLock, unlock, hasBusyFlag, setBusyFlag } from "@/lib/ai/guard";
import { gapKey } from "@/lib/matching";

/** "Try again" on skill gaps that fell back to rules: drop the cached fallback so the next view asks Gemini again. AI answers are kept. */
export async function retrySkillGaps(problemId: string) {
  const { user } = await requireStudent();
  if (!/^[0-9a-f-]{36}$/i.test(problemId)) return;
  await q(`delete from ai_cache where key = $1 and coalesce((value->>'ai')::boolean, false) = false`, [gapKey(user.id, problemId)]);
  revalidatePath(`/student/problems/${problemId}`);
}

/** "Try again" on pathways built by rules because Gemini was busy. One call; only while the student hasn't approved yet. */
export async function retryPathways() {
  const { user, profile } = await requireStudent();
  if (profile.approved_at || !profile.pathways || !(await hasBusyFlag(`pathways:${user.id}`))) return;
  if (!(await tryLock(`pathways:${user.id}`, 60))) return;
  try {
    const t = await getT();
    const plain: ChatTurn[] = ((profile.intake_transcript ?? []) as (ChatTurn & { key?: string })[]).map((x) => ({ role: x.role, text: x.key ? t(x.key) : x.text }));
    const r = await finishIntake({ cv: profile.cv_parsed as ParsedCv, summary: null, transcript: plain, targetRoles: profile.target_roles ?? [] });
    if (r.busy) return;
    await q(`update student_profiles set intake_summary = $2::jsonb, pathways = $3::jsonb, updated_at = now() where user_id = $1 and approved_at is null`, [user.id, J(r.summary satisfies IntakeSummary), J(r.pathways)]);
    await setBusyFlag(`pathways:${user.id}`, false);
  } finally {
    await unlock(`pathways:${user.id}`);
  }
  revalidatePath("/student/profile");
}

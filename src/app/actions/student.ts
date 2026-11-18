"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { q, one, J } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireStudent } from "@/lib/guards";
import { ROLES, slugify, roleTitle } from "@/db/taxonomy";
import { saveUpload } from "@/lib/storage";
import { readCv, YEAR_OPTIONS, intakeNext, finishIntake, PathwaysSchema, INTAKE_FALLBACK_QUESTIONS, MAX_INTAKE_QUESTIONS, type ChatTurn, type ParsedCv } from "@/lib/ai/services";
import { tryLock, unlock, shortHash, setBusyFlag } from "@/lib/ai/guard";
import { pdfText } from "@/lib/pdftext";
import { fetchJobText } from "@/lib/jobs";
import { takeUp } from "@/lib/engagement";
import { handleStudentId, ID_MAX_BYTES, isIdType } from "@/lib/student-id";
import { getT } from "@/lib/i18n/server";

/** aiBusy: the chat reply came from the fixed question list because Gemini was rate-limited (the chat shows a friendly note). */
export type FormState = { error?: string; ok?: boolean; n?: number; step?: string; email?: string; aiBusy?: boolean };

/* ---------------- S1: student ID and college details on the profile (round 5) ---------------- */

/** Student ID from the profile's "Student ID" card. Never a gate; a failed reading saves nothing and says nothing. */
export async function uploadIdFromProfile(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("student");
  const file = form.get("student_id");
  if (!(file instanceof File) || file.size === 0) return { error: "Please choose a photo or a PDF." };
  if (!isIdType(file.type)) return { error: "Please choose a photo or a PDF." };
  if (file.size > ID_MAX_BYTES) return { error: "That file is over 4 MB. Try a smaller photo." };
  try {
    await handleStudentId(user, file);
  } catch (e) {
    console.warn("[profile] student ID not saved", e instanceof Error ? e.message : "unknown");
    return { error: "We couldn't save that file. Please try again." };
  }
  revalidatePath("/student", "layout");
  return { ok: true };
}

/** College, course and year, editable on the profile. Any of them may be left empty. */
export async function saveStudentDetails(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("student");
  const clean = (k: string, n: number) => String(form.get(k) ?? "").trim().slice(0, n) || null;
  const year = clean("year", 30);
  if (year && !(YEAR_OPTIONS as readonly string[]).includes(year)) return { error: "Please pick a year from the list." };
  await q(
    `insert into student_profiles (user_id, college, course, year) values ($1,$2,$3,$4)
     on conflict (user_id) do update set college = excluded.college, course = excluded.course, year = excluded.year, updated_at = now()`,
    [user.id, clean("college", 160), clean("course", 120), year],
  );
  revalidatePath("/student", "layout");
  return { ok: true };
}

/* ---------------- S2: profile builder ---------------- */

async function cvTextFrom(file: File, bytes: Uint8Array) {
  if (file.type === "application/pdf") return pdfText(bytes);
  if (file.type.startsWith("text/")) return new TextDecoder().decode(bytes).slice(0, 20000);
  return "";
}

export async function uploadCv(_: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireStudent();
  return saveCv(user.id, form.get("cv"), String(form.get("cv_text") ?? "").trim());
}

/** Stores a CV (file or pasted text), reads it with one Gemini call and starts the intake chat. Shared by the profile and the take-up page. */
async function saveCv(userId: string, file: FormDataEntryValue | null, pasted: string): Promise<FormState> {
  const user = { id: userId };
  let cvFile = null;
  let text = pasted;
  let bytes: Uint8Array | undefined;
  let mime: string | undefined;
  if (file instanceof File && file.size > 0) {
    try {
      cvFile = await saveUpload("cvs", user.id, file);
    } catch (e) {
      return { error: (e as Error).message === "file_too_large" ? "err.file_too_large" : "common.something_wrong" };
    }
    bytes = new Uint8Array(await file.arrayBuffer());
    mime = file.type;
    const extracted = await cvTextFrom(file, bytes);
    text = [extracted, pasted].filter(Boolean).join("\n");
  }
  if (!cvFile && text.length < 30) return { error: "profile.err_cv" };
  // Double tap / second tab: one CV reading at a time per student.
  if (!(await tryLock(`cv:${user.id}`, 60))) {
    revalidatePath("/student/profile");
    return { ok: true };
  }
  // One Gemini call reads the CV and writes the first intake question.
  const { cv: parsed, firstQuestion } = await readCv({ bytes, mime, text: text || undefined }).finally(() => unlock(`cv:${user.id}`));
  const transcript: (ChatTurn & { key?: string })[] = [
    firstQuestion ? { role: "assistant", text: firstQuestion } : { role: "assistant", text: "", key: INTAKE_FALLBACK_QUESTIONS[0] },
  ];
  await q(
    `update student_profiles set cv_file = coalesce($2::jsonb, cv_file), cv_text = $3, cv_parsed = $4::jsonb, intake_transcript = $5::jsonb,
       intake_summary = null, pathways = null, approved_at = null, target_roles = '[]'::jsonb, job_links = '[]'::jsonb, updated_at = now() where user_id = $1`,
    [user.id, cvFile ? J(cvFile) : null, text.slice(0, 20000), J(parsed), J(transcript)],
  );
  revalidatePath("/student/profile");
  return { ok: true };
}

const URL_RE = /https?:\/\/[^\s<>"']+/g;

async function transcriptText(turns: (ChatTurn & { key?: string })[]): Promise<ChatTurn[]> {
  const t = await getT();
  return turns.map((x) => ({ role: x.role, text: x.key ? t(x.key) : x.text }));
}

export async function answerCareerIntake(prev: FormState, form: FormData): Promise<FormState> {
  const { user, profile } = await requireStudent();
  const text = String(form.get("text") ?? "").trim();
  if (!text) return { error: "pc.err_answer" };
  const turns = [...((profile.intake_transcript ?? []) as (ChatTurn & { key?: string })[]), { role: "user" as const, text: text.slice(0, 2000) }];
  // Job links: fetch the page text where possible; otherwise keep the link and the student's words.
  const links: string[] = [...(profile.job_links ?? [])];
  for (const url of text.match(URL_RE) ?? []) if (!links.includes(url)) links.push(url);
  const jobTexts: string[] = [];
  for (const url of links.slice(-3)) {
    const cached = await one(`select value from ai_cache where key = $1`, [`job:${url}`]);
    if (cached) { if (cached.value) jobTexts.push(String(cached.value)); continue; }
    const page = await fetchJobText(url);
    await q(`insert into ai_cache (key, value) values ($1,$2::jsonb) on conflict (key) do nothing`, [`job:${url}`, J(page)]);
    if (page) jobTexts.push(page);
  }
  const allText = turns.filter((x) => x.role === "user").map((x) => x.text).join(" ");
  const targets = Array.from(new Set([...(profile.target_roles ?? []), ...ROLES.filter((r) => allText.toLowerCase().includes(r.title.toLowerCase())).map((r) => r.title)]));
  const plain = await transcriptText(turns);
  // The same answer sent twice (double tap, resent form) is handled once.
  if (profile.pathways || !(await tryLock(`intake:${user.id}:${turns.length}:${shortHash(text)}`, 45))) return { ok: true, n: prev.n ?? 0 };
  // At most MAX_INTAKE_QUESTIONS questions: after the last answer, skip the question call and build the profile.
  // Also skip it when the AI marked its previous question as the last one it needed.
  const answered = turns.filter((x) => x.role === "user").length;
  const lastWasFinal = Boolean((turns.findLast((x) => x.role === "assistant") as { final?: boolean } | undefined)?.final);
  const next = answered >= MAX_INTAKE_QUESTIONS || lastWasFinal ? { done: true as const } : await intakeNext({ cv: profile.cv_parsed as ParsedCv, transcript: plain, jobTexts, targetRoles: targets });
  if (!next.done) {
    turns.push({ role: "assistant", text: next.question ?? "", key: next.questionKey, ...(next.final ? { final: true } : {}) } as ChatTurn & { key?: string });
    await q(`update student_profiles set intake_transcript = $2::jsonb, job_links = $3::jsonb, target_roles = $4::jsonb, updated_at = now() where user_id = $1`, [user.id, J(turns), J(links), J(targets)]);
    revalidatePath("/student/profile");
    return { ok: true, n: (prev.n ?? 0) + 1, ...(next.busy ? { aiBusy: true } : {}) };
  }
  // Exactly one pathway call per finished intake (it also writes the summary when the question limit was reached).
  const built = await finishIntake({ cv: profile.cv_parsed as ParsedCv, summary: ("summary" in next ? next.summary : null) ?? null, transcript: plain, targetRoles: targets });
  const { summary, pathways } = built;
  await setBusyFlag(`pathways:${user.id}`, built.busy);
  await q(
    `update student_profiles set intake_transcript = $2::jsonb, job_links = $3::jsonb, target_roles = $4::jsonb, intake_summary = $5::jsonb, pathways = $6::jsonb, approved_at = null, updated_at = now() where user_id = $1`,
    [user.id, J(turns), J(links), J(Array.from(new Set([...targets, ...summary.target_roles]))), J(summary), J(pathways)],
  );
  redirect("/student/profile");
}

export async function finishCareerIntakeNow() {
  const { user, profile } = await requireStudent();
  // Pathways already built (double tap, or the last answer finished the intake): never build them twice.
  if (profile.pathways || !(await tryLock(`pathways:${user.id}`, 60))) redirect("/student/profile");
  const plain = await transcriptText(profile.intake_transcript ?? []);
  // One call writes the summary and the pathways together.
  const built = await finishIntake({ cv: profile.cv_parsed as ParsedCv, summary: null, transcript: plain, targetRoles: profile.target_roles ?? [] }).finally(() => unlock(`pathways:${user.id}`));
  await setBusyFlag(`pathways:${user.id}`, built.busy);
  await q(`update student_profiles set intake_summary = $2::jsonb, pathways = $3::jsonb, approved_at = null, updated_at = now() where user_id = $1 and pathways is null`, [user.id, J(built.summary), J(built.pathways)]);
  redirect("/student/profile");
}

export async function approvePathways(_: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireStudent();
  let data: unknown;
  try {
    data = JSON.parse(String(form.get("pathways") ?? ""));
  } catch {
    return { error: "common.something_wrong" };
  }
  const parsed = PathwaysSchema.safeParse(data);
  if (!parsed.success) return { error: "common.something_wrong" };
  const clean = (a: { role: string; slug: string; rationale: string }[]) =>
    a.filter((x) => x.role.trim()).slice(0, 4).map((x) => ({ role: x.role.trim().slice(0, 60), slug: x.slug || slugify(x.role), rationale: x.rationale.trim().slice(0, 240) }));
  const p = { now: clean(parsed.data.now), pivot: clean(parsed.data.pivot), stretch: clean(parsed.data.stretch) };
  if (!p.now.length && !p.pivot.length && !p.stretch.length) return { error: "profile.err_empty_paths" };
  await q(`update student_profiles set pathways = $2::jsonb, approved_at = now(), updated_at = now() where user_id = $1`, [user.id, J(p)]);
  await q(`delete from ai_cache where key like $1`, [`match:${user.id}:%`]);
  redirect("/student/problems?tab=suggested&approved=1");
}

export async function restartIntake() {
  const { user } = await requireStudent();
  await q(`update student_profiles set cv_parsed = null, intake_transcript = '[]'::jsonb, intake_summary = null, pathways = null, approved_at = null where user_id = $1`, [user.id]);
  redirect("/student/profile");
}

export async function editPathways() {
  const { user } = await requireStudent();
  await q(`update student_profiles set approved_at = null where user_id = $1`, [user.id]);
  redirect("/student/profile");
}

/* ---------------- S4: take up ---------------- */

/** A student without a CV or with college, course or year missing sees one short details page before taking up (never a lock). */
async function needsDetails(profile: { cv_parsed?: unknown; college?: string | null; course?: string | null; year?: string | null }) {
  return !profile.cv_parsed || !profile.college?.trim() || !profile.course?.trim() || !profile.year?.trim();
}

export async function takeUpProblem(_: FormState, form: FormData): Promise<FormState> {
  const { user, profile } = await requireStudent();
  const problemId = String(form.get("problemId"));
  if (/^[0-9a-f-]{36}$/.test(problemId) && (await needsDetails(profile))) redirect(`/student/problems/${problemId}/start`);
  const r = await takeUp(user.id, problemId);
  if (!r.ok) return { error: r.error };
  redirect(`/student/engagements/${r.id}?new=1`);
}

/**
 * The "Before you start" page: saves whatever details were filled in (a CV is read only if one was added),
 * then takes the problem up and opens the engagement. Nothing here is required.
 */
export async function takeUpWithDetails(_: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireStudent();
  const problemId = String(form.get("problemId") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(problemId)) return { error: "common.something_wrong" };
  const clean = (k: string, n: number) => String(form.get(k) ?? "").trim().slice(0, n);
  const year = clean("year", 30);
  await q(
    `update student_profiles set college = coalesce(nullif($2,''), college), course = coalesce(nullif($3,''), course),
       year = coalesce(nullif($4,''), year), updated_at = now() where user_id = $1`,
    [user.id, clean("college", 160), clean("course", 120), (YEAR_OPTIONS as readonly string[]).includes(year) ? year : ""],
  );
  const file = form.get("cv");
  const pasted = String(form.get("cv_text") ?? "").trim();
  if ((file instanceof File && file.size > 0) || pasted) {
    const r = await saveCv(user.id, file, pasted);
    if (r.error) return r;
  }
  revalidatePath("/student", "layout");
  const r = await takeUp(user.id, problemId);
  if (!r.ok) return { error: r.error };
  redirect(`/student/engagements/${r.id}?new=1`);
}

/* ---------------- S3: roadmap progress ---------------- */

export async function setTopicStatus(role: string, topicId: string, status: "done" | "learning" | "skipped" | null) {
  const { user } = await requireStudent();
  if (!/^[a-z0-9-]{1,80}$/.test(role) || !/^[a-z0-9-]{1,80}$/.test(topicId)) return {};
  if (status !== null && !["done", "learning", "skipped"].includes(status)) return {};
  const row = await one(`select statuses, completed_step_ids from roadmap_progress where student_id = $1 and role = $2`, [user.id, role]);
  const st: Record<string, string> = { ...(row?.statuses ?? {}) };
  for (const id of (row?.completed_step_ids ?? []) as string[]) if (!st[id]) st[id] = "done";
  if (status) st[topicId] = status;
  else delete st[topicId];
  const done = Object.entries(st).filter(([, v]) => v === "done").map(([k]) => k);
  await q(
    `insert into roadmap_progress (student_id, role, completed_step_ids, statuses) values ($1,$2,$3::jsonb,$4::jsonb)
     on conflict (student_id, role) do update set completed_step_ids = excluded.completed_step_ids, statuses = excluded.statuses`,
    [user.id, role, J(done), J(st)],
  );
  revalidatePath("/student/roadmaps");
  revalidatePath("/student/dashboard");
  return st;
}

export async function addTargetRole(form: FormData) {
  const { user, profile } = await requireStudent();
  const title = String(form.get("role") ?? "").trim().slice(0, 60);
  if (title.length < 2) redirect("/student/roadmaps");
  const targets = Array.from(new Set([...(profile.target_roles ?? []), roleTitle(slugify(title)) === slugify(title) ? title : roleTitle(slugify(title))]));
  await q(`update student_profiles set target_roles = $2::jsonb where user_id = $1`, [user.id, J(targets)]);
  redirect(`/student/roadmaps/${slugify(title)}`);
}

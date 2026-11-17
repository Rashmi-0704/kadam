"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { q, one, J } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireStudent } from "@/lib/guards";
import { ROLES, slugify, roleTitle } from "@/db/taxonomy";
import { saveUpload } from "@/lib/storage";
import { notify } from "@/lib/notify";
import { readCv, intakeNext, finishIntake, PathwaysSchema, INTAKE_FALLBACK_QUESTIONS, MAX_INTAKE_QUESTIONS, type ChatTurn, type ParsedCv } from "@/lib/ai/services";
import { tryLock, unlock, shortHash, setBusyFlag } from "@/lib/ai/guard";
import { pdfText } from "@/lib/pdftext";
import { fetchJobText } from "@/lib/jobs";
import { takeUp } from "@/lib/engagement";
import { getT } from "@/lib/i18n/server";

/** aiBusy: the chat reply came from the fixed question list because Gemini was rate-limited (the chat shows a friendly note). */
export type FormState = { error?: string; ok?: boolean; n?: number; step?: string; email?: string; aiBusy?: boolean };

/* ---------------- S1: details + verification ---------------- */

export async function saveStudentDetails(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("student");
  const college = String(form.get("college") ?? "").trim();
  const course = String(form.get("course") ?? "").trim();
  const year = String(form.get("year") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  if (college.length < 3 || course.length < 2 || !year || name.length < 2) return { error: "err.fill_required" };
  await q(`update users set name = $2 where id = $1`, [user.id, name.slice(0, 80)]);
  await q(
    `insert into student_profiles (user_id, college, course, year) values ($1,$2,$3,$4)
     on conflict (user_id) do update set college = excluded.college, course = excluded.course, year = excluded.year, updated_at = now()`,
    [user.id, college.slice(0, 160), course.slice(0, 120), year.slice(0, 30)],
  );
  revalidatePath("/student", "layout");
  return { ok: true };
}

const Email = z.string().trim().toLowerCase().email();

/** College email: any properly formatted email is accepted and marks the student verified straight away. No email is sent (Kadam sends no auth emails). */
export async function saveCollegeEmail(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("student");
  const e = Email.safeParse(form.get("college_email"));
  if (!e.success) return { error: "err.email_invalid" };
  await q(`update student_profiles set verification_method = 'email_otp', verification_status = 'verified', college_email = $2, updated_at = now() where user_id = $1`, [user.id, e.data]);
  await q(`insert into verification_requests (student_id, method, status, reviewed_at) values ($1,'email_otp','verified',now())`, [user.id]);
  revalidatePath("/student", "layout");
  return { ok: true, step: "done" };
}

export async function uploadStudentId(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("student");
  const file = form.get("id_file");
  if (!(file instanceof File) || file.size === 0) return { error: "verify.choose_file" };
  if (!/^(image\/|application\/pdf)/.test(file.type)) return { error: "verify.file_type" };
  let stored;
  try {
    stored = await saveUpload("student-ids", `ids/${user.id}`, file);
  } catch (e) {
    return { error: (e as Error).message === "file_too_large" ? "err.file_too_large" : "common.something_wrong" };
  }
  await q(`update student_profiles set verification_method = 'id_upload', verification_status = 'pending', updated_at = now() where user_id = $1`, [user.id]);
  await q(`insert into verification_requests (student_id, method, id_file, status) values ($1,'id_upload',$2::jsonb,'pending')`, [user.id, J(stored)]);
  const admins = await q(`select id from users where role = 'admin'`);
  for (const a of admins) await notify(a.id, "verification_requested", { student: user.name });
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
  const file = form.get("cv");
  const pasted = String(form.get("cv_text") ?? "").trim();
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

export async function takeUpProblem(_: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireStudent();
  const r = await takeUp(user.id, String(form.get("problemId")));
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

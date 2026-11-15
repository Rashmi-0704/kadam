"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { q, one, J } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireBusiness } from "@/lib/guards";
import { BUSINESS_TYPES, SECTORS, PROBLEM_TYPES, DIFFICULTIES, TIME_NEEDED, WORK_MODES, slugify } from "@/db/taxonomy";
import { saveUpload, readBytes, type StoredFile } from "@/lib/storage";
import { problemIntakeNext, draftProblem, type ChatTurn } from "@/lib/ai/services";
import { geminiCanRead, toBase64, type Part } from "@/lib/ai/gemini";
import { getLang, getT } from "@/lib/i18n/server";

export type FormState = { error?: string; ok?: boolean; n?: number };

export async function saveBusinessProfile(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("business");
  const name = String(form.get("business_name") ?? "").trim();
  const type = String(form.get("type") ?? "");
  const sector = String(form.get("sector") ?? "");
  const city = String(form.get("city") ?? "").trim();
  if (name.length < 2 || !city) return { error: "err.fill_required" };
  if (!(BUSINESS_TYPES as readonly string[]).includes(type) || !(SECTORS as readonly string[]).includes(sector)) return { error: "err.fill_required" };
  await q(
    `insert into business_profiles (user_id, business_name, type, sector, city, contact_verified) values ($1,$2,$3,$4,$5,true)
     on conflict (user_id) do update set business_name = excluded.business_name, type = excluded.type, sector = excluded.sector, city = excluded.city`,
    [user.id, name.slice(0, 120), type, sector, city.slice(0, 60)],
  );
  redirect(form.get("next") === "settings" ? "/settings?saved=1" : "/business/dashboard?welcome=1");
}

async function fileParts(raw: { file?: StoredFile }): Promise<Part[]> {
  if (!raw?.file || !geminiCanRead(raw.file.type)) return [];
  const f = await readBytes(raw.file);
  return f ? [{ text: "The owner attached this file about the problem:" }, { inline_data: { mime_type: raw.file.type, data: toBase64(f.bytes) } }] : [];
}

type IntakeTurn = ChatTurn & { key?: string };
async function textTranscript(turns: IntakeTurn[]): Promise<ChatTurn[]> {
  const t = await getT();
  return turns.map((x) => ({ role: x.role, text: x.key ? t(x.key) : x.text }));
}

async function nextStep(problemId: string): Promise<"chat" | "review"> {
  const { profile } = await requireBusiness();
  const p = await one(`select intake, raw_input from problems where id = $1`, [problemId]);
  const turns = (p!.intake ?? []) as IntakeTurn[];
  const transcript = await textTranscript(turns);
  const business = { name: profile.business_name, sector: profile.sector, city: profile.city };
  const parts = await fileParts(p!.raw_input ?? {});
  const next = await problemIntakeNext({ transcript, lang: await getLang(), business, fileParts: parts });
  if (!next.done) {
    turns.push({ role: "assistant", text: next.question ?? "", key: next.questionKey });
    await q(`update problems set intake = $2::jsonb where id = $1`, [problemId, J(turns)]);
    return "chat";
  }
  await finishDraft(problemId, transcript, business, parts);
  return "review";
}

async function finishDraft(problemId: string, transcript: ChatTurn[], business: { name: string; sector: string; city: string }, parts: Part[]) {
  const d = await draftProblem({ transcript, business, fileParts: parts });
  await q(
    `update problems set title=$2, background=$3, current_process=$4, problem=$5, desired_outcome=$6, constraints=$7, expected_timeline=$8,
       resources_provided=$9, categories=$10::jsonb where id = $1`,
    [problemId, d.title, d.background, d.current_process, d.problem, d.desired_outcome, d.constraints, d.expected_timeline, d.resources_provided, J(d.categories)],
  );
}

export async function startProblem(_: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireBusiness();
  const mode = String(form.get("mode") ?? "text");
  const text = String(form.get("text") ?? "").trim();
  const upload = form.get("file");
  let file: StoredFile | undefined;
  if (upload instanceof File && upload.size > 0) {
    try {
      file = await saveUpload("problem-files", user.id, upload);
    } catch (e) {
      return { error: (e as Error).message === "file_too_large" ? "err.file_too_large" : "common.something_wrong" };
    }
  }
  if (text.length < 5 && !file) return { error: "pc.err_empty" };
  const t = await getT();
  const firstTurn = text || t("pc.file_only_turn", { name: file!.name });
  const raw = {
    type: mode === "voice" ? "voice" : file && !text ? "file" : "text",
    text: mode === "voice" ? undefined : text,
    transcript: mode === "voice" ? text : undefined,
    file,
  };
  const row = await one<{ id: string }>(
    `insert into problems (business_id, raw_input, intake, status) values ($1,$2::jsonb,$3::jsonb,'draft') returning id`,
    [user.id, J(raw), J([{ role: "user", text: firstTurn }])],
  );
  const step = await nextStep(row!.id);
  redirect(step === "chat" ? `/business/problems/new?draft=${row!.id}` : `/business/problems/${row!.id}/review`);
}

async function ownDraft(problemId: string) {
  const { user } = await requireBusiness();
  const p = await one(`select id, intake, status, raw_input from problems where id = $1 and business_id = $2`, [problemId, user.id]);
  if (!p) redirect("/business/dashboard");
  return p;
}

export async function answerIntake(prev: FormState, form: FormData): Promise<FormState> {
  const id = String(form.get("problemId"));
  const p = await ownDraft(id);
  const skip = form.get("skip") === "1";
  const text = skip ? "—" : String(form.get("text") ?? "").trim();
  if (!text) return { error: "pc.err_answer" };
  const turns = [...(p.intake ?? []), { role: "user", text }];
  await q(`update problems set intake = $2::jsonb where id = $1`, [id, J(turns)]);
  const step = await nextStep(id);
  if (step === "review") redirect(`/business/problems/${id}/review`);
  revalidatePath("/business/problems/new");
  return { ok: true, n: (prev.n ?? 0) + 1 };
}

export async function finishIntakeNow(form: FormData) {
  const id = String(form.get("problemId"));
  const p = await ownDraft(id);
  const { profile } = await requireBusiness();
  await finishDraft(id, await textTranscript(p.intake ?? []), { name: profile.business_name, sector: profile.sector, city: profile.city }, await fileParts(p.raw_input ?? {}));
  redirect(`/business/problems/${id}/review`);
}

const pickOne = (v: FormDataEntryValue | null, set: readonly string[], d: string) => (set.includes(String(v)) ? String(v) : d);

export async function saveReview(_: FormState, form: FormData): Promise<FormState> {
  const { user, profile } = await requireBusiness();
  const id = String(form.get("problemId"));
  const p = await one(`select id, status from problems where id = $1 and business_id = $2`, [id, user.id]);
  if (!p) return { error: "common.something_wrong" };
  const f = (k: string) => String(form.get(k) ?? "").trim();
  const title = f("title");
  if (title.length < 5 || f("problem").length < 10) return { error: "pc.err_title" };
  if (!f("expected_timeline")) return { error: "pc.err_timeline" };
  const categories = {
    sector: pickOne(form.get("sector"), SECTORS, profile.sector ?? "other"),
    problem_type: pickOne(form.get("problem_type"), PROBLEM_TYPES, "operations"),
    skills: f("skills").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8),
    difficulty: pickOne(form.get("difficulty"), DIFFICULTIES, "beginner"),
    time_needed: pickOne(form.get("time_needed"), TIME_NEEDED, "w1_4"),
    work_mode: pickOne(form.get("work_mode"), WORK_MODES, "hybrid"),
    city: f("city") || profile.city,
    related_roles: form.getAll("related_roles").map((r) => slugify(String(r))).filter(Boolean).slice(0, 4),
  };
  const golive = form.get("intent") === "live";
  await q(
    `update problems set title=$2, background=$3, current_process=$4, problem=$5, desired_outcome=$6, constraints=$7, expected_timeline=$8,
       resources_provided=$9, categories=$10::jsonb, status = case when $11::boolean then 'live' else status end,
       live_at = case when $11::boolean and live_at is null then now() else live_at end where id = $1`,
    [id, title.slice(0, 120), f("background"), f("current_process"), f("problem"), f("desired_outcome"), f("constraints"), f("expected_timeline"), f("resources_provided"), J(categories), golive],
  );
  revalidatePath("/business/dashboard");
  redirect(golive ? `/business/problems/${id}?live=1` : `/business/dashboard`);
}

export async function setProblemOpen(form: FormData) {
  const { user } = await requireBusiness();
  const id = String(form.get("problemId"));
  const open = form.get("open") === "1";
  await q(`update problems set status = $3 where id = $1 and business_id = $2 and status in ('live','closed')`, [id, user.id, open ? "live" : "closed"]);
  revalidatePath(`/business/problems/${id}`);
  revalidatePath("/business/dashboard");
}

export async function deleteDraft(form: FormData) {
  const { user } = await requireBusiness();
  await q(`delete from problems where id = $1 and business_id = $2 and status = 'draft'`, [String(form.get("problemId")), user.id]);
  redirect("/business/dashboard");
}

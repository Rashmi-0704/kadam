import "server-only";
import { q, one, J, type Row } from "./db";
import { notify } from "./notify";
import { impactReport, type ReportInput } from "./ai/services";
import { hasGemini } from "./ai/gemini";

export type Result = { ok: true; id?: string } | { ok: false; error: string };
export const ACTIVE_STATUSES = ["taken_up", "in_progress", "submitted", "received", "accepted", "in_use", "needs_changes"];

export async function loadEngagement(id: string) {
  return one(
    `select e.*, p.title as problem_title, p.business_id, p.categories, p.problem as problem_text, p.desired_outcome, p.status as problem_status,
            b.business_name, b.city as business_city, b.sector as business_sector, s.name as student_name, s.email as student_email
       from engagements e
       join problems p on p.id = e.problem_id
       join business_profiles b on b.user_id = p.business_id
       join users s on s.id = e.student_id
      where e.id = $1`,
    [id],
  );
}

export function canSee(user: { id: string; role: string | null }, e: Row) {
  return user.role === "admin" || e.student_id === user.id || e.business_id === user.id;
}

async function logStatus(engId: string, status: string, reason: string | null = null) {
  await q(`update engagements set status = $2 where id = $1`, [engId, status]);
  await q(`insert into status_changes (engagement_id, status, reason) values ($1,$2,$3)`, [engId, status, reason]);
}

export async function takeUp(studentId: string, problemId: string): Promise<Result> {
  const sp = await one(`select verification_status from student_profiles where user_id = $1`, [studentId]);
  if (sp?.verification_status !== "verified") return { ok: false, error: "err.not_verified" };
  const p = await one(`select id, status, business_id, title from problems where id = $1`, [problemId]);
  if (!p || p.status !== "live") return { ok: false, error: "err.problem_closed" };
  const existing = await one(`select id, status from engagements where problem_id = $1 and student_id = $2`, [problemId, studentId]);
  let id: string;
  if (existing && existing.status !== "withdrawn") return { ok: true, id: existing.id };
  if (existing) {
    id = existing.id;
    await q(`update engagements set withdrawn_at = null, started_at = now() where id = $1`, [id]);
  } else {
    id = (await one<{ id: string }>(`insert into engagements (problem_id, student_id) values ($1,$2) returning id`, [problemId, studentId]))!.id;
  }
  await logStatus(id, "taken_up");
  const student = await one(`select name from users where id = $1`, [studentId]);
  await notify(p.business_id, "taken_up", { engagementId: id, title: p.title, student: student?.name });
  return { ok: true, id };
}

export async function afterMessage(e: Row, senderId: string, preview: string) {
  if (e.status === "taken_up" || e.status === "needs_changes") await logStatus(e.id, "in_progress");
  const other = senderId === e.student_id ? e.business_id : e.student_id;
  // One unread chat notification per thread is enough.
  const pending = await one(`select id from notifications where user_id = $1 and type = 'message' and read = false and payload->>'engagementId' = $2`, [other, e.id]);
  if (!pending) await notify(other, "message", { engagementId: e.id, title: e.problem_title, preview: preview.slice(0, 80) });
}

export async function submitSolution(e: Row, data: { description: string; links: string[]; files: unknown[] }): Promise<Result> {
  if (!["taken_up", "in_progress", "needs_changes"].includes(e.status)) return { ok: false, error: "err.cannot_submit" };
  if (data.description.trim().length < 20) return { ok: false, error: "err.describe_more" };
  await q(`insert into submissions (engagement_id, description, links, files) values ($1,$2,$3::jsonb,$4::jsonb)`, [e.id, data.description.trim(), J(data.links), J(data.files)]);
  await logStatus(e.id, "submitted");
  await notify(e.business_id, "submitted", { engagementId: e.id, title: e.problem_title, student: e.student_name });
  return { ok: true };
}

export async function withdraw(e: Row): Promise<Result> {
  if (!["taken_up", "in_progress"].includes(e.status)) return { ok: false, error: "err.cannot_withdraw" };
  await q(`update engagements set withdrawn_at = now() where id = $1`, [e.id]);
  await logStatus(e.id, "withdrawn");
  await notify(e.business_id, "withdrawn", { engagementId: e.id, title: e.problem_title, student: e.student_name });
  return { ok: true };
}

export async function confirmReceipt(e: Row): Promise<Result> {
  if (e.status !== "submitted") return { ok: false, error: "err.not_allowed" };
  await q(`update submissions set receipt_confirmed_at = now() where id = (select id from submissions where engagement_id = $1 order by submitted_at desc limit 1)`, [e.id]);
  await logStatus(e.id, "received");
  await notify(e.student_id, "receipt_confirmed", { engagementId: e.id, title: e.problem_title });
  await regenerateReport(e.id);
  return { ok: true };
}

const NEXT: Record<string, string[]> = {
  received: ["accepted", "in_use", "needs_changes", "rejected"],
  accepted: ["in_use", "needs_changes"],
};

export async function setStatus(e: Row, status: string, reason: string): Promise<Result> {
  if (!NEXT[e.status]?.includes(status)) return { ok: false, error: "err.not_allowed" };
  if (status === "rejected" && reason.trim().length < 10) return { ok: false, error: "err.reason_required" };
  await logStatus(e.id, status, reason.trim() || null);
  await notify(e.student_id, "status_changed", { engagementId: e.id, title: e.problem_title, status });
  await regenerateReport(e.id);
  return { ok: true };
}

export async function postImpactUpdate(e: Row, data: { what_changed: string; metrics: Record<string, string>; comments: string }): Promise<Result> {
  if (!["accepted", "in_use"].includes(e.status)) return { ok: false, error: "err.not_allowed" };
  if (data.what_changed.trim().length < 3) return { ok: false, error: "err.describe_more" };
  await q(`insert into impact_updates (engagement_id, what_changed, metrics, comments) values ($1,$2,$3::jsonb,$4)`, [e.id, data.what_changed.trim(), J(data.metrics), data.comments.trim() || null]);
  await notify(e.student_id, "impact_update", { engagementId: e.id, title: e.problem_title });
  await regenerateReport(e.id);
  return { ok: true };
}

export async function postFeedback(e: Row, text: string): Promise<Result> {
  if (!["submitted", "received", "accepted", "in_use", "needs_changes", "rejected"].includes(e.status)) return { ok: false, error: "err.not_allowed" };
  if (text.trim().length < 3) return { ok: false, error: "err.describe_more" };
  await q(`insert into feedback (engagement_id, text) values ($1,$2)`, [e.id, text.trim()]);
  await notify(e.student_id, "status_changed", { engagementId: e.id, title: e.problem_title, status: "feedback" });
  await regenerateReport(e.id);
  return { ok: true };
}

const iso = (d: unknown) => (d instanceof Date ? d.toISOString() : String(d));

/** AI-5: builds a new report version from everything the business has said so far. */
export async function regenerateReport(engId: string): Promise<boolean> {
  const e = await loadEngagement(engId);
  if (!e) return false;
  const sub = await one(`select description, submitted_at from submissions where engagement_id = $1 order by submitted_at desc limit 1`, [engId]);
  if (!sub) return false;
  const statuses = await q(`select status, reason, created_at from status_changes where engagement_id = $1 order by created_at`, [engId]);
  const updates = await q(`select what_changed, metrics, comments, created_at from impact_updates where engagement_id = $1 order by created_at`, [engId]);
  const fb = await q(`select text, created_at from feedback where engagement_id = $1 order by created_at`, [engId]);
  const input: ReportInput = {
    student: e.student_name,
    business: { name: e.business_name, sector: e.business_sector, city: e.business_city },
    problem: { title: e.problem_title, problem: e.problem_text, desired_outcome: e.desired_outcome, skills: e.categories?.skills ?? [] },
    submission: { description: sub.description, submitted_at: iso(sub.submitted_at) },
    statuses: statuses.map((s) => ({ status: s.status, reason: s.reason, created_at: iso(s.created_at) })),
    updates: updates.map((u) => ({ what_changed: u.what_changed, metrics: u.metrics ?? {}, comments: u.comments, created_at: iso(u.created_at) })),
    feedback: fb.map((f) => ({ text: f.text, created_at: iso(f.created_at) })),
    startedAt: iso(e.started_at),
  };
  const prev = await one(`select version from impact_reports where engagement_id = $1 order by version desc limit 1`, [engId]);
  const report = await impactReport(input);
  const usedTemplate = (report as { __template?: boolean }).__template;
  if (usedTemplate && hasGemini() && prev) {
    // The AI call failed: keep the last good report and let people retry.
    await q(`insert into ai_cache (key, value) values ($1,'true'::jsonb) on conflict (key) do update set value = excluded.value, created_at = now()`, [`report_retry:${engId}`]);
    return false;
  }
  await q(
    `insert into impact_reports (engagement_id, version, summary, outcomes, skills_demonstrated, timeline, resume_bullets, share_token)
     values ($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7::jsonb,$8)`,
    [engId, (prev?.version ?? 0) + 1, report.summary, J(report.outcomes), J(report.skills_demonstrated), J(report.timeline), J(report.resume_bullets), e.share_token],
  );
  await q(`delete from ai_cache where key = $1`, [`report_retry:${engId}`]);
  await notify(e.student_id, "report_regenerated", { engagementId: engId, title: e.problem_title });
  return true;
}

export async function reportNeedsRetry(engId: string) {
  return Boolean(await one(`select 1 from ai_cache where key = $1`, [`report_retry:${engId}`]));
}

/** No scheduler: reminders are worked out when the business opens its dashboard. */
export async function createDueReminders(businessId: string) {
  const rows = await q(
    `select e.id, p.title,
            greatest(coalesce((select max(created_at) from impact_updates u where u.engagement_id = e.id), 'epoch'),
                     coalesce((select max(created_at) from status_changes s where s.engagement_id = e.id and s.status = 'in_use'), 'epoch')) as last_at,
            (select min(created_at) from status_changes s where s.engagement_id = e.id and s.status = 'in_use') as in_use_at,
            e.last_reminder_at
       from engagements e join problems p on p.id = e.problem_id
      where p.business_id = $1 and e.status = 'in_use'`,
    [businessId],
  );
  const DAY = 864e5;
  const now = Date.now();
  const due: string[] = [];
  for (const r of rows) {
    const last = new Date(r.last_at).getTime();
    const inUse = r.in_use_at ? new Date(r.in_use_at).getTime() : now;
    if (now - inUse > 92 * DAY) continue;
    if (now - last < 14 * DAY) continue;
    due.push(r.id);
    if (r.last_reminder_at && now - new Date(r.last_reminder_at).getTime() < 14 * DAY) continue;
    await notify(businessId, "update_due", { engagementId: r.id, title: r.title });
    await q(`update engagements set last_reminder_at = now() where id = $1`, [r.id]);
  }
  return due;
}

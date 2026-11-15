"use server";
import { revalidatePath } from "next/cache";
import { q, J } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { saveUpload, type StoredFile } from "@/lib/storage";
import * as E from "@/lib/engagement";

export type FormState = { error?: string; ok?: boolean; n?: number };

async function load(form: FormData, role?: "student" | "business") {
  const user = await currentUser();
  if (!user) return null;
  const e = await E.loadEngagement(String(form.get("engagementId")));
  if (!e || !E.canSee(user, e)) return null;
  if (role === "student" && e.student_id !== user.id) return null;
  if (role === "business" && e.business_id !== user.id) return null;
  return { user, e };
}

const refresh = (id: string) => {
  revalidatePath(`/student/engagements/${id}`);
  revalidatePath(`/business/engagements/${id}`);
};

export async function sendMessage(prev: FormState, form: FormData): Promise<FormState> {
  const ctx = await load(form);
  if (!ctx) return { error: "err.session" };
  const { user, e } = ctx;
  if (e.status === "withdrawn") return { error: "err.not_allowed" };
  const text = String(form.get("text") ?? "").trim().slice(0, 4000);
  const upload = form.get("file");
  let file: StoredFile | null = null;
  if (upload instanceof File && upload.size > 0) {
    try {
      file = await saveUpload("chat-files", e.id, upload);
    } catch (err) {
      return { error: (err as Error).message === "file_too_large" ? "err.file_too_large" : "common.something_wrong" };
    }
  }
  if (!text && !file) return { error: "chat.empty" };
  await q(`insert into messages (engagement_id, sender_id, text, file) values ($1,$2,$3,$4::jsonb)`, [e.id, user.id, text || null, file ? J(file) : null]);
  await E.afterMessage(e, user.id, text || file!.name);
  refresh(e.id);
  return { ok: true, n: (prev.n ?? 0) + 1 };
}

export async function submitSolution(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await load(form, "student");
  if (!ctx) return { error: "err.session" };
  const links = String(form.get("links") ?? "")
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\/\S+\.\S+/.test(s))
    .slice(0, 8);
  const files: StoredFile[] = [];
  for (const f of form.getAll("files")) {
    if (f instanceof File && f.size > 0) {
      try {
        files.push(await saveUpload("submissions", ctx.e.id, f));
      } catch (err) {
        return { error: (err as Error).message === "file_too_large" ? "err.file_too_large" : "common.something_wrong" };
      }
    }
  }
  const r = await E.submitSolution(ctx.e, { description: String(form.get("description") ?? ""), links, files });
  if (!r.ok) return { error: r.error };
  refresh(ctx.e.id);
  return { ok: true };
}

export async function withdrawEngagement(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await load(form, "student");
  if (!ctx) return { error: "err.session" };
  const r = await E.withdraw(ctx.e);
  if (!r.ok) return { error: r.error };
  refresh(ctx.e.id);
  return { ok: true };
}

export async function confirmReceipt(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await load(form, "business");
  if (!ctx) return { error: "err.session" };
  const r = await E.confirmReceipt(ctx.e);
  if (!r.ok) return { error: r.error };
  refresh(ctx.e.id);
  return { ok: true };
}

export async function setEngagementStatus(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await load(form, "business");
  if (!ctx) return { error: "err.session" };
  const r = await E.setStatus(ctx.e, String(form.get("status") ?? ""), String(form.get("reason") ?? ""));
  if (!r.ok) return { error: r.error };
  refresh(ctx.e.id);
  return { ok: true };
}

export async function postImpactUpdate(prev: FormState, form: FormData): Promise<FormState> {
  const ctx = await load(form, "business");
  if (!ctx) return { error: "err.session" };
  const m = (k: string) => String(form.get(k) ?? "").trim().slice(0, 120);
  const metrics = Object.fromEntries(["time_saved", "sales", "costs", "users", "other"].map((k) => [k, m(k)]).filter(([, v]) => v));
  const r = await E.postImpactUpdate(ctx.e, { what_changed: String(form.get("what_changed") ?? ""), metrics, comments: String(form.get("comments") ?? "") });
  if (!r.ok) return { error: r.error };
  refresh(ctx.e.id);
  return { ok: true, n: (prev.n ?? 0) + 1 };
}

export async function postFeedback(prev: FormState, form: FormData): Promise<FormState> {
  const ctx = await load(form, "business");
  if (!ctx) return { error: "err.session" };
  const r = await E.postFeedback(ctx.e, String(form.get("text") ?? ""));
  if (!r.ok) return { error: r.error };
  refresh(ctx.e.id);
  return { ok: true, n: (prev.n ?? 0) + 1 };
}

export async function retryReport(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await load(form);
  if (!ctx) return { error: "err.session" };
  const ok = await E.regenerateReport(ctx.e.id);
  refresh(ctx.e.id);
  return ok ? { ok: true } : { error: "err.ai_busy" };
}

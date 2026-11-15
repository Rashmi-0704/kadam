"use server";
import { revalidatePath } from "next/cache";
import { q, one } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";

export async function reviewVerification(form: FormData) {
  const admin = await requireUser("admin");
  const id = String(form.get("id"));
  const decision = form.get("decision") === "verified" ? "verified" : "rejected";
  const note = String(form.get("note") ?? "").trim().slice(0, 300) || null;
  const v = await one(`select student_id from verification_requests where id = $1 and status = 'pending'`, [id]);
  if (!v) return;
  await q(`update verification_requests set status = $2, note = $3, reviewed_by = $4, reviewed_at = now() where id = $1`, [id, decision, note, admin.id]);
  await q(`update student_profiles set verification_status = $2, updated_at = now() where user_id = $1`, [v.student_id, decision]);
  await notify(v.student_id, decision === "verified" ? "verification_approved" : "verification_rejected", { note });
  revalidatePath("/admin/verifications");
}

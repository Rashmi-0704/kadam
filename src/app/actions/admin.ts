"use server";
import { revalidatePath } from "next/cache";
import { q, one } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/notify";
import { isAdminEmail } from "@/lib/admin-account";
import { findAuthUserId, setAuthPassword } from "@/lib/legacy-auth";

export async function reviewVerification(form: FormData) {
  const admin = await requireUser("admin");
  const id = String(form.get("id"));
  const decision = form.get("decision") === "verified" ? "verified" : "rejected";
  // Round 4: uploads are auto-verified, so the queue is "not reviewed yet" (old pending ones included). A rejection always carries a reason.
  const typed = String(form.get("note") ?? "").trim().slice(0, 300);
  const note = decision === "rejected" ? typed || "The photo wasn't a clear student ID." : typed || null;
  const v = await one(`select student_id from verification_requests where id = $1 and reviewed_at is null and status in ('pending','verified')`, [id]);
  if (!v) return;
  await q(`update verification_requests set status = $2, note = $3, reviewed_by = $4, reviewed_at = now() where id = $1`, [id, decision, note, admin.id]);
  await q(`update student_profiles set verification_status = $2, updated_at = now() where user_id = $1`, [v.student_id, decision]);
  await notify(v.student_id, decision === "verified" ? "verification_approved" : "verification_rejected", { note });
  revalidatePath("/admin/verifications");
}

export type ResetState = { ok?: boolean; message?: string; email?: string };

/** Admin backup for sign-in trouble: set a temporary password for a non-admin account. No email is sent. */
export async function resetUserPassword(_: ResetState, form: FormData): Promise<ResetState> {
  await requireUser("admin");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: "Enter a valid email.", email };
  if (password.length < 8 || password.length > 72) return { message: "The temporary password needs at least 8 characters.", email };
  // The admin account is controlled only by ADMIN_EMAIL / ADMIN_PASSWORD.
  const target = await one(`select role, name from users where lower(email) = lower($1)`, [email]);
  if (isAdminEmail(email) || target?.role === "admin") return { message: "The admin account can't be reset here. Change ADMIN_PASSWORD in Vercel instead.", email };
  const id = await findAuthUserId(email);
  if (!id) return { message: "No sign-in account uses that email.", email };
  if (!(await setAuthPassword(id, password))) return { message: "Couldn't reset the password. Try again in a minute.", email };
  await q(`update users set password_set_at = now() where lower(email) = lower($1)`, [email]);
  console.info("[admin] password reset", email);
  revalidatePath("/admin/verifications");
  return { ok: true, message: `Password reset for ${target?.name ?? email}. Tell them the new password by phone or WhatsApp.`, email };
}

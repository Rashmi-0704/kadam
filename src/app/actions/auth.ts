"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hasSupabaseAuth, env } from "@/lib/env";
import { authClient } from "@/lib/supabase";
import { q, one, resetDemoData } from "@/lib/db";
import { setSession, currentUser, homeFor } from "@/lib/session";
import { isAcademicEmail } from "@/db/taxonomy";
import { DEMO_ACCOUNTS } from "@/db/seed-data";
import { putBytes } from "@/lib/storage";

const Email = z.string().trim().toLowerCase().email();

export type AuthState = { ok?: boolean; error?: string; step?: "code" | "role"; email?: string };

export async function sendOtp(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = Email.safeParse(form.get("email"));
  if (!parsed.success) return { error: "err.email_invalid" };
  if (!hasSupabaseAuth()) return { error: "err.otp_unavailable", email: parsed.data };
  const { error } = await authClient().auth.signInWithOtp({ email: parsed.data, options: { shouldCreateUser: true } });
  if (error) {
    console.warn("[otp] send failed", error.status);
    return { error: error.status === 429 ? "err.otp_rate" : "err.otp_send", email: parsed.data };
  }
  return { ok: true, step: "code", email: parsed.data };
}

export async function verifyOtp(_: AuthState, form: FormData): Promise<AuthState> {
  const email = Email.safeParse(form.get("email"));
  const code = String(form.get("code") ?? "").replace(/\D/g, "");
  if (!email.success) return { error: "err.email_invalid" };
  if (code.length !== 6) return { error: "err.code_invalid", step: "code", email: email.data };
  if (!hasSupabaseAuth()) return { error: "err.otp_unavailable", step: "code", email: email.data };
  const { error } = await authClient().auth.verifyOtp({ email: email.data, token: code, type: "email" });
  if (error) return { error: "err.code_wrong", step: "code", email: email.data };
  let user = await one(`select id, role from users where email = $1`, [email.data]);
  if (!user) user = await one(`insert into users (email) values ($1) returning id, role`, [email.data]);
  await setSession(user!.id);
  if (!user!.role) return { ok: true, step: "role", email: email.data };
  redirect(homeFor(user!.role));
}

export async function chooseRole(_: AuthState, form: FormData): Promise<AuthState> {
  const u = await currentUser();
  if (!u) return { error: "err.session" };
  const role = form.get("role");
  if (role !== "student" && role !== "business") return { error: "err.pick_role", step: "role" };
  if (form.get("consent") !== "on") return { error: "err.consent", step: "role" };
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  if (name.length < 2) return { error: "err.name", step: "role" };
  if (u.role) redirect(homeFor(u.role));
  await q(`update users set role = $2, name = $3, consent_at = now() where id = $1`, [u.id, role, name]);
  if (role === "student") {
    const academic = isAcademicEmail(u.email);
    await q(
      `insert into student_profiles (user_id, verification_method, verification_status, college_email) values ($1,$2,$3,$4) on conflict (user_id) do nothing`,
      [u.id, academic ? "email_otp" : null, academic ? "verified" : "not_started", academic ? u.email : null],
    );
    if (academic) await q(`insert into verification_requests (student_id, method, status, reviewed_at) values ($1,'email_otp','verified',now())`, [u.id]);
    redirect("/student/onboarding");
  }
  redirect("/business/onboarding");
}

export async function demoSignIn(form: FormData) {
  if (!env.demoMode) redirect("/");
  const id = String(form.get("id"));
  const acct = DEMO_ACCOUNTS.find((a) => a.id === id);
  if (!acct) redirect("/demo");
  const exists = await one(`select role from users where id = $1`, [id]);
  if (!exists) redirect("/demo?missing=1");
  await setSession(id);
  redirect(homeFor(exists.role));
}

export async function demoReset() {
  if (!env.demoMode) redirect("/");
  await resetDemoData((p, b, t) => putBytes("student-ids", p, b, t));
  redirect("/demo?reset=1");
}

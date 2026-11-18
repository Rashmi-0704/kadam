"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hasSupabaseAuth, hasSupabaseAdmin, env } from "@/lib/env";
import { authClient, adminClient } from "@/lib/supabase";
import { ensureAdmin, isAdminEmail } from "@/lib/admin-account";
import { q, one, resetDemoData } from "@/lib/db";
import { setSession, currentUser, homeFor } from "@/lib/session";
import { DEMO_ACCOUNTS } from "@/db/seed-data";
import { hasNoPassword, findAuthUserId, setAuthPassword } from "@/lib/legacy-auth";
import { setFirstPasswordCore } from "@/lib/first-password";

const Email = z.string().trim().toLowerCase().email();
const Password = z.string().min(8).max(72);

export type AuthState = { ok?: boolean; error?: string; step?: "role" | "setpw"; email?: string; mode?: "signin" | "signup" };

/** Sign-in with email + password. Kadam sends no auth emails at all (see BUILD_LOG: switching email flows back on needs custom SMTP). */
async function startSession(email: string): Promise<AuthState> {
  let user = await one(`select id, role from users where email = $1`, [email]);
  if (!user) user = await one(`insert into users (email) values ($1) returning id, role`, [email]);
  await setSession(user!.id);
  if (!user!.role) return { ok: true, step: "role", email };
  redirect(homeFor(user!.role));
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const email = Email.safeParse(form.get("email"));
  if (!email.success) return { error: "err.email_invalid", mode: "signup" };
  const password = Password.safeParse(String(form.get("password") ?? ""));
  if (!password.success) return { error: "err.password_short", email: email.data, mode: "signup" };
  if (!hasSupabaseAdmin()) return { error: "err.auth_unavailable", email: email.data, mode: "signup" };
  // An account made with an email link (no password yet) sets its password instead of "account exists".
  if (await hasNoPassword(email.data)) return { step: "setpw", email: email.data, mode: "signup" };
  // Created on the server with the service key and confirmed straight away: no email is sent, whatever the dashboard's "Confirm email" setting is.
  const { error } = await adminClient().auth.admin.createUser({ email: email.data, password: password.data, email_confirm: true });
  if (error) {
    const exists = error.status === 422 || /already|exists|registered/i.test(error.message);
    if (!exists) console.warn("[auth] create failed", error.status);
    return { error: exists ? "err.account_exists" : "err.auth_unavailable", email: email.data, mode: exists ? "signin" : "signup" };
  }
  const { error: signInError } = await authClient().auth.signInWithPassword({ email: email.data, password: password.data });
  if (signInError) return { error: "err.auth_unavailable", email: email.data, mode: "signin" };
  return startSession(email.data);
}

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const email = Email.safeParse(form.get("email"));
  if (!email.success) return { error: "err.email_invalid", mode: "signin" };
  const password = String(form.get("password") ?? "");
  if (!password) return { error: "err.password_wrong", email: email.data, mode: "signin" };
  if (!hasSupabaseAuth()) return { error: "err.auth_unavailable", email: email.data, mode: "signin" };
  if (isAdminEmail(email.data)) await ensureAdmin();
  const { error } = await authClient().auth.signInWithPassword({ email: email.data, password });
  if (error) {
    if (error.status === 429) return { error: "err.auth_busy", email: email.data, mode: "signin" };
    // An address that joined with an email link before passwords existed sets its password once.
    if (await hasNoPassword(email.data)) return { step: "setpw", email: email.data, mode: "signin" };
    return { error: "err.password_wrong", email: email.data, mode: "signin" };
  }
  return startSession(email.data);
}

/** "Set your password": an old link-made account picks its password once, then signs in. No email is sent. */
export async function setFirstPassword(_: AuthState, form: FormData): Promise<AuthState> {
  const email = Email.safeParse(form.get("email"));
  if (!email.success) return { error: "err.email_invalid" };
  const password = String(form.get("password") ?? "");
  if (!Password.safeParse(password).success) return { error: "err.password_short", step: "setpw", email: email.data };
  const res = await setFirstPasswordCore(
    {
      hasNoPassword,
      findAuthUserId,
      setPassword: setAuthPassword,
      signIn: async (e, p) => !(await authClient().auth.signInWithPassword({ email: e, password: p })).error,
      markSet: async (e) => {
        await q(`insert into users (email) values ($1) on conflict (email) do nothing`, [e]);
        await q(`update users set password_set_at = now() where email = $1`, [e]);
      },
      log: (msg, e) => console.info(msg, e),
    },
    { email: email.data, password, confirm: String(form.get("confirm") ?? "") },
  );
  if (!res.ok) {
    // Already has a password: back to the normal sign-in form with the message.
    if (res.error === "err.password_already_set") return { error: res.error, email: email.data, mode: "signin" };
    return { error: res.error, step: "setpw", email: email.data };
  }
  return startSession(email.data);
}

/** "Joined with an email link before?": asks for the email only. */
export async function checkOldAccount(_: AuthState, form: FormData): Promise<AuthState> {
  const email = Email.safeParse(form.get("email"));
  if (!email.success) return { error: "err.email_invalid" };
  if (await hasNoPassword(email.data)) return { step: "setpw", email: email.data };
  return { error: "err.password_already_set", email: email.data };
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
    await q(`insert into student_profiles (user_id, verification_status) values ($1, 'not_started') on conflict (user_id) do nothing`, [u.id]);
    redirect("/student/onboarding");
  }
  redirect("/business/onboarding");
}

export async function demoSignIn(form: FormData) {
  if (!env.demoMode) redirect("/");
  const id = String(form.get("id"));
  const acct = DEMO_ACCOUNTS.find((a) => a.id === id);
  if (!acct || acct.role === "admin") redirect("/demo");
  const exists = await one(`select role from users where id = $1`, [id]);
  if (!exists) redirect("/demo?missing=1");
  await setSession(id);
  redirect(homeFor(exists.role));
}

export async function demoReset() {
  if (!env.demoMode) redirect("/");
  await resetDemoData();
  redirect("/demo?reset=1");
}

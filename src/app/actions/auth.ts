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
import { handleStudentId, ID_MAX_BYTES, isIdType } from "@/lib/student-id";

const Email = z.string().trim().toLowerCase().email();
const Password = z.string().min(8).max(72);

export type AuthState = { ok?: boolean; error?: string; step?: "role" | "setpw"; email?: string; name?: string; mode?: "signin" | "signup" };

/** Sign-in with email + password. Kadam sends no auth emails at all (see BUILD_LOG: switching email flows back on needs custom SMTP). */
async function startSession(email: string): Promise<AuthState> {
  let user = await one(`select id, role from users where email = $1`, [email]);
  if (!user) user = await one(`insert into users (email) values ($1) returning id, role`, [email]);
  await setSession(user!.id);
  if (!user!.role) return { ok: true, step: "role", email };
  redirect(homeFor(user!.role));
}

/**
 * Round 5: one-page sign-up. Name, email, password, consent and role in one form (plus a student ID file for students).
 * Creates the account (service key, confirmed straight away, no email sent), signs in, creates the users row with the role,
 * name and consent, and for a student the profile. A student ID is handled after that; any failure there is silent.
 */
export async function createAccount(_: AuthState, form: FormData): Promise<AuthState> {
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const role = form.get("role");
  const email = Email.safeParse(form.get("email"));
  const keep = { name, mode: "signup" as const };
  if (role !== "student" && role !== "business") return { error: "err.pick_role", ...keep };
  if (name.length < 2) return { error: "err.name", email: email.success ? email.data : undefined, ...keep };
  if (!email.success) return { error: "err.email_invalid", ...keep };
  const password = Password.safeParse(String(form.get("password") ?? ""));
  if (!password.success) return { error: "err.password_short", email: email.data, ...keep };
  if (form.get("consent") !== "on") return { error: "err.consent", email: email.data, ...keep };
  const idFile = role === "student" ? form.get("student_id") : null;
  const file = idFile instanceof File && idFile.size > 0 ? idFile : null;
  if (file && (file.size > ID_MAX_BYTES || !isIdType(file.type))) return { error: file.size > ID_MAX_BYTES ? "err.file_too_large" : "err.id_file_type", email: email.data, ...keep };
  if (!hasSupabaseAdmin()) return { error: "err.auth_unavailable", email: email.data, ...keep };
  // An account made with an email link (no password yet) sets its password instead of "account exists".
  if (await hasNoPassword(email.data)) return { step: "setpw", email: email.data, mode: "signup" };
  const { error } = await adminClient().auth.admin.createUser({ email: email.data, password: password.data, email_confirm: true });
  if (error) {
    const exists = error.status === 422 || /already|exists|registered/i.test(error.message);
    if (!exists) console.warn("[auth] create failed", error.status);
    return { error: exists ? "err.account_exists" : "err.auth_unavailable", email: email.data, name, mode: exists ? "signin" : "signup" };
  }
  const { error: signInError } = await authClient().auth.signInWithPassword({ email: email.data, password: password.data });
  if (signInError) return { error: "err.auth_unavailable", email: email.data, mode: "signin" };
  const user = (await one<{ id: string; role: string | null }>(
    `insert into users (email, role, name, consent_at) values ($1,$2,$3,now())
     on conflict (email) do update set role = coalesce(users.role, excluded.role), name = coalesce(users.name, excluded.name), consent_at = coalesce(users.consent_at, excluded.consent_at)
     returning id, role`,
    [email.data, role, name],
  ))!;
  await setSession(user.id);
  if (user.role === "student") {
    await q(`insert into student_profiles (user_id, verification_status) values ($1, 'not_started') on conflict (user_id) do nothing`, [user.id]);
    if (file) {
      try {
        await handleStudentId({ id: user.id, name }, file);
      } catch (e) {
        console.warn("[signup] student ID not saved", e instanceof Error ? e.message : "unknown");
      }
    }
  }
  // New students start on their profile (CV and paths); new businesses on their business details.
  redirect(user.role === "student" ? "/student/profile" : user.role === "business" ? "/business/onboarding" : homeFor(user.role as "admin"));
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
    redirect("/student/profile");
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

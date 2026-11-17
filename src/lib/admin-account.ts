import "server-only";
import { env, hasSupabaseAdmin } from "./env";
import { adminClient } from "./supabase";
import { one, q } from "./db";

export const isAdminEmail = (email: string) => Boolean(env.adminEmail) && email.trim().toLowerCase() === env.adminEmail;

let pending: Promise<void> | null = null;

/**
 * Creates or updates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD (env only, never in code or seed data).
 * Runs once per server instance, on the first sign-in attempt or admin page load. No email is sent.
 */
export function ensureAdmin(): Promise<void> {
  if (!env.adminEmail || !env.adminPassword || !hasSupabaseAdmin()) return Promise.resolve();
  pending ??= (async () => {
    const admin = adminClient().auth.admin;
    const created = await admin.createUser({ email: env.adminEmail, password: env.adminPassword, email_confirm: true });
    if (created.error) {
      // Already exists: make sure the password matches the environment.
      for (let page = 1; page <= 20; page++) {
        const { data, error } = await admin.listUsers({ page, perPage: 200 });
        if (error || !data.users.length) break;
        const found = data.users.find((u) => u.email?.toLowerCase() === env.adminEmail);
        if (found) { await admin.updateUserById(found.id, { password: env.adminPassword, email_confirm: true }); break; }
      }
    }
    const row = await one(`select id from users where email = $1`, [env.adminEmail]);
    if (row) await q(`update users set role = 'admin', name = coalesce(name, 'Kadam admin') where id = $1`, [row.id]);
    else await q(`insert into users (email, role, name, consent_at) values ($1, 'admin', 'Kadam admin', now())`, [env.adminEmail]);
  })().catch((e) => {
    console.warn("[admin] setup failed", e instanceof Error ? e.message : "unknown");
    pending = null;
  });
  return pending;
}

import "server-only";
import { one, q, type Row } from "./db";
import { hasSupabaseAdmin } from "./env";
import { adminClient } from "./supabase";

/**
 * True when Supabase Auth has this email but no password (accounts made with an email link
 * before Kadam switched to passwords). Reads Supabase's own auth.users table through the
 * server's database connection. Anything that can't read `auth` (local PGlite) returns false,
 * so the normal sign-in flow runs.
 */
export async function hasNoPassword(email: string): Promise<boolean> {
  try {
    const row = await one(`select encrypted_password from auth.users where lower(email) = lower($1) limit 1`, [email]);
    if (!row) return false;
    const p = row.encrypted_password;
    return p == null || p === "";
  } catch {
    return false;
  }
}

/** Supabase Auth user id for an email, or null. */
export async function findAuthUserId(email: string): Promise<string | null> {
  try {
    const row = await one(`select id from auth.users where lower(email) = lower($1) limit 1`, [email]);
    if (row?.id) return String(row.id);
  } catch {
    /* fall through to the admin API */
  }
  if (!hasSupabaseAdmin()) return null;
  const admin = adminClient().auth.admin;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) break;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found.id;
  }
  return null;
}

/** Sets a password with the service key. No email is sent. */
export async function setAuthPassword(id: string, password: string): Promise<boolean> {
  if (!hasSupabaseAdmin()) return false;
  const { error } = await adminClient().auth.admin.updateUserById(id, { password, email_confirm: true });
  if (error) console.warn("[auth] password update failed", error.status);
  return !error;
}

/** Accounts that still have no password, for the admin "Sign-in help" panel. */
export async function accountsWithoutPassword(): Promise<Row[]> {
  try {
    return await q(
      `select a.email, a.created_at, u.name, u.role
         from auth.users a left join users u on lower(u.email) = lower(a.email)
        where coalesce(a.encrypted_password, '') = ''
        order by a.created_at desc limit 200`,
    );
  } catch {
    return [];
  }
}

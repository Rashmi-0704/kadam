/**
 * Pure logic for "Set your password" (accounts made with an email link before passwords existed).
 * No imports from the app, so scripts/test-first-password.ts can run it with mocks.
 */
export type FirstPasswordDeps = {
  hasNoPassword: (email: string) => Promise<boolean>;
  findAuthUserId: (email: string) => Promise<string | null>;
  setPassword: (id: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  markSet: (email: string) => Promise<void>;
  log: (msg: string, email: string) => void;
};

export type FirstPasswordResult =
  | { ok: true }
  | { ok: false; error: "err.email_invalid" | "err.password_short" | "err.password_mismatch" | "err.password_already_set" | "err.auth_unavailable" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function setFirstPasswordCore(
  deps: FirstPasswordDeps,
  input: { email: string; password: string; confirm: string },
): Promise<FirstPasswordResult> {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, error: "err.email_invalid" };
  if (input.password.length < 8 || input.password.length > 72) return { ok: false, error: "err.password_short" };
  if (input.password !== input.confirm) return { ok: false, error: "err.password_mismatch" };
  // Never trust the browser: re-check on the server every time.
  if (!(await deps.hasNoPassword(email))) return { ok: false, error: "err.password_already_set" };
  const id = await deps.findAuthUserId(email);
  if (!id) return { ok: false, error: "err.auth_unavailable" };
  if (!(await deps.setPassword(id, input.password))) return { ok: false, error: "err.auth_unavailable" };
  if (!(await deps.signIn(email, input.password))) return { ok: false, error: "err.auth_unavailable" };
  await deps.markSet(email);
  deps.log("[auth] first password set", email);
  return { ok: true };
}

// Run with: node scripts/test-first-password.ts
// Checks the "Set your password" logic with mocked Supabase calls (no network, no keys).
import { setFirstPasswordCore, type FirstPasswordDeps } from "../src/lib/first-password.ts";

let failed = 0;
const check = (name: string, ok: boolean) => { console.log(`${ok ? "✓" : "✗"} ${name}`); if (!ok) failed++; };

function world(noPassword: boolean) {
  const state = { noPassword, password: "", calls: [] as string[], logs: [] as string[] };
  const deps: FirstPasswordDeps = {
    hasNoPassword: async () => state.noPassword,
    findAuthUserId: async (e) => (e === "old@shop.in" ? "uid-1" : null),
    setPassword: async (id, p) => { state.calls.push(`set:${id}`); state.password = p; state.noPassword = false; return true; },
    signIn: async (_e, p) => p === state.password,
    markSet: async (e) => void state.calls.push(`mark:${e}`),
    log: (m, e) => void state.logs.push(`${m} ${e}`),
  };
  return { state, deps };
}

const a = world(true);
let r = await setFirstPasswordCore(a.deps, { email: " Old@Shop.in ", password: "newpass123", confirm: "newpass123" });
check("old account sets its password and signs in", r.ok === true);
check("password set on the right auth user", a.state.calls.includes("set:uid-1"));
check("password_set_at recorded", a.state.calls.includes("mark:old@shop.in"));
check("log has the email and never the password", a.state.logs.length === 1 && a.state.logs[0].includes("old@shop.in") && !a.state.logs[0].includes("newpass123"));
r = await setFirstPasswordCore(a.deps, { email: "old@shop.in", password: "another123", confirm: "another123" });
check("second attempt is refused (works only once)", !r.ok && r.error === "err.password_already_set");

const b = world(false);
r = await setFirstPasswordCore(b.deps, { email: "new@shop.in", password: "newpass123", confirm: "newpass123" });
check("account with a password is refused", !r.ok && r.error === "err.password_already_set" && b.state.calls.length === 0);

const c = world(true);
r = await setFirstPasswordCore(c.deps, { email: "old@shop.in", password: "newpass123", confirm: "newpass124" });
check("mismatched passwords are refused before any call", !r.ok && r.error === "err.password_mismatch" && c.state.calls.length === 0);
r = await setFirstPasswordCore(c.deps, { email: "old@shop.in", password: "short", confirm: "short" });
check("short password refused", !r.ok && r.error === "err.password_short");
r = await setFirstPasswordCore(c.deps, { email: "not-an-email", password: "newpass123", confirm: "newpass123" });
check("bad email refused", !r.ok && r.error === "err.email_invalid");

process.exit(failed ? 1 : 0);

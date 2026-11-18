import { q } from "@/lib/db";
import { accountsWithoutPassword } from "@/lib/legacy-auth";
import { isAdminEmail } from "@/lib/admin-account";
import { Section } from "@/components/ui";
import { ResetPasswordForm } from "./ResetPasswordForm";

const day = (d: unknown) => new Date(String(d)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** Admin backup for people locked out of sign-in. English only. */
export async function SignInHelp({ search }: { search?: string }) {
  const old = (await accountsWithoutPassword()).filter((a) => a.role !== "admin" && !isAdminEmail(String(a.email)));
  const term = (search ?? "").trim().toLowerCase().slice(0, 80);
  const found = term
    ? await q(`select name, email, role, created_at from users where lower(email) like $1 and coalesce(role, '') <> 'admin' order by created_at desc limit 10`, [`%${term.replace(/[%_]/g, "")}%`])
    : [];
  return (
    <Section title="Sign-in help">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-3 p-5">
          <h3 className="text-lg font-bold">Old accounts ({old.length})</h3>
          <p className="text-sm text-ink-2">These joined with an email link and have no password yet. They can set one themselves on the sign-in page, or you can reset it here.</p>
          {old.length === 0 ? (
            <p className="rounded-xl bg-mist p-3 text-sm text-ink-2">Every account has a password.</p>
          ) : (
            <ul className="divide-y divide-line">
              {old.map((a) => (
                <li key={String(a.email)} className="space-y-2 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold">{a.name ?? "No name yet"} <span className="text-sm font-normal text-ink-3">· {a.role ?? "no role"}</span></p>
                      <p className="truncate text-sm text-ink-2">{String(a.email)}</p>
                      <p className="text-xs text-ink-3">Joined {day(a.created_at)}</p>
                    </div>
                    <span className="chip border-highlight/40 bg-highlight-soft text-highlight-deep">No password yet</span>
                  </div>
                  <ResetPasswordForm email={String(a.email)} compact />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card space-y-3 p-5">
          <h3 className="text-lg font-bold">Reset a password</h3>
          <p className="text-sm text-ink-2">Find any non-admin account by email, set a temporary password, then tell the owner by phone or WhatsApp. The admin account can only be changed with ADMIN_EMAIL / ADMIN_PASSWORD.</p>
          <form method="get" className="flex gap-2">
            <label className="sr-only" htmlFor="user-search">Search by email</label>
            <input id="user-search" name="user" defaultValue={term} placeholder="Search by email" className="input min-h-11 flex-1 py-2 text-sm" />
            <button className="btn-secondary min-h-11 px-4 text-sm">Search</button>
          </form>
          {term && found.length === 0 && <p className="text-sm text-ink-2">No account matches “{term}”.</p>}
          {found.length > 0 && (
            <ul className="divide-y divide-line">
              {found.map((u) => (
                <li key={String(u.email)} className="space-y-2 py-3">
                  <p className="font-semibold">{u.name ?? "No name yet"} <span className="text-sm font-normal text-ink-3">· {u.role ?? "no role"}</span></p>
                  <p className="truncate text-sm text-ink-2">{String(u.email)}</p>
                  <ResetPasswordForm email={String(u.email)} compact />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Section>
  );
}

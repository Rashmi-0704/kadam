"use client";
import { useActionState, useState } from "react";
import { sendOtp, verifyOtp, chooseRole, type AuthState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { useT } from "@/lib/i18n/client";

type Role = "student" | "business";

const ICON: Record<Role, React.ReactNode> = {
  student: <><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></>,
  business: <><path d="M3 9h18l-1.5-5h-15L3 9Z" /><path d="M4 9v11h16V9" /><path d="M10 20v-6h4v6" /></>,
};

function RolePicker({ onPick }: { onPick: (r: Role) => void }) {
  const t = useT();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("auth.who_title")}</h1>
        <p className="mt-1 text-ink-2">{t("auth.who_sub")}</p>
      </div>
      <div className="grid gap-3">
        {(["student", "business"] as const).map((r) => (
          <button key={r} type="button" onClick={() => onPick(r)} className="group flex items-center gap-4 rounded-2xl border-2 border-line bg-card p-4 text-left transition hover:border-ink hover:bg-sand">
            <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${r === "student" ? "bg-saffron text-ink" : "bg-ink text-paper"}`}>
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON[r]}</svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold">{t(`auth.role_${r}`)}</span>
              <span className="text-sm text-ink-2">{t(`auth.role_${r}_sub`)}</span>
            </span>
            <span aria-hidden="true" className="text-xl text-ink-3 transition group-hover:translate-x-1 group-hover:text-ink">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RoleBadge({ role, onChange }: { role: Role; onChange: () => void }) {
  const t = useT();
  return (
    <div className="mb-5 flex items-center justify-between gap-2 rounded-xl bg-sand px-3 py-2">
      <span className="inline-flex items-center gap-2 text-sm font-semibold">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON[role]}</svg>
        {t(`auth.role_${role}`)}
      </span>
      <button type="button" onClick={onChange} className="text-sm font-semibold text-ink-2 underline underline-offset-2">{t("auth.change")}</button>
    </div>
  );
}

export function AuthFlow({ initialStep, defaultRole }: { initialStep: "email" | "role"; defaultRole?: Role }) {
  const t = useT();
  const [sendState, sendAction] = useActionState<AuthState, FormData>(sendOtp, {});
  const [verifyState, verifyAction] = useActionState<AuthState, FormData>(verifyOtp, {});
  const [roleState, roleAction] = useActionState<AuthState, FormData>(chooseRole, {});
  const [editingEmail, setEditingEmail] = useState(false);
  const [role, setRole] = useState<Role | undefined>(defaultRole);

  const signedIn = initialStep === "role" || verifyState.step === "role";
  const step: "email" | "code" | "details" = signedIn ? "details" : sendState.step === "code" && !editingEmail ? "code" : "email";
  const email = verifyState.email ?? sendState.email ?? "";

  // Step 1 is always "who are you?" until a role is picked.
  if (!role) return <RolePicker onPick={(r) => { setRole(r); if (r === "student") document.cookie = "kadam_audience=student; path=/; max-age=15552000"; else document.cookie = "kadam_audience=business; path=/; max-age=15552000"; }} />;

  if (step === "details")
    return (
      <form action={roleAction} className="space-y-5">
        <RoleBadge role={role} onChange={() => setRole(undefined)} />
        <input type="hidden" name="role" value={role} />
        <div>
          <h1 className="text-2xl font-bold">{t("auth.almost")}</h1>
          <p className="mt-1 text-ink-2">{t("auth.almost_sub")}</p>
        </div>
        <div>
          <label className="label" htmlFor="name">{role === "business" ? t("auth.your_name_owner") : t("auth.your_name")}</label>
          <input id="name" name="name" className="input" autoComplete="name" required minLength={2} autoFocus />
        </div>
        <label className="flex items-start gap-3 text-sm text-ink-2">
          <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0 accent-[#1c1a27]" required />
          <span>{t("auth.consent")}</span>
        </label>
        {roleState.error && <p className="text-sm font-semibold text-clay" role="alert">{t(roleState.error)}</p>}
        <SubmitButton className="btn-primary w-full">{t("common.continue")}</SubmitButton>
      </form>
    );

  if (step === "code")
    return (
      <form action={verifyAction} className="space-y-5">
        <RoleBadge role={role} onChange={() => setRole(undefined)} />
        <div>
          <h1 className="text-2xl font-bold">{t("auth.code_title")}</h1>
          <p className="mt-1 text-ink-2">{t("auth.code_sent", { email })}</p>
        </div>
        <input type="hidden" name="email" value={email} />
        <div>
          <label className="label" htmlFor="code">{t("auth.code_label")}</label>
          <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={6} required
            className="input text-center font-display text-3xl font-bold tracking-[0.5em]" placeholder="••••••" autoFocus />
        </div>
        {verifyState.error && <p className="text-sm font-semibold text-clay" role="alert">{t(verifyState.error)}</p>}
        <SubmitButton className="btn-primary w-full" pendingLabel={t("auth.checking")}>{t("auth.verify")}</SubmitButton>
        <button type="button" className="btn-ghost w-full" onClick={() => setEditingEmail(true)}>{t("auth.change_email")}</button>
      </form>
    );

  return (
    <form action={(fd) => { setEditingEmail(false); sendAction(fd); }} className="space-y-5">
      <RoleBadge role={role} onChange={() => setRole(undefined)} />
      <div>
        <h1 className="text-2xl font-bold">{t("auth.title")}</h1>
        <p className="mt-1 text-ink-2">{t("auth.sub")}</p>
      </div>
      <div>
        <label className="label" htmlFor="email">{t("auth.email")}</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required className="input" defaultValue={email} placeholder={role === "student" ? "name@college.ac.in" : "name@gmail.com"} autoFocus />
        {role === "student" && <p className="mt-2 text-xs text-ink-3">{t("auth.email_hint")}</p>}
      </div>
      {sendState.error && <p className="text-sm font-semibold text-clay" role="alert">{t(sendState.error)}</p>}
      <SubmitButton className="btn-primary w-full" pendingLabel={t("auth.sending")}>{t("auth.send_code")}</SubmitButton>
    </form>
  );
}

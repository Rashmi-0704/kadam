"use client";
import { useActionState, useState } from "react";
import { signIn, signUp, chooseRole, type AuthState } from "@/app/actions/auth";
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
          <button key={r} type="button" onClick={() => onPick(r)} className="group flex items-center gap-4 rounded-2xl border-2 border-line bg-card p-4 text-left transition hover:border-ink hover:bg-mist">
            <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${r === "student" ? "bg-primary text-white" : "bg-highlight-soft text-highlight-deep"}`}>
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
    <div className="mb-5 flex items-center justify-between gap-2 rounded-xl bg-mist px-3 py-2">
      <span className="inline-flex items-center gap-2 text-sm font-semibold">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON[role]}</svg>
        {t(`auth.role_${role}`)}
      </span>
      <button type="button" onClick={onChange} className="text-sm font-semibold text-ink-2 underline underline-offset-2">{t("auth.change")}</button>
    </div>
  );
}

export function AuthFlow({ initialStep, defaultRole, demo = false }: { initialStep: "email" | "role"; defaultRole?: Role; demo?: boolean }) {
  const t = useT();
  const [inState, inAction] = useActionState<AuthState, FormData>(signIn, {});
  const [upState, upAction] = useActionState<AuthState, FormData>(signUp, {});
  const [roleState, roleAction] = useActionState<AuthState, FormData>(chooseRole, {});
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [role, setRole] = useState<Role | undefined>(defaultRole);
  const [show, setShow] = useState(false);

  const signedIn = initialStep === "role" || inState.step === "role" || upState.step === "role";
  const state = mode === "signin" ? inState : upState;
  // "That email already has an account" switches to sign-in with the email kept.
  const email = state.email ?? (mode === "signin" ? upState.email : inState.email) ?? "";

  // Step 1 is always "who are you?" until a role is picked.
  if (!role) return <RolePicker onPick={(r) => { setRole(r); document.cookie = `kadam_audience=${r}; path=/; max-age=15552000`; }} />;

  if (signedIn)
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
          <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0 accent-primary" required />
          <span>{t("auth.consent")}</span>
        </label>
        {roleState.error && <p className="text-sm font-semibold text-alert" role="alert">{t(roleState.error)}</p>}
        <SubmitButton className="btn-primary w-full">{t("common.continue")}</SubmitButton>
      </form>
    );

  const switchTo = (m: "signin" | "signup") => setMode(m);
  return (
    <form key={mode} action={mode === "signin" ? inAction : upAction} className="space-y-5">
      <RoleBadge role={role} onChange={() => setRole(undefined)} />
      <div role="tablist" aria-label={t("auth.title")} className="grid grid-cols-2 gap-1 rounded-2xl bg-mist p-1">
        {(["signup", "signin"] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => switchTo(m)}
            className={`min-h-11 rounded-xl text-sm font-bold transition ${mode === m ? "bg-card text-primary-deep shadow-[0_2px_0_var(--color-line-deep)]" : "text-ink-2 hover:text-ink"}`}>
            {t(m === "signup" ? "auth.tab_signup" : "auth.tab_signin")}
          </button>
        ))}
      </div>
      <div>
        <h1 className="text-2xl font-bold">{t(mode === "signup" ? "auth.signup_title" : "auth.signin_title")}</h1>
        <p className="mt-1 text-ink-2">{t(mode === "signup" ? "auth.signup_sub" : "auth.signin_sub")}</p>
      </div>
      <div>
        <label className="label" htmlFor="email">{t("auth.email")}</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required className="input" defaultValue={email} placeholder={role === "student" ? "name@college.ac.in" : "name@gmail.com"} autoFocus />
      </div>
      <div>
        <label className="label" htmlFor="password">{t("auth.password")}</label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} required minLength={mode === "signup" ? 8 : 1}
            autoComplete={mode === "signup" ? "new-password" : "current-password"} className="input pr-20" />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-2 my-auto h-9 rounded-lg px-3 text-sm font-semibold text-primary-deep hover:bg-primary-soft">
            {t(show ? "auth.hide" : "auth.show")}
          </button>
        </div>
        {mode === "signup" && <p className="mt-2 text-xs text-ink-3">{t("auth.password_hint")}</p>}
      </div>
      {state.error && (
        <div className="rounded-xl border-2 border-alert/30 bg-alert-soft p-3 text-sm font-semibold text-alert" role="alert">
          {t(state.error)}
          {state.error === "err.account_exists" && (
            <button type="button" onClick={() => switchTo("signin")} className="mt-2 block font-bold text-primary-deep underline underline-offset-2">{t("auth.tab_signin")} →</button>
          )}
        </div>
      )}
      {demo && (state.error === "err.auth_unavailable" || state.error === "err.auth_busy") && (
        <a href="/demo" className="btn-secondary w-full">{t("auth.try_demo")}</a>
      )}
      <SubmitButton className="btn-primary w-full" pendingLabel={t("auth.checking")}>{t(mode === "signup" ? "auth.create" : "auth.signin_btn")}</SubmitButton>
    </form>
  );
}

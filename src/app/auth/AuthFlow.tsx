"use client";
import { useActionState, useState } from "react";
import { sendOtp, verifyOtp, chooseRole, type AuthState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { useT } from "@/lib/i18n/client";

export function AuthFlow({ initialStep, defaultRole }: { initialStep: "email" | "role"; defaultRole?: "student" | "business" }) {
  const t = useT();
  const [sendState, sendAction] = useActionState<AuthState, FormData>(sendOtp, {});
  const [verifyState, verifyAction] = useActionState<AuthState, FormData>(verifyOtp, {});
  const [roleState, roleAction] = useActionState<AuthState, FormData>(chooseRole, {});
  const [editingEmail, setEditingEmail] = useState(false);
  const [role, setRole] = useState<"student" | "business" | undefined>(defaultRole);

  const step: "email" | "code" | "role" =
    initialStep === "role" || verifyState.step === "role" ? "role" : sendState.step === "code" && !editingEmail ? "code" : "email";
  const email = verifyState.email ?? sendState.email ?? "";

  if (step === "role")
    return (
      <form action={roleAction} className="space-y-5">
        <div>
          <p className="eyebrow mb-1">{t("auth.step3")}</p>
          <h1 className="text-2xl font-bold">{t("auth.role_title")}</h1>
        </div>
        <fieldset className="grid gap-3">
          <legend className="sr-only">{t("auth.role_title")}</legend>
          {(["student", "business"] as const).map((r) => (
            <label key={r} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${role === r ? "border-ink bg-sand" : "border-line bg-card"}`}>
              <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="mt-1 h-5 w-5 accent-[#1c1a27]" />
              <span>
                <span className="block font-bold">{t(`auth.role_${r}`)}</span>
                <span className="text-sm text-ink-2">{t(`auth.role_${r}_sub`)}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <div>
          <label className="label" htmlFor="name">{role === "business" ? t("auth.your_name_owner") : t("auth.your_name")}</label>
          <input id="name" name="name" className="input" autoComplete="name" required minLength={2} />
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
        <div>
          <p className="eyebrow mb-1">{t("auth.step2")}</p>
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
      <div>
        <p className="eyebrow mb-1">{t("auth.step1")}</p>
        <h1 className="text-2xl font-bold">{t("auth.title")}</h1>
        <p className="mt-1 text-ink-2">{t("auth.sub")}</p>
      </div>
      <div>
        <label className="label" htmlFor="email">{t("auth.email")}</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required className="input" defaultValue={email} placeholder="name@college.ac.in" />
        <p className="mt-2 text-xs text-ink-3">{t("auth.email_hint")}</p>
      </div>
      {sendState.error && <p className="text-sm font-semibold text-clay" role="alert">{t(sendState.error)}</p>}
      <SubmitButton className="btn-primary w-full" pendingLabel={t("auth.sending")}>{t("auth.send_code")}</SubmitButton>
    </form>
  );
}

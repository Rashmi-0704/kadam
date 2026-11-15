"use client";
import { useActionState, useState } from "react";
import { saveStudentDetails, sendCollegeOtp, verifyCollegeOtp, uploadStudentId, type FormState } from "@/app/actions/student";
import { SubmitButton } from "@/components/SubmitButton";
import { FileUploader } from "@/components/FileUploader";
import { useT } from "@/lib/i18n/client";

export function DetailsForm({ initial }: { initial: { name: string; college: string; course: string; year: string } }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(saveStudentDetails, {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">{t("so.name")}</label>
        <input id="name" name="name" className="input" defaultValue={initial.name} required />
      </div>
      <div>
        <label className="label" htmlFor="college">{t("so.college")}</label>
        <input id="college" name="college" className="input" defaultValue={initial.college} required placeholder={t("so.college_ph")} />
      </div>
      <div className="grid grid-cols-[1fr_8.5rem] gap-3">
        <div>
          <label className="label" htmlFor="course">{t("so.course")}</label>
          <input id="course" name="course" className="input" defaultValue={initial.course} required placeholder={t("so.course_ph")} />
        </div>
        <div>
          <label className="label" htmlFor="year">{t("so.year")}</label>
          <select id="year" name="year" className="input" defaultValue={initial.year} required>
            <option value="" disabled>—</option>
            {["1st year", "2nd year", "3rd year", "4th year", "5th year", "Postgraduate"].map((y) => <option key={y} value={y}>{t(`year.${y.split(" ")[0].toLowerCase()}`)}</option>)}
          </select>
        </div>
      </div>
      {state.error && <p className="text-sm font-semibold text-clay" role="alert">{t(state.error)}</p>}
      {state.ok && <p className="text-sm font-semibold text-leaf" role="status">{t("so.saved")}</p>}
      <SubmitButton className="btn-primary w-full">{t("common.save")}</SubmitButton>
    </form>
  );
}

export function VerifyPanel() {
  const t = useT();
  const [method, setMethod] = useState<"email" | "id">("email");
  const [sendState, sendAction] = useActionState<FormState, FormData>(sendCollegeOtp, {});
  const [verifyState, verifyAction] = useActionState<FormState, FormData>(verifyCollegeOtp, {});
  const [idState, idAction] = useActionState<FormState, FormData>(uploadStudentId, {});
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2" role="tablist">
        {(["email", "id"] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={method === m} onClick={() => setMethod(m)}
            className={`min-h-12 rounded-xl border-2 px-3 text-sm font-semibold ${method === m ? "border-ink bg-sand" : "border-line bg-card text-ink-2"}`}>
            {t(`verify.tab_${m}`)}
          </button>
        ))}
      </div>
      {method === "email" ? (
        sendState.step === "code" ? (
          <form action={verifyAction} className="space-y-3">
            <input type="hidden" name="college_email" value={sendState.email} />
            <div className="rounded-2xl bg-saffron-soft p-4">
              <p className="font-semibold">{t("auth.code_sent", { email: sendState.email ?? "" })}</p>
              <p className="mt-1 text-sm">{t("verify.link_tap")}</p>
            </div>
            <details className="rounded-xl border border-line p-3" open={Boolean(verifyState.error)}>
              <summary className="cursor-pointer text-sm font-semibold text-ink-2">{t("auth.have_code")}</summary>
              <div className="mt-3 space-y-3">
                <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="input text-center font-display text-2xl font-bold tracking-[0.4em]" placeholder="••••••" aria-label={t("auth.code_label")} />
                {verifyState.error && <p className="text-sm font-semibold text-clay" role="alert">{t(verifyState.error)}</p>}
                <SubmitButton className="btn-primary w-full" pendingLabel={t("auth.checking")}>{t("auth.verify")}</SubmitButton>
              </div>
            </details>
          </form>
        ) : (
          <form action={sendAction} className="space-y-3">
            <label className="label" htmlFor="college_email">{t("verify.college_email")}</label>
            <input id="college_email" name="college_email" type="email" className="input" required placeholder="name@college.ac.in" defaultValue={sendState.email} />
            <p className="text-xs text-ink-3">{t("verify.college_email_hint")}</p>
            {sendState.error && <p className="text-sm font-semibold text-clay" role="alert">{t(sendState.error)}</p>}
            <SubmitButton className="btn-primary w-full" pendingLabel={t("auth.sending")}>{t("auth.send_code")}</SubmitButton>
          </form>
        )
      ) : (
        <form action={idAction} className="space-y-3">
          <p className="text-sm text-ink-2">{t("verify.id_help")}</p>
          <FileUploader name="id_file" accept="image/*,.pdf" label={t("verify.id_label")} required />
          {idState.error && <p className="text-sm font-semibold text-clay" role="alert">{t(idState.error)}</p>}
          <SubmitButton className="btn-primary w-full" pendingLabel={t("common.saving")}>{t("verify.id_submit")}</SubmitButton>
        </form>
      )}
    </div>
  );
}

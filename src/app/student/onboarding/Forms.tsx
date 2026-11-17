"use client";
import { useActionState, useState } from "react";
import { saveStudentDetails, saveCollegeEmail, uploadStudentId, type FormState } from "@/app/actions/student";
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
      {state.error && <p className="text-sm font-semibold text-alert" role="alert">{t(state.error)}</p>}
      {state.ok && <p className="text-sm font-semibold text-success-ink" role="status">{t("so.saved")}</p>}
      <SubmitButton className="btn-primary w-full">{t("common.save")}</SubmitButton>
    </form>
  );
}

export function VerifyPanel() {
  const t = useT();
  const [method, setMethod] = useState<"email" | "id">("email");
  const [sendState, sendAction] = useActionState<FormState, FormData>(saveCollegeEmail, {});
  const [idState, idAction] = useActionState<FormState, FormData>(uploadStudentId, {});
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2" role="tablist">
        {(["email", "id"] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={method === m} onClick={() => setMethod(m)}
            className={`min-h-12 rounded-xl border-2 px-3 text-sm font-semibold ${method === m ? "border-primary bg-primary-soft text-primary-deep" : "border-line bg-card text-ink-2"}`}>
            {t(`verify.tab_${m}`)}
          </button>
        ))}
      </div>
      {method === "email" ? (
          <form action={sendAction} className="space-y-3">
            <label className="label" htmlFor="college_email">{t("verify.college_email")}</label>
            <input id="college_email" name="college_email" type="email" className="input" required placeholder="name@college.ac.in" defaultValue={sendState.email} />
            <p className="text-xs text-ink-3">{t("verify.college_email_hint")}</p>
            {sendState.error && <p className="text-sm font-semibold text-alert" role="alert">{t(sendState.error)}</p>}
            <SubmitButton className="btn-primary w-full" pendingLabel={t("common.saving")}>{t("verify.email_submit")}</SubmitButton>
          </form>
      ) : (
        <form action={idAction} className="space-y-3">
          <p className="text-sm text-ink-2">{t("verify.id_help")}</p>
          <FileUploader name="id_file" accept="image/*,.pdf" label={t("verify.id_label")} required />
          {idState.error && <p className="text-sm font-semibold text-alert" role="alert">{t(idState.error)}</p>}
          <SubmitButton className="btn-primary w-full" pendingLabel={t("common.saving")}>{t("verify.id_submit")}</SubmitButton>
        </form>
      )}
    </div>
  );
}

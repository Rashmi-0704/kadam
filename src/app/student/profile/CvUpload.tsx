"use client";
import { useActionState, useState } from "react";
import { uploadCv, type FormState } from "@/app/actions/student";
import { SubmitButton } from "@/components/SubmitButton";
import { FileUploader } from "@/components/FileUploader";
import { useT } from "@/lib/i18n/client";

export function CvUpload() {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(uploadCv, {});
  const [paste, setPaste] = useState(false);
  return (
    <form action={action} className="space-y-4">
      <div className="card space-y-4 p-5">
        <FileUploader name="cv" accept=".pdf,.png,.jpg,.jpeg,.txt" label={t("profile.cv_label")} />
        {paste ? (
          <div>
            <label className="label" htmlFor="cv_text">{t("profile.paste_label")}</label>
            <textarea id="cv_text" name="cv_text" rows={8} className="input" placeholder={t("profile.paste_ph")} />
          </div>
        ) : (
          <button type="button" className="text-sm font-semibold text-ink-2 underline underline-offset-2" onClick={() => setPaste(true)}>{t("profile.paste_instead")}</button>
        )}
      </div>
      {state.error && <p className="text-sm font-semibold text-alert" role="alert">{t(state.error)}</p>}
      <SubmitButton className="btn-primary w-full" pendingLabel={t("profile.reading")}>{t("profile.cv_continue")}</SubmitButton>
      <p className="text-center text-sm text-ink-3">{t("profile.cv_privacy")}</p>
    </form>
  );
}

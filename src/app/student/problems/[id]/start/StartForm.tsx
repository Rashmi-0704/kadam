"use client";
import { useActionState, useState } from "react";
import { takeUpWithDetails, type FormState } from "@/app/actions/student";
import { SubmitButton } from "@/components/SubmitButton";
import { FileUploader } from "@/components/FileUploader";
import { useT } from "@/lib/i18n/client";

const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "5th year", "Postgraduate"];

/** One card: CV (if there isn't one yet) and college details, then one button. English only (student screen). */
export function StartForm({ problemId, title, business, hasCv, details }: { problemId: string; title: string; business: string; hasCv: boolean; details: { college: string; course: string; year: string } }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(takeUpWithDetails, {});
  const [paste, setPaste] = useState(false);
  return (
    <form action={action} className="card space-y-5 p-6 sm:p-8">
      <input type="hidden" name="problemId" value={problemId} />
      <div>
        <p className="text-sm font-semibold text-ink-3">{business}</p>
        <p className="mt-1 font-bold">{title}</p>
      </div>
      <div>
        <h1 className="text-[26px] leading-tight font-bold">A few details before you start</h1>
        <p className="mt-1 text-ink-2">So {business} knows who is working on it. Fill in what you have and take it up.</p>
      </div>
      {!hasCv && (
        <div className="space-y-2">
          <span className="label">Your CV</span>
          <FileUploader name="cv" accept=".pdf,.png,.jpg,.jpeg,.txt" label={t("profile.cv_label")} />
          {paste ? (
            <textarea name="cv_text" rows={5} className="input" aria-label={t("profile.paste_label")} placeholder={t("profile.paste_ph")} />
          ) : (
            <button type="button" className="text-sm font-semibold text-ink-2 underline underline-offset-2" onClick={() => setPaste(true)}>{t("profile.paste_instead")}</button>
          )}
          <p className="text-xs text-ink-3">No CV yet? Take it up now and add one later from your profile.</p>
        </div>
      )}
      <div>
        <label className="label" htmlFor="st-college">College</label>
        <input id="st-college" name="college" className="input" defaultValue={details.college} maxLength={160} placeholder="e.g. Utkal University, Bhubaneswar" />
      </div>
      <div className="grid grid-cols-[1fr_9rem] gap-3">
        <div>
          <label className="label" htmlFor="st-course">Course</label>
          <input id="st-course" name="course" className="input" defaultValue={details.course} maxLength={120} placeholder="e.g. B.Com" />
        </div>
        <div>
          <label className="label" htmlFor="st-year">Year</label>
          <select id="st-year" name="year" className="input" defaultValue={details.year}>
            <option value="">—</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      {state.error && <p className="text-sm font-semibold text-alert" role="alert">{t(state.error)}</p>}
      <SubmitButton className="btn-accent w-full" pendingLabel="Taking it up…">Take up this problem</SubmitButton>
    </form>
  );
}

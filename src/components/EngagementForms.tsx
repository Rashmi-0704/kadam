"use client";
import { useActionState, useState } from "react";
import { submitSolution, withdrawEngagement, confirmReceipt, setEngagementStatus, postImpactUpdate, postFeedback, retryReport, type FormState } from "@/app/actions/engagement";
import { SubmitButton } from "./SubmitButton";
import { FileUploader } from "./FileUploader";
import { useT } from "@/lib/i18n/client";

function Err({ s }: { s: FormState }) {
  const t = useT();
  return s.error ? <p className="text-sm font-semibold text-clay" role="alert">{t(s.error)}</p> : null;
}

export function SubmissionForm({ engagementId, resubmit }: { engagementId: string; resubmit?: boolean }) {
  const t = useT();
  const [s, action] = useActionState<FormState, FormData>(submitSolution, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="engagementId" value={engagementId} />
      <div>
        <label className="label" htmlFor="description">{t("sub.what")}</label>
        <textarea id="description" name="description" rows={5} required minLength={20} className="input" placeholder={t("sub.what_ph")} />
        <p className="mt-1 text-xs text-ink-3">{t("sub.not_only_code")}</p>
      </div>
      <div>
        <label className="label" htmlFor="links">{t("sub.links")}</label>
        <textarea id="links" name="links" rows={2} className="input" placeholder="https://github.com/…  https://figma.com/…" />
      </div>
      <FileUploader name="files" multiple label={t("sub.files")} compact />
      <Err s={s} />
      <SubmitButton className="btn-accent w-full" pendingLabel={t("common.saving")}>{resubmit ? t("sub.resubmit") : t("sub.submit")}</SubmitButton>
    </form>
  );
}

export function WithdrawButton({ engagementId }: { engagementId: string }) {
  const t = useT();
  const [confirm, setConfirm] = useState(false);
  const [s, action] = useActionState<FormState, FormData>(withdrawEngagement, {});
  if (!confirm) return <button type="button" className="btn-ghost btn-sm w-full text-clay" onClick={() => setConfirm(true)}>{t("eng.withdraw")}</button>;
  return (
    <form action={action} className="space-y-2 rounded-xl border border-clay/30 bg-clay-soft p-3">
      <input type="hidden" name="engagementId" value={engagementId} />
      <p className="text-sm font-medium text-clay">{t("eng.withdraw_confirm")}</p>
      <div className="flex gap-2">
        <SubmitButton className="btn-danger btn-sm flex-1">{t("eng.withdraw_yes")}</SubmitButton>
        <button type="button" className="btn-secondary btn-sm flex-1" onClick={() => setConfirm(false)}>{t("common.cancel")}</button>
      </div>
      <Err s={s} />
    </form>
  );
}

export function ConfirmReceiptButton({ engagementId }: { engagementId: string }) {
  const t = useT();
  const [s, action] = useActionState<FormState, FormData>(confirmReceipt, {});
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="engagementId" value={engagementId} />
      <SubmitButton className="btn-accent w-full" pendingLabel={t("common.saving")}>{t("eng.confirm_receipt")}</SubmitButton>
      <Err s={s} />
    </form>
  );
}

const OPTIONS: Record<string, string[]> = { received: ["in_use", "accepted", "needs_changes", "rejected"], accepted: ["in_use", "needs_changes"] };

export function StatusSetter({ engagementId, current }: { engagementId: string; current: string }) {
  const t = useT();
  const [s, action] = useActionState<FormState, FormData>(setEngagementStatus, {});
  const [choice, setChoice] = useState("");
  const opts = OPTIONS[current] ?? [];
  if (!opts.length) return null;
  const needReason = choice === "rejected";
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="engagementId" value={engagementId} />
      <fieldset className="grid gap-2">
        <legend className="label">{t("eng.set_status")}</legend>
        {opts.map((o) => (
          <label key={o} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 ${choice === o ? "border-ink bg-sand" : "border-line bg-card"}`}>
            <input type="radio" name="status" value={o} checked={choice === o} onChange={() => setChoice(o)} className="mt-1 h-4 w-4 accent-ink" required />
            <span>
              <span className="block font-semibold">{t(`status.${o}`)}</span>
              <span className="text-sm text-ink-2">{t(`eng.status_${o}_help`)}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {(needReason || choice === "needs_changes") && (
        <div>
          <label className="label" htmlFor="reason">{needReason ? t("eng.reason_required") : t("eng.what_to_change")}</label>
          <textarea id="reason" name="reason" rows={3} className="input" required={needReason} minLength={needReason ? 10 : undefined} placeholder={needReason ? t("eng.reason_ph") : t("eng.change_ph")} />
        </div>
      )}
      <Err s={s} />
      <SubmitButton className="btn-primary w-full" disabled={!choice} pendingLabel={t("common.saving")}>{t("eng.save_status")}</SubmitButton>
    </form>
  );
}

export function ImpactUpdateForm({ engagementId }: { engagementId: string }) {
  const t = useT();
  const [s, action] = useActionState<FormState, FormData>(postImpactUpdate, {});
  return (
    <form key={s.n} action={action} className="space-y-3">
      <input type="hidden" name="engagementId" value={engagementId} />
      {s.ok && <p className="rounded-xl bg-leaf-soft px-3 py-2 text-sm font-semibold text-leaf" role="status">{t("impact.posted")}</p>}
      <div>
        <label className="label" htmlFor="what_changed">{t("impact.what_changed")}</label>
        <textarea id="what_changed" name="what_changed" rows={2} required className="input" placeholder={t("impact.what_changed_ph")} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {["time_saved", "sales", "costs", "users"].map((k) => (
          <div key={k}>
            <label className="label text-xs" htmlFor={k}>{t(`impact.${k}`)}</label>
            <input id={k} name={k} className="input min-h-11 py-2 text-sm" placeholder={t(`impact.${k}_ph`)} />
          </div>
        ))}
      </div>
      <div>
        <label className="label" htmlFor="comments">{t("impact.comments")}</label>
        <input id="comments" name="comments" className="input" />
      </div>
      <Err s={s} />
      <SubmitButton className="btn-primary w-full" pendingLabel={t("impact.posting")}>{t("impact.post")}</SubmitButton>
    </form>
  );
}

export function FeedbackForm({ engagementId }: { engagementId: string }) {
  const t = useT();
  const [s, action] = useActionState<FormState, FormData>(postFeedback, {});
  return (
    <form key={s.n} action={action} className="space-y-2">
      <input type="hidden" name="engagementId" value={engagementId} />
      {s.ok && <p className="text-sm font-semibold text-leaf" role="status">{t("feedback.sent")}</p>}
      <label className="label" htmlFor="fb">{t("feedback.label")}</label>
      <textarea id="fb" name="text" rows={2} className="input" placeholder={t("feedback.ph")} required />
      <Err s={s} />
      <SubmitButton className="btn-secondary w-full">{t("feedback.send")}</SubmitButton>
    </form>
  );
}

export function RetryReportButton({ engagementId }: { engagementId: string }) {
  const t = useT();
  const [s, action] = useActionState<FormState, FormData>(retryReport, {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="engagementId" value={engagementId} />
      <span className="text-sm text-ink-2">{t("report.retry_msg")}</span>
      <SubmitButton className="btn-secondary btn-sm">{t("common.retry")}</SubmitButton>
      <Err s={s} />
    </form>
  );
}

"use client";
import { useActionState, useState } from "react";
import { saveReview, type FormState } from "@/app/actions/business";
import { SubmitButton } from "@/components/SubmitButton";
import { useT } from "@/lib/i18n/client";
import { SECTORS, PROBLEM_TYPES, DIFFICULTIES, TIME_NEEDED, WORK_MODES, ROLES, roleTitle } from "@/db/taxonomy";

type P = Record<string, string | null> & { id: string; status: string; categories: Record<string, unknown> };

const FIELDS = ["title", "problem", "background", "current_process", "desired_outcome", "constraints", "expected_timeline", "resources_provided"] as const;

export function ReviewForm({ p }: { p: P }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(saveReview, {});
  const c = p.categories as { sector?: string; problem_type?: string; skills?: string[]; difficulty?: string; time_needed?: string; work_mode?: string; city?: string; related_roles?: string[] };
  const [roles, setRoles] = useState<string[]>(c.related_roles ?? []);
  const roleOptions = Array.from(new Set([...(c.related_roles ?? []), ...ROLES.map((r) => r.slug)]));
  const sel = (name: string, values: readonly string[], prefix: string, value?: string) => (
    <div>
      <label className="label" htmlFor={name}>{t(`cat.${name}`)}</label>
      <select id={name} name={name} defaultValue={value} className="input">
        {values.map((v) => <option key={v} value={v}>{t(`${prefix}.${v}`)}</option>)}
      </select>
    </div>
  );
  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="problemId" value={p.id} />
      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="text-lg font-bold">{t("review.statement")}</h2>
        {FIELDS.map((f) => (
          <div key={f}>
            <label className="label" htmlFor={f}>{t(`field.${f}`)}</label>
            {f === "title" || f === "expected_timeline" ? (
              <input id={f} name={f} className="input" defaultValue={p[f] ?? ""} required={f === "title" || f === "expected_timeline"} />
            ) : (
              <textarea id={f} name={f} rows={f === "problem" ? 4 : 3} className="input" defaultValue={p[f] ?? ""} required={f === "problem"} />
            )}
            {f === "expected_timeline" && <p className="mt-1 text-xs text-ink-3">{t("review.timeline_hint")}</p>}
          </div>
        ))}
      </section>

      <section className="card space-y-5 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold">{t("review.categories")}</h2>
          <p className="text-sm text-ink-2">{t("review.categories_sub")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {sel("sector", SECTORS, "sector", c.sector)}
          {sel("problem_type", PROBLEM_TYPES, "ptype", c.problem_type)}
          {sel("difficulty", DIFFICULTIES, "diff", c.difficulty)}
          {sel("time_needed", TIME_NEEDED, "time", c.time_needed)}
          {sel("work_mode", WORK_MODES, "mode", c.work_mode)}
          <div>
            <label className="label" htmlFor="city">{t("cat.city")}</label>
            <input id="city" name="city" className="input" defaultValue={c.city ?? ""} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="skills">{t("cat.skills")}</label>
          <input id="skills" name="skills" className="input" defaultValue={(c.skills ?? []).join(", ")} placeholder="Excel, Canva, SEO" />
          <p className="mt-1 text-xs text-ink-3">{t("review.skills_hint")}</p>
        </div>
        <fieldset>
          <legend className="label">{t("cat.related_roles")}</legend>
          <p className="mb-2 text-xs text-ink-3">{t("review.roles_hint")}</p>
          <div className="flex flex-wrap gap-2">
            {roleOptions.map((r) => {
              const on = roles.includes(r);
              return (
                <label key={r} className={`inline-flex min-h-10 cursor-pointer items-center rounded-full border px-3.5 text-sm font-medium transition ${on ? "border-primary bg-primary text-white" : "border-line bg-card text-ink-2"}`}>
                  <input type="checkbox" name="related_roles" value={r} checked={on} onChange={() => setRoles((x) => (on ? x.filter((y) => y !== r) : [...x, r]))} className="sr-only" />
                  {roleTitle(r)}
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {state.error && <p className="text-sm font-semibold text-alert" role="alert">{t(state.error)}</p>}
      <div className="sticky bottom-20 z-10 flex flex-col gap-2 rounded-2xl border border-line bg-canvas/95 p-3 backdrop-blur sm:flex-row md:bottom-4">
        {p.status === "draft" ? (
          <>
            <SubmitButton className="btn-accent flex-1" name="intent" value="live" pendingLabel={t("common.saving")}>{t("review.go_live")}</SubmitButton>
            <SubmitButton className="btn-secondary" name="intent" value="save">{t("review.save_draft")}</SubmitButton>
          </>
        ) : (
          <SubmitButton className="btn-primary flex-1" name="intent" value="save">{t("review.save_changes")}</SubmitButton>
        )}
      </div>
    </form>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { q, one, type Row } from "@/lib/db";
import { loadEngagement, canSee, reportNeedsRetry } from "@/lib/engagement";
import { fileUrl, type StoredFile } from "@/lib/storage";
import type { User } from "@/lib/session";
import type { T } from "@/lib/i18n/config";
import { fmtDate } from "./ui";
import { RetryReportButton } from "./EngagementForms";

export async function loadWorkspace(id: string, user: User) {
  const e = await loadEngagement(id);
  if (!e || !canSee(user, e)) notFound();
  const sub = await one(`select * from submissions where engagement_id = $1 order by submitted_at desc limit 1`, [id]);
  const subFiles = sub ? await Promise.all((sub.files as StoredFile[]).map(async (f) => ({ name: f.name, url: await fileUrl(f, `eng:${id}`) }))) : [];
  const history = await q(`select status, reason, created_at from status_changes where engagement_id = $1 order by created_at desc`, [id]);
  const updates = await q(`select * from impact_updates where engagement_id = $1 order by created_at desc`, [id]);
  const feedback = await q(`select * from feedback where engagement_id = $1 order by created_at desc`, [id]);
  const report = await one(`select * from impact_reports where engagement_id = $1 order by version desc limit 1`, [id]);
  const retry = await reportNeedsRetry(id);
  return { e, sub, subFiles, history, updates, feedback, report, retry };
}
export type WS = Awaited<ReturnType<typeof loadWorkspace>>;

export function SubmissionView({ sub, files, t, lang }: { sub: Row; files: { name: string; url: string }[]; t: T; lang: string }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-3">
        {t("sub.submitted_on", { date: fmtDate(sub.submitted_at, lang) })}
        {sub.receipt_confirmed_at && <> · <span className="font-semibold text-leaf">{t("sub.received_on", { date: fmtDate(sub.receipt_confirmed_at, lang) })}</span></>}
      </p>
      <p className="whitespace-pre-wrap">{sub.description}</p>
      {(sub.links as string[]).length > 0 && (
        <ul className="space-y-1">
          {(sub.links as string[]).map((l) => (
            <li key={l}><a href={l} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-sm font-semibold text-indigo underline underline-offset-2">{l}</a></li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((f) => <li key={f.url}><a href={f.url} target="_blank" rel="noopener noreferrer" className="chip min-h-9 hover:border-ink">📎 {f.name}</a></li>)}
        </ul>
      )}
    </div>
  );
}

export function ImpactTimeline({ updates, feedback, history, t, lang }: { updates: Row[]; feedback: Row[]; history: Row[]; t: T; lang: string }) {
  const items = [
    ...updates.map((u) => ({ at: u.created_at, kind: "update" as const, u })),
    ...feedback.map((f) => ({ at: f.created_at, kind: "feedback" as const, f })),
    ...history.filter((h) => h.status !== "taken_up").map((h) => ({ at: h.created_at, kind: "status" as const, h })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const LABEL: Record<string, string> = { time_saved: "impact.time_saved", sales: "impact.sales", costs: "impact.costs", users: "impact.users", other: "impact.other" };
  if (!items.length) return <p className="text-sm text-ink-3">{t("impact.none")}</p>;
  return (
    <ol className="relative space-y-4 border-l-2 border-line pl-5">
      {items.map((it, i) => (
        <li key={i} className="relative">
          <span className={`absolute top-1.5 -left-[27px] h-3 w-3 rounded-full border-2 border-card ${it.kind === "update" ? "bg-leaf" : it.kind === "feedback" ? "bg-saffron" : "bg-ink-3"}`} aria-hidden="true" />
          <p className="text-xs text-ink-3">{fmtDate(it.at, lang)}</p>
          {it.kind === "update" && (
            <div className="mt-1 rounded-xl border border-line bg-card p-3">
              <p className="font-semibold">{it.u.what_changed}</p>
              {Object.keys(it.u.metrics ?? {}).length > 0 && (
                <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                  {Object.entries(it.u.metrics as Record<string, string>).map(([k, v]) => (
                    <div key={k}><dt className="inline text-ink-3">{t(LABEL[k] ?? k)}: </dt><dd className="inline font-medium">{v}</dd></div>
                  ))}
                </dl>
              )}
              {it.u.comments && <p className="mt-2 text-sm text-ink-2 italic">“{it.u.comments}”</p>}
            </div>
          )}
          {it.kind === "feedback" && <p className="mt-1 text-sm"><span className="font-semibold">{t("feedback.title")}:</span> “{it.f.text}”</p>}
          {it.kind === "status" && (
            <p className="mt-0.5 text-sm">
              <span className="font-semibold">{t(`status.${it.h.status}`)}</span>
              {it.h.reason && <span className="text-ink-2"> — {it.h.reason}</span>}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

export function ReportTeaser({ ws, t, lang, isStudent }: { ws: WS; t: T; lang: string; isStudent: boolean }) {
  const r = ws.report;
  return (
    <div className="card overflow-hidden">
      <div className="bg-ink px-5 py-4 text-paper">
        <p className="eyebrow text-saffron">{t("report.eyebrow")}</p>
        <p className="mt-1 font-display text-lg font-bold">{r ? t("report.version", { v: r.version, date: fmtDate(r.generated_at, lang) }) : t("report.not_yet")}</p>
      </div>
      <div className="space-y-3 p-5">
        {ws.retry && <RetryReportButton engagementId={ws.e.id} />}
        {r ? (
          <>
            <p className="text-sm text-ink-2">{r.summary}</p>
            {isStudent && (r.resume_bullets as string[]).length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {(r.resume_bullets as string[]).slice(0, 2).map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
            <Link href={`/reports/${r.share_token}`} className="btn-primary w-full" target={isStudent ? undefined : "_blank"}>{t("report.open")}</Link>
            {!isStudent && <p className="text-xs text-ink-3">{t("report.biz_note")}</p>}
          </>
        ) : (
          <p className="text-sm text-ink-2">{isStudent ? t("report.not_yet_student") : t("report.not_yet_business")}</p>
        )}
      </div>
    </div>
  );
}

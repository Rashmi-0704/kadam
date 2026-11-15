import Link from "next/link";
import { requireStudent } from "@/lib/guards";
import { q } from "@/lib/db";
import { getT, getLang } from "@/lib/i18n/server";
import { EmptyState, PageTitle, Section, StatusBadge, fmtDate } from "@/components/ui";
import { roleTitle } from "@/db/taxonomy";
import { progressOf } from "@/lib/roadmaps";
import { InsightTiles, ICONS } from "@/components/InsightTiles";

export const metadata = { title: "Dashboard" };

export default async function StudentDashboard() {
  const { user, profile } = await requireStudent();
  const t = await getT();
  const lang = await getLang();
  const engagements = await q(
    `select e.id, e.status, e.started_at, e.share_token, p.title, b.business_name,
            (select reason from status_changes s where s.engagement_id = e.id and s.status in ('rejected','needs_changes') order by created_at desc limit 1) as reason,
            (select max(version) from impact_reports r where r.engagement_id = e.id) as report_version,
            (select max(generated_at) from impact_reports r where r.engagement_id = e.id) as report_at
       from engagements e join problems p on p.id = e.problem_id join business_profiles b on b.user_id = p.business_id
      where e.student_id = $1 order by (e.status = 'withdrawn'), e.started_at desc`,
    [user.id],
  );
  const progress = await q(`select r.role, r.title, r.steps, rp.statuses
       from roadmap_progress rp join roadmaps r on r.role = rp.role where rp.student_id = $1`, [user.id]);
  const reports = engagements.filter((e) => e.report_version);
  const firstName = user.name?.split(" ")[0] ?? "";

  const nextStep = !profile.cv_parsed
    ? { title: t("sd.next_cv"), body: t("sd.next_cv_body"), href: "/student/profile", cta: t("sd.next_cv_cta") }
    : !profile.approved_at
      ? { title: t("sd.next_paths"), body: t("sd.next_paths_body"), href: "/student/profile", cta: t("common.continue") }
      : engagements.length === 0
        ? { title: t("sd.next_problem"), body: t("sd.next_problem_body"), href: "/student/problems?tab=suggested", cta: t("sd.next_problem_cta") }
        : null;

  return (
    <div>
      <PageTitle eyebrow={t("sd.eyebrow")} title={t("sd.title", { name: firstName })} />
      <InsightTiles
        items={[
          { label: t("ins.taken"), value: engagements.filter((e) => e.status !== "withdrawn").length, tone: "ink", icon: ICONS.briefcase, href: "/student/problems" },
          { label: t("ins.in_use"), value: engagements.filter((e) => ["accepted", "in_use"].includes(e.status)).length, hint: t("ins.in_use_hint"), tone: "leaf", icon: ICONS.check },
          { label: t("ins.reports"), value: reports.length, tone: "saffron", icon: ICONS.report, href: reports[0] ? `/reports/${reports[0].share_token}` : undefined },
          { label: t("ins.topics"), value: progress.reduce((n, r) => n + progressOf(r.steps, r.statuses).done, 0), hint: t("ins.topics_hint"), tone: "indigo", icon: ICONS.steps, href: "/student/roadmaps" },
        ]}
      />

      {nextStep && (
        <div className="card mb-8 flex flex-col gap-4 border-ink bg-ink p-6 text-paper sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-saffron">{t("sd.next")}</p>
            <h2 className="mt-1 text-xl font-bold">{nextStep.title}</h2>
            <p className="mt-1 text-paper/75">{nextStep.body}</p>
          </div>
          <Link href={nextStep.href} className="btn-accent shrink-0">{nextStep.cta}</Link>
        </div>
      )}

      {reports.length > 0 && (
        <Section title={t("sd.reports")}>
          <ul className="grid gap-3 md:grid-cols-2">
            {reports.map((e) => (
              <li key={e.id}>
                <Link href={`/reports/${e.share_token}`} className="card flex h-full flex-col gap-2 border-leaf/30 bg-leaf-soft/40 p-5 hover:border-leaf">
                  <span className="eyebrow text-leaf">{t("report.eyebrow")} · v{e.report_version}</span>
                  <span className="font-bold leading-snug">{e.title}</span>
                  <span className="text-sm text-ink-2">{t("sd.report_updated", { date: fmtDate(e.report_at, lang) })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={t("sd.engagements")} action={<Link href="/student/problems" className="text-sm font-semibold underline underline-offset-2">{t("sd.find_more")}</Link>}>
        {engagements.length === 0 ? (
          <EmptyState title={t("sd.no_engagements")} body={t("sd.no_engagements_body")} action={<Link href="/student/problems" className="btn-primary">{t("sd.browse")}</Link>} />
        ) : (
          <ul className="grid gap-2">
            {engagements.map((e) => (
              <li key={e.id}>
                <Link href={`/student/engagements/${e.id}`} className={`card flex flex-col gap-2 p-4 hover:border-ink-3 ${e.status === "withdrawn" ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block font-bold leading-snug">{e.title}</span>
                      <span className="text-sm text-ink-3">{e.business_name} · {t("bp.started_on", { date: fmtDate(e.started_at, lang) })}</span>
                    </span>
                    <StatusBadge status={e.status} t={t} />
                  </div>
                  {e.reason && ["rejected", "needs_changes"].includes(e.status) && (
                    <p className={`rounded-xl px-3 py-2 text-sm ${e.status === "rejected" ? "bg-clay-soft text-clay" : "bg-saffron-soft text-saffron-deep"}`}>
                      <strong>{e.status === "rejected" ? t("eng.rejected_reason") : t("eng.needs_changes_notice")}</strong> {e.reason}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={t("sd.roadmaps")} action={<Link href="/student/roadmaps" className="text-sm font-semibold underline underline-offset-2">{t("sd.all_roadmaps")}</Link>}>
        {progress.length === 0 ? (
          <p className="text-ink-2">{t("sd.no_roadmaps")}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {progress.map((r) => {
              const pr = progressOf(r.steps, r.statuses);
              const total = pr.total;
              const done = pr.done + pr.skipped;
              const pct = pr.pct;
              return (
                <li key={r.role}>
                  <Link href={`/student/roadmaps/${r.role}`} className="card block p-4 hover:border-ink-3">
                    <span className="font-bold">{r.title ?? roleTitle(r.role)}</span>
                    <span className="mt-2 block h-2 overflow-hidden rounded-full bg-sand"><span className="block h-full rounded-full bg-saffron" style={{ width: `${pct}%` }} /></span>
                    <span className="mt-1 block text-sm text-ink-3">{t("rm.progress", { done, total })}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}

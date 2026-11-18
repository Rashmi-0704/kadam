import Link from "next/link";
import { requireBusiness } from "@/lib/guards";
import { q } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { createDueReminders } from "@/lib/engagement";
import { Notice, StatusBadge, timeAgo } from "@/components/ui";
import { CategoryChips, TakerCount, NewBadge } from "@/components/ProblemBits";
import { InsightTiles, ICONS } from "@/components/InsightTiles";
import { Reveal } from "@/components/motion/Reveal";
import { DashColumns, DashSection, EmptyCard, Initials, NextStepCard, ProgressLine, WelcomeBanner } from "@/components/dashboard/DashBits";
import { headlineOf } from "@/lib/dashboard";
import { DashBackdrop } from "@/components/dashboard/DashBackdrop";

export const metadata = { title: "Dashboard" };

const ACT_ICON: Record<string, React.ReactNode> = {
  took: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5M17 8v6M14 11h6" /></>,
  submitted: <><path d="M4 12h12M12 6l6 6-6 6" /><path d="M20 4v16" /></>,
  accepted: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  in_use: <path d="M4 20h4v-5h4v-5h4V5h4" />,
  report: <><path d="M6 3h9l3 3v15H6z" /><path d="M9 13h6M9 17h4" /></>,
};

export default async function BusinessDashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { user } = await requireBusiness();
  const t = await getT();
  const sp = await searchParams;
  const due = await createDueReminders(user.id);
  const problems = await q(
    `select p.id, p.title, p.status, p.categories, p.created_at, p.live_at,
            (select count(*)::int from engagements e where e.problem_id = p.id and e.status <> 'withdrawn') as takers,
            (select count(*)::int from engagements e where e.problem_id = p.id and e.status = 'submitted') as waiting,
            (select count(*)::int from engagements e where e.problem_id = p.id and e.status in ('submitted','received','needs_changes','rejected')) as sent,
            (select count(*)::int from engagements e where e.problem_id = p.id and e.status in ('accepted','in_use')) as used
       from problems p where p.business_id = $1 order by (p.status = 'draft') desc, p.created_at desc`,
    [user.id],
  );
  const needsAction = await q(
    `select e.id, e.status, p.title, s.name as student
       from engagements e join problems p on p.id = e.problem_id join users s on s.id = e.student_id
      where p.business_id = $1 and (e.status = 'submitted' or e.id::text in (select jsonb_array_elements_text($2::jsonb)))
      order by e.started_at desc`,
    [user.id, JSON.stringify(due)],
  );
  const inUse = ((await q(`select count(*)::int as n from engagements e join problems p on p.id = e.problem_id where p.business_id = $1 and e.status in ('accepted','in_use')`, [user.id]))[0]?.n ?? 0) as number;

  // Recent activity: only from existing tables, newest 8.
  const activity = await q(
    `select * from (
       select 'took' as kind, e.started_at as at, s.name as student, p.title from engagements e join problems p on p.id = e.problem_id join users s on s.id = e.student_id where p.business_id = $1
       union all
       select 'submitted', sb.submitted_at, s.name, p.title from submissions sb join engagements e on e.id = sb.engagement_id join problems p on p.id = e.problem_id join users s on s.id = e.student_id where p.business_id = $1
       union all
       select sc.status, sc.created_at, s.name, p.title from status_changes sc join engagements e on e.id = sc.engagement_id join problems p on p.id = e.problem_id join users s on s.id = e.student_id where p.business_id = $1 and sc.status in ('accepted','in_use')
       union all
       select 'report', r.generated_at, s.name, p.title from impact_reports r join engagements e on e.id = r.engagement_id join problems p on p.id = e.problem_id join users s on s.id = e.student_id where p.business_id = $1
     ) a order by at desc limit 8`,
    [user.id],
  );
  // Impact so far: best result from the latest report of each engagement.
  const latestReports = await q(
    `select distinct on (r.engagement_id) r.outcomes, p.title from impact_reports r join engagements e on e.id = r.engagement_id join problems p on p.id = e.problem_id
      where p.business_id = $1 order by r.engagement_id, r.version desc`,
    [user.id],
  );
  const best = latestReports.map((r) => ({ headline: headlineOf(r.outcomes), title: r.title as string })).find((r) => r.headline);

  const drafts = problems.filter((p) => p.status === "draft");
  const published = problems.filter((p) => p.status !== "draft");
  const live = published.filter((p) => p.status === "live").length;
  const students = published.reduce((n, p) => n + p.takers, 0);
  const firstName = user.name?.split(" ")[0] ?? "";

  // Your next step: always exactly one.
  const submitted = needsAction.find((e) => e.status === "submitted");
  const updateDue = needsAction.find((e) => e.status !== "submitted");
  const next =
    problems.length === 0
      ? { title: t("bd.next_first"), body: t("bd.next_first_body"), href: "/business/problems/new", cta: t("bd.next_first_cta") }
      : drafts[0]
        ? { title: t("bd.next_draft"), body: drafts[0].title ? t("bd.next_draft_body", { title: drafts[0].title }) : undefined, href: drafts[0].title ? `/business/problems/${drafts[0].id}/review` : `/business/problems/new?draft=${drafts[0].id}`, cta: t("bd.next_draft_cta") }
        : submitted
          ? { title: t("bd.next_review", { name: submitted.student ?? "" }), body: submitted.title, href: `/business/engagements/${submitted.id}`, cta: t("bd.next_review_cta") }
          : updateDue
            ? { title: t("bd.next_update", { name: updateDue.student ?? "" }), body: updateDue.title, href: `/business/engagements/${updateDue.id}`, cta: t("bd.post_update") }
            : { title: t("bd.next_another"), body: t("bd.next_another_body"), href: "/business/problems/new", cta: t("bd.new") };

  const STEPS = [t("bd.step_draft"), t("bd.step_live"), t("bd.step_working"), t("bd.step_submitted"), t("bd.step_inuse")];
  const stepOf = (p: Record<string, number | string>) => (p.status === "draft" ? 0 : Number(p.used) > 0 ? 4 : Number(p.sent) > 0 ? 3 : Number(p.takers) > 0 ? 2 : 1);
  const actText = (a: Record<string, string>) => {
    const name = a.student ?? "";
    if (a.kind === "took") return t("bd.act_took", { name, title: a.title });
    if (a.kind === "submitted") return t("bd.act_submitted", { name, title: a.title });
    if (a.kind === "accepted") return t("bd.act_accepted", { name, title: a.title });
    if (a.kind === "in_use") return t("bd.act_inuse", { name, title: a.title });
    return t("bd.act_report", { title: a.title });
  };

  return (
    <div className="relative">
      <DashBackdrop words={[t("hw.p1"), t("hw.p2"), t("hw.p3"), t("hw.p4")]} />
      <div className="relative z-10">
      <WelcomeBanner tone="business" art="shop" greeting={t("bd.title", { name: firstName })} status={t("bd.status_line", { live, students })} />
      {sp.welcome && <Notice kind="success" className="mb-6">{t("bd.welcome")}</Notice>}
      <NextStepCard eyebrow={t("bd.next_eyebrow")} {...next} />
      <InsightTiles
        items={[
          { label: t("ins.live"), value: live, tone: "ink", icon: ICONS.live },
          { label: t("ins.students"), value: students, hint: t("ins.students_hint"), tone: "info", icon: ICONS.people },
          { label: t("ins.waiting"), value: published.reduce((n, p) => n + p.waiting, 0), hint: t("ins.waiting_hint"), tone: "primary", icon: ICONS.inbox },
          { label: t("ins.solutions"), value: inUse, hint: t("ins.solutions_hint"), tone: "success", icon: ICONS.check },
        ]}
      />

      <DashColumns
        main={
          <>
            <Reveal>
              <DashSection title={t("bd.needs_action")}>
                {needsAction.length === 0 ? (
                  <EmptyCard icon="inbox" title={t("bd.needs_empty_title")} body={t("bd.needs_empty_body")} />
                ) : (
                  <Reveal as="ul" className="grid gap-3">
                    {needsAction.map((e) => (
                      <li key={e.id} data-reveal>
                        <Link href={`/business/engagements/${e.id}`} className="card flex items-center gap-4 border-primary/40 bg-primary-soft/40 p-4 hover:border-primary">
                          <Initials name={e.student} />
                          <span className="min-w-0 flex-1">
                            <span className="block font-bold leading-snug">{e.status === "submitted" ? t("bd.review_submission", { name: e.student }) : t("bd.update_due", { name: e.student })}</span>
                            <span className="block truncate text-sm text-ink-2">{e.title}</span>
                          </span>
                          <span className="btn-primary min-h-12 shrink-0 px-5">{e.status === "submitted" ? t("common.open") : t("bd.post_update")}</span>
                        </Link>
                      </li>
                    ))}
                  </Reveal>
                )}
              </DashSection>
            </Reveal>

            <Reveal>
              <DashSection title={t("bd.my_problems")} action={<Link href="/business/problems/new" className="btn-secondary btn-sm">+ {t("bd.new")}</Link>}>
                {problems.length === 0 ? (
                  <EmptyCard icon="problems" title={t("bd.empty_title")} body={t("bd.empty_body")} action={<Link href="/business/problems/new" className="btn-secondary">{t("bd.new")}</Link>} />
                ) : (
                  <Reveal as="ul" className="grid gap-3">
                    {problems.map((p, i) => {
                      const draft = p.status === "draft";
                      const href = draft ? (p.title ? `/business/problems/${p.id}/review` : `/business/problems/new?draft=${p.id}`) : `/business/problems/${p.id}`;
                      return (
                        <li key={p.id} data-reveal>
                          <Link href={href} className="glow-card card-tap flex flex-col gap-3 p-5" style={{ "--glow-delay": `${-i * 4}s` } as React.CSSProperties}>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold leading-snug">{p.title || t("bd.untitled")}</h3>
                              <span className="flex shrink-0 items-center gap-1.5">{p.status === "live" && <NewBadge liveAt={p.live_at} t={t} />}<StatusBadge status={p.status} t={t} /></span>
                            </div>
                            {!draft && <CategoryChips c={p.categories} t={t} />}
                            <ProgressLine steps={STEPS} current={stepOf(p)} done={stepOf(p) === 4} label={t("bd.progress")} />
                            {!draft && (
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <TakerCount n={p.takers} t={t} />
                                {p.waiting > 0 && <span className="chip border-primary/40 bg-primary-soft text-primary-deep">{t("bd.waiting", { n: p.waiting })}</span>}
                              </div>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </Reveal>
                )}
              </DashSection>
            </Reveal>
          </>
        }
        side={
          <>
            <Reveal>
              <DashSection title={t("bd.activity")}>
                {activity.length === 0 ? (
                  <EmptyCard icon="activity" title={t("bd.activity_empty_title")} body={t("bd.activity_empty_body")} />
                ) : (
                  <Reveal as="ul" className="card divide-y divide-line">
                    {activity.map((a, i) => (
                      <li key={i} data-reveal className="flex items-start gap-3 p-4">
                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary" aria-hidden="true">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ACT_ICON[a.kind] ?? ACT_ICON.report}</svg>
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm leading-snug font-semibold">{actText(a)}</span>
                          <span className="text-xs text-ink-3">{timeAgo(a.at, t)}</span>
                        </span>
                      </li>
                    ))}
                  </Reveal>
                )}
              </DashSection>
            </Reveal>

            <Reveal>
              <DashSection title={t("bd.impact")}>
                {inUse === 0 && !best ? (
                  <EmptyCard icon="impact" title={t("bd.impact_none_title")} body={t("bd.impact_empty")} />
                ) : (
                  <div className="card space-y-3 border-success/30 bg-success-soft/40 p-5">
                    <p><span className="font-display text-4xl font-extrabold text-success-ink">{inUse}</span> <span className="font-semibold text-ink-2">{t("bd.impact_inuse")}</span></p>
                    {best && (
                      <div>
                        <p className="eyebrow text-success-ink">{t("bd.impact_best")}</p>
                        <p className="font-display text-2xl leading-tight font-extrabold">{best.headline}</p>
                        <p className="text-sm text-ink-2">{best.title}</p>
                      </div>
                    )}
                  </div>
                )}
              </DashSection>
            </Reveal>

            <Reveal>
              <div className="card flex flex-col gap-4 border-highlight/30 bg-highlight-soft/50 p-5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-highlight-deep" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
                </span>
                <p className="text-lg leading-snug font-bold">{t("bd.help_title")}</p>
                <Link href="/business/problems/new" className="btn-secondary min-h-12">{t("bd.help_btn")}</Link>
              </div>
            </Reveal>
          </>
        }
      />
      </div>
    </div>
  );
}

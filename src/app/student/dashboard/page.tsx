import Link from "next/link";
import { requireStudent } from "@/lib/guards";
import { q } from "@/lib/db";
import { getT, getLang } from "@/lib/i18n/server";
import { StatusBadge, fmtDate } from "@/components/ui";
import { roleTitle } from "@/db/taxonomy";
import { progressOf, type TopicStatus } from "@/lib/roadmaps";
import { InsightTiles, ICONS } from "@/components/InsightTiles";
import { ProblemCard } from "@/components/ProblemBits";
import { Reveal } from "@/components/motion/Reveal";
import { DashColumns, DashSection, EmptyCard, NextStepCard, ProgressLine, WelcomeBanner } from "@/components/dashboard/DashBits";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { cachedSuggestions, headlineOf, newestProblems, nextTopic } from "@/lib/dashboard";

export const metadata = { title: "Dashboard" };

// Student pages are English only (decision 32), so new text here is plain English.
const STEPS = ["Taken", "Working", "Submitted", "Accepted / In use"];
const STEP_OF: Record<string, number> = { taken_up: 0, in_progress: 1, needs_changes: 1, submitted: 2, received: 2, rejected: 2, accepted: 3, in_use: 3 };

const TIPS = [
  "Businesses reply faster when you share a first draft early.",
  "Ask the owner what a good result looks like before you start building.",
  "Small, working solutions beat big, unfinished ones. Ship something in the first week.",
  "Write down the numbers before you start, so the impact is easy to show later.",
  "Keep your messages short and clear. Many owners read them on a phone between customers.",
  "A spreadsheet or a WhatsApp flow counts. The best solution is the one they actually use.",
];

/** One tip per day, rotating through the list. */
function tipOfTheDay() {
  return TIPS[Math.floor(Date.now() / 864e5) % TIPS.length];
}

const PATH_CHIP: Record<string, string> = { now: "bg-success-soft text-success-ink", pivot: "bg-info-soft text-info", stretch: "bg-highlight-soft text-highlight-deep" };
const PATH_LABEL: Record<string, string> = { now: "Now", pivot: "Pivot", stretch: "Stretch" };

export default async function StudentDashboard() {
  const { user, profile } = await requireStudent();
  const t = await getT();
  const lang = await getLang();
  const engagements = await q(
    `select e.id, e.problem_id, e.status, e.started_at, e.share_token, p.title, b.business_name,
            (select reason from status_changes s where s.engagement_id = e.id and s.status in ('rejected','needs_changes') order by created_at desc limit 1) as reason,
            (select max(version) from impact_reports r where r.engagement_id = e.id) as report_version,
            (select max(generated_at) from impact_reports r where r.engagement_id = e.id) as report_at,
            (select outcomes from impact_reports r where r.engagement_id = e.id order by version desc limit 1) as outcomes
       from engagements e join problems p on p.id = e.problem_id join business_profiles b on b.user_id = p.business_id
      where e.student_id = $1 order by (e.status = 'withdrawn'), e.started_at desc`,
    [user.id],
  );
  const progress = await q(`select r.role, r.title, r.steps, rp.statuses
       from roadmap_progress rp join roadmaps r on r.role = rp.role where rp.student_id = $1 order by r.title`, [user.id]);
  const reports = engagements.filter((e) => e.report_version);
  const active = engagements.filter((e) => e.status !== "withdrawn");
  const firstName = user.name?.split(" ")[0] ?? "";
  const working = active.filter((e) => ["taken_up", "in_progress", "needs_changes", "submitted", "received"].includes(e.status)).length;
  const inUse = active.filter((e) => ["accepted", "in_use"].includes(e.status)).length;

  // Suggested for you: the cached ranking only (no AI call). No cache yet: newest live problems.
  const taken = new Set(engagements.map((e) => e.problem_id as string));
  const cached = profile.approved_at ? await cachedSuggestions(user.id, taken) : null;
  const suggested = cached?.problems ?? (await newestProblems(taken));

  // Roadmaps: progress rings + the next topic.
  const rings = progress.map((r) => ({ role: r.role as string, title: r.title as string | null, steps: r.steps as unknown, statuses: r.statuses as Record<string, TopicStatus> | null, pr: progressOf(r.steps, r.statuses, r.role) }));
  const topicRow = rings.find((r) => r.pr.pct < 100 && nextTopic(r.role, r.steps, r.statuses));

  // Your next step: always exactly one.
  const changes = active.find((e) => e.status === "needs_changes");
  const continuing = active.find((e) => ["taken_up", "in_progress"].includes(e.status));
  const next = !profile.cv_parsed
    ? { title: "Upload your CV", body: "Kadam reads it to find your skills, then asks a few quick questions.", href: "/student/profile", cta: "Upload CV" }
    : !profile.approved_at
      ? { title: "Approve your paths", body: "Check your Now, Pivot and Stretch roles and approve them to get matched.", href: "/student/profile", cta: "Approve paths" }
      : active.length === 0
        ? { title: "Take your first problem", body: "Pick a real problem from a business. Your first step to real experience.", href: "/student/problems?tab=suggested", cta: "Find a problem" }
        : changes
          ? { title: `You have changes requested on ${changes.title}`, body: "The business asked for a few changes. Open it to see what they need.", href: `/student/engagements/${changes.id}`, cta: "Open it" }
          : continuing
            ? { title: `Continue working on ${continuing.title}`, body: `Keep going with ${continuing.business_name}.`, href: `/student/engagements/${continuing.id}`, cta: "Continue" }
            : topicRow
              ? { title: `Next topic in your ${topicRow.title ?? roleTitle(topicRow.role)} roadmap: ${nextTopic(topicRow.role, topicRow.steps, topicRow.statuses)}`, body: "A little learning now makes your next problem easier.", href: `/student/roadmaps/${topicRow.role}`, cta: "Open roadmap" }
              : { title: "Take on another problem", body: "More real work means more proof on your resume.", href: "/student/problems?tab=suggested", cta: "Find a problem" };

  const status = [
    `${working} ${working === 1 ? "problem" : "problems"} in progress`,
    `${inUse} ${inUse === 1 ? "solution" : "solutions"} in use`,
  ].join(" · ");
  const paths = profile.approved_at ? (profile.pathways as Record<string, { role: string; slug: string; rationale: string }[]> | null) : null;
  const tip = tipOfTheDay();

  return (
    <div>
      <WelcomeBanner tone="student" art="steps" greeting={firstName ? `Hi, ${firstName}` : "Hi there"} status={status} />
      <NextStepCard eyebrow="Your next step" {...next} />
      <InsightTiles
        items={[
          { label: t("ins.taken"), value: active.length, tone: "ink", icon: ICONS.briefcase, href: "/student/problems" },
          { label: t("ins.in_use"), value: inUse, hint: t("ins.in_use_hint"), tone: "success", icon: ICONS.check },
          { label: t("ins.reports"), value: reports.length, tone: "primary", icon: ICONS.report, href: reports[0] ? `/reports/${reports[0].share_token}` : undefined },
          { label: t("ins.topics"), value: rings.reduce((n, r) => n + r.pr.done, 0), hint: t("ins.topics_hint"), tone: "info", icon: ICONS.steps, href: "/student/roadmaps" },
        ]}
      />

      <DashColumns
        main={
          <>
            <Reveal>
              <DashSection title={cached ? "Suggested for you" : "New problems"} action={<Link href="/student/problems?tab=suggested" className="text-sm font-semibold underline underline-offset-2">See all</Link>}>
                {suggested.length === 0 ? (
                  <EmptyCard icon="problems" title="No open problems right now" body="New problems from businesses show up here as soon as they go live." action={<Link href="/student/problems" className="btn-secondary">Browse problems</Link>} />
                ) : (
                  <Reveal as="ul" className="grid gap-3 md:grid-cols-2">
                    {suggested.map((p, i) => (
                      <li key={p.id} data-reveal className={i === 2 ? "md:col-span-2" : ""}>
                        <ProblemCard p={p} t={t} index={i} href={`/student/problems/${p.id}`} reason={cached?.reasons.get(p.id) ?? null} />
                      </li>
                    ))}
                  </Reveal>
                )}
              </DashSection>
            </Reveal>

            <Reveal>
              <DashSection title={t("sd.engagements")} action={<Link href="/student/problems" className="text-sm font-semibold underline underline-offset-2">{t("sd.find_more")}</Link>}>
                {engagements.length === 0 ? (
                  <EmptyCard icon="path" title="No problems yet" body="Take up a real problem and it shows here, with every step until it's in use." action={<Link href="/student/problems" className="btn-secondary">{t("sd.browse")}</Link>} />
                ) : (
                  <Reveal as="ul" className="grid gap-2">
                    {engagements.map((e) => (
                      <li key={e.id} data-reveal>
                        <Link href={`/student/engagements/${e.id}`} className={`card flex flex-col gap-3 p-4 hover:border-ink-3 ${e.status === "withdrawn" ? "opacity-60" : ""}`}>
                          <div className="flex items-start justify-between gap-3">
                            <span className="min-w-0">
                              <span className="block font-bold leading-snug">{e.title}</span>
                              <span className="text-sm text-ink-3">{e.business_name} · {t("bp.started_on", { date: fmtDate(e.started_at, lang) })}</span>
                            </span>
                            <StatusBadge status={e.status} t={t} />
                          </div>
                          {e.status !== "withdrawn" && (
                            <ProgressLine steps={STEPS} current={STEP_OF[e.status] ?? 0} done={["accepted", "in_use"].includes(e.status)} label="Progress" />
                          )}
                          {e.reason && ["rejected", "needs_changes"].includes(e.status) && (
                            <p className={`rounded-xl px-3 py-2 text-sm ${e.status === "rejected" ? "bg-alert-soft text-alert" : "bg-primary-soft text-primary-deep"}`}>
                              <strong>{e.status === "rejected" ? t("eng.rejected_reason") : t("eng.needs_changes_notice")}</strong> {e.reason}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </Reveal>
                )}
              </DashSection>
            </Reveal>

            <Reveal>
              <DashSection title={t("sd.reports")}>
                {reports.length === 0 ? (
                  <EmptyCard icon="report" title="No impact reports yet" body="When a business uses your work, Kadam writes a report with resume-ready lines." />
                ) : (
                  <Reveal as="ul" className="grid gap-3 md:grid-cols-2">
                    {reports.map((e) => {
                      const headline = headlineOf(e.outcomes);
                      return (
                        <li key={e.id} data-reveal>
                          <Link href={`/reports/${e.share_token}`} className="card flex h-full flex-col gap-2 border-success/30 bg-success-soft/40 p-5 hover:border-success">
                            <span className="eyebrow text-success-ink">{t("report.eyebrow")} · v{e.report_version}</span>
                            <span className="font-bold leading-snug">{e.title}</span>
                            {headline && <span className="font-display text-2xl font-extrabold text-success-ink">{headline}</span>}
                            <span className="text-sm text-ink-2">{t("sd.report_updated", { date: fmtDate(e.report_at, lang) })}</span>
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
              <DashSection title="Your paths" action={paths ? <Link href="/student/profile" className="text-sm font-semibold underline underline-offset-2">Profile</Link> : undefined}>
                {!paths ? (
                  <EmptyCard icon="path" title="No paths yet" body="Approve your Now, Pivot and Stretch roles to get problems that fit you." action={<Link href="/student/profile" className="btn-secondary">Approve your paths</Link>} />
                ) : (
                  <Reveal as="ul" className="grid gap-2">
                    {(["now", "pivot", "stretch"] as const).flatMap((tier) => (paths[tier] ?? []).slice(0, 1).map((p) => (
                      <li key={tier} data-reveal>
                        <Link href="/student/profile" className="card block p-4 hover:border-ink-3">
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-bold">{p.role}</span>
                            <span className={`chip shrink-0 border-0 ${PATH_CHIP[tier]}`}>{PATH_LABEL[tier]}</span>
                          </span>
                          {p.rationale && <span className="mt-1 line-clamp-1 block text-sm text-ink-2">{p.rationale}</span>}
                        </Link>
                      </li>
                    )))}
                  </Reveal>
                )}
              </DashSection>
            </Reveal>

            <Reveal>
              <DashSection title={t("sd.roadmaps")} action={<Link href="/student/roadmaps" className="text-sm font-semibold underline underline-offset-2">{t("sd.all_roadmaps")}</Link>}>
                {rings.length === 0 ? (
                  <EmptyCard icon="roadmap" title="No roadmaps yet" body="Open a roadmap for a role you want and track each topic you learn." action={<Link href="/student/roadmaps" className="btn-secondary">Explore roadmaps</Link>} />
                ) : (
                  <Reveal as="ul" className="grid gap-2">
                    {rings.map((r) => (
                      <li key={r.role} data-reveal>
                        <Link href={`/student/roadmaps/${r.role}`} className="card flex items-center gap-4 p-4 hover:border-ink-3">
                          <ProgressRing pct={r.pr.pct} />
                          <span className="min-w-0">
                            <span className="block font-bold leading-snug">{r.title ?? roleTitle(r.role)}</span>
                            <span className="text-sm text-ink-3">{r.pr.done + r.pr.skipped} of {r.pr.total} topics</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </Reveal>
                )}
              </DashSection>
            </Reveal>

            <Reveal>
              <div className="card border-highlight/30 bg-highlight-soft/50 p-5">
                <p className="eyebrow">Tip</p>
                <p className="mt-2 font-semibold leading-snug">{tip}</p>
              </div>
            </Reveal>
          </>
        }
      />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/guards";
import { q } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { getRoadmap, statusesFor } from "@/lib/roadmaps";
import { BackLink, EmptyState } from "@/components/ui";
import { RoadmapView } from "@/components/RoadmapView";
import { ProblemCard } from "@/components/ProblemBits";
import { flattenTopics, RSH_BASE, type RoadmapIntro } from "@/db/roadmaps-data";

// AI calls can take several seconds.
export const maxDuration = 60;

export const metadata = { title: "Roadmap" };

/** What the role is, first jobs, salary (only with a cited source) and how Kadam helps. Students use English (decision 32). */
function IntroBlock({ intro }: { intro: RoadmapIntro }) {
  return (
    <section aria-labelledby="rm-intro" className="card mb-8 grid gap-5 p-5 sm:p-6 md:grid-cols-2">
      <h2 id="rm-intro" className="sr-only">About this role</h2>
      <div>
        <h3 className="text-sm font-bold tracking-wide text-ink-3 uppercase">What the role does</h3>
        <p className="mt-1.5 text-ink-2">{intro.does}</p>
        {intro.firstJobs.length > 0 && (
          <>
            <h3 className="mt-4 text-sm font-bold tracking-wide text-ink-3 uppercase">Typical first jobs in India</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {intro.firstJobs.map((j) => <li key={j} className="chip bg-card">{j}</li>)}
            </ul>
          </>
        )}
      </div>
      <div className="space-y-4">
        {intro.salary && (
          <div className="rounded-2xl border-2 border-line bg-canvas p-4">
            <h3 className="text-sm font-bold tracking-wide text-ink-3 uppercase">Early-career pay</h3>
            <p className="mt-1 font-semibold text-ink">{intro.salary.range}</p>
            <p className="mt-1 text-xs text-ink-3">
              Source:{" "}
              <a href={intro.salary.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink-2 underline underline-offset-2 hover:text-primary-deep">
                {intro.salary.source}<span className="sr-only"> (opens in a new tab)</span>
              </a>
              . Averages vary a lot by city, company and skills.
            </p>
          </div>
        )}
        <div className="rounded-2xl border-2 border-primary/30 bg-primary-soft p-4">
          <h3 className="text-sm font-bold text-primary-deep">How Kadam helps</h3>
          <p className="mt-1 text-ink-2">{intro.kadam}</p>
        </div>
      </div>
    </section>
  );
}

/** Credit links to roadmap.sh, only for slugs confirmed to exist. Nothing from roadmap.sh is copied. */
function RshCredit({ slugs }: { slugs: string[] }) {
  if (!slugs.length) return null;
  return (
    <aside className="mt-10 rounded-2xl border-2 border-dashed border-line-deep bg-card p-5" aria-labelledby="rm-rsh">
      <h2 id="rm-rsh" className="font-bold">Learn more on roadmap.sh</h2>
      <p className="mt-1 text-sm text-ink-2">roadmap.sh is a free community project with detailed developer and career roadmaps. Kadam&apos;s roadmaps are written separately for Indian college students; these pages go deeper.</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {slugs.map((s) => (
          <li key={s}>
            <a href={`${RSH_BASE}${s}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-line bg-card px-3.5 text-sm font-semibold hover:border-ink">
              roadmap.sh/{s} <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default async function RoadmapPage({ params, searchParams }: { params: Promise<{ role: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { role } = await params;
  const sp = await searchParams;
  const { user } = await requireStudent();
  const r = await getRoadmap(role);
  if (!r) notFound();
  const t = await getT();
  const statuses = await statusesFor(user.id, r.role);
  const live = await q(
    `select p.id, p.title, p.categories, p.status, b.business_name,
            (select count(*)::int from engagements e where e.problem_id = p.id and e.status <> 'withdrawn') as takers
       from problems p join business_profiles b on b.user_id = p.business_id where p.status = 'live' order by p.live_at desc nulls last`,
  );
  // "Projects" for this roadmap: live Kadam problems that build experience for the role.
  const forRole = live.filter((p) => (p.categories?.related_roles ?? []).includes(r.role));
  const practise = live.map((p) => ({ id: p.id, title: p.title, business: p.business_name, skills: (p.categories?.skills ?? []) as string[] }));
  const tab = sp.tab === "problems" ? "problems" : "roadmap";
  const topicCount = flattenTopics(r.sections).length;

  return (
    <div>
      <BackLink href="/student/roadmaps" label={t("nav.roadmaps")} />
      <div className="mb-5 max-w-3xl">
        <p className="eyebrow">{t("rm.eyebrow")}</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{r.title}</h1>
        <p className="mt-2 text-ink-2">{r.summary}</p>
        <p className="mt-1 text-sm text-ink-3">{t("rm.topics_count", { n: topicCount })}</p>
      </div>
      <div className="mb-6 inline-flex rounded-full border border-line bg-card p-1" role="tablist">
        <Link href={`/student/roadmaps/${r.role}`} role="tab" aria-selected={tab === "roadmap"} className={`inline-flex min-h-10 items-center rounded-full px-5 text-sm font-semibold ${tab === "roadmap" ? "bg-primary text-white" : "text-ink-2"}`}>{t("rm.tab_roadmap")}</Link>
        <Link href={`/student/roadmaps/${r.role}?tab=problems`} role="tab" aria-selected={tab === "problems"} className={`inline-flex min-h-10 items-center rounded-full px-5 text-sm font-semibold ${tab === "problems" ? "bg-primary text-white" : "text-ink-2"}`}>{t("rm.tab_problems", { n: forRole.length })}</Link>
      </div>
      {tab === "roadmap" ? (
        <>
          {r.intro && <IntroBlock intro={r.intro} />}
          <RoadmapView role={r.role} sections={r.sections} initialStatuses={statuses} problems={practise} />
        </>
      ) : forRole.length === 0 ? (
        <EmptyState title={t("rm.practise_empty", { role: r.title })} body={t("rm.practise_empty_body")} action={<Link href="/student/problems" className="btn-primary">{t("sd.browse")}</Link>} />
      ) : (
        <>
          <p className="mb-4 max-w-2xl text-ink-2">{t("rm.problems_intro", { role: r.title })}</p>
          <ul className="grid gap-3 md:grid-cols-2">
            {forRole.map((p) => <li key={p.id}><ProblemCard p={p} t={t} href={`/student/problems/${p.id}`} /></li>)}
          </ul>
        </>
      )}
      <RshCredit slugs={r.rsh} />
    </div>
  );
}

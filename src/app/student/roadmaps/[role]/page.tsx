import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/guards";
import { q } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { getRoadmap, statusesFor } from "@/lib/roadmaps";
import { BackLink, EmptyState } from "@/components/ui";
import { RoadmapView } from "@/components/RoadmapView";
import { ProblemCard } from "@/components/ProblemBits";
import { flattenTopics } from "@/db/roadmaps-data";
import { catalogItem } from "@/db/roadmap-catalog";

export const metadata = { title: "Roadmap" };

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
        {catalogItem(r.role)?.rsh && (
          <a href={`https://roadmap.sh/${catalogItem(r.role)!.rsh}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-sm font-semibold hover:border-ink">
            {t("rm.rsh_link")} <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
      <div className="mb-6 inline-flex rounded-full border border-line bg-card p-1" role="tablist">
        <Link href={`/student/roadmaps/${r.role}`} role="tab" aria-selected={tab === "roadmap"} className={`inline-flex min-h-10 items-center rounded-full px-5 text-sm font-semibold ${tab === "roadmap" ? "bg-ink text-paper" : "text-ink-2"}`}>{t("rm.tab_roadmap")}</Link>
        <Link href={`/student/roadmaps/${r.role}?tab=problems`} role="tab" aria-selected={tab === "problems"} className={`inline-flex min-h-10 items-center rounded-full px-5 text-sm font-semibold ${tab === "problems" ? "bg-ink text-paper" : "text-ink-2"}`}>{t("rm.tab_problems", { n: forRole.length })}</Link>
      </div>
      {tab === "roadmap" ? (
        <RoadmapView role={r.role} sections={r.sections} initialStatuses={statuses} problems={practise} />
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
    </div>
  );
}

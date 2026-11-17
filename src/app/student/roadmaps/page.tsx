import { requireStudent } from "@/lib/guards";
import { q } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { PageTitle } from "@/components/ui";
import { slugify, roleTitle } from "@/db/taxonomy";
import { progressOf } from "@/lib/roadmaps";
import { seededRoadmap } from "@/db/roadmaps-data";
import { CATALOG, ROLE_GROUPS, SKILL_GROUPS } from "@/db/roadmap-catalog";
import { RoadmapBrowser, type BrowserItem } from "@/components/RoadmapBrowser";

export const metadata = { title: "Roadmaps" };

export default async function RoadmapsPage() {
  const { user, profile } = await requireStudent();
  const t = await getT();
  const stored = new Map((await q(`select role, steps from roadmaps`)).map((r) => [r.role, r.steps]));
  const statusRows = new Map((await q(`select role, statuses from roadmap_progress where student_id = $1`, [user.id])).map((r) => [r.role, r.statuses]));
  const pct = (slug: string) => {
    const steps = stored.get(slug);
    const st = statusRows.get(slug);
    return (steps || seededRoadmap(slug)) && st ? progressOf(steps, st, slug).pct : null;
  };
  const items: BrowserItem[] = CATALOG.map((c) => ({ slug: c.slug, title: c.title, kind: c.kind, group: c.group, blurb: c.blurb, pct: pct(c.slug) }));

  const paths = profile.pathways as Record<"now" | "pivot" | "stretch", { role: string; slug: string }[]> | null;
  const mineRaw = paths
    ? (["now", "pivot", "stretch"] as const).flatMap((tier) => paths[tier].map((p) => ({ slug: p.slug || slugify(p.role), title: p.role, tier })))
    : ((profile.target_roles ?? []) as string[]).map((r) => ({ slug: slugify(r), title: r, tier: undefined }));
  const mine: BrowserItem[] = mineRaw.map((m) => {
    const c = CATALOG.find((x) => x.slug === m.slug);
    return { slug: m.slug, title: c?.title ?? m.title ?? roleTitle(m.slug), kind: "role", group: "", blurb: c?.blurb ?? "", pct: pct(m.slug), tier: m.tier };
  });

  return (
    <div>
      <PageTitle eyebrow={t("rm.eyebrow")} title={t("rm.title")} sub={t("rm.sub")} />
      <RoadmapBrowser items={items} mine={mine} roleGroups={ROLE_GROUPS} skillGroups={SKILL_GROUPS} />
    </div>
  );
}

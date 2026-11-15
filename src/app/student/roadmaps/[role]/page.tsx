import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/guards";
import { one } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { getRoadmap } from "@/lib/roadmaps";
import { BackLink } from "@/components/ui";
import { RoadmapView } from "@/components/RoadmapView";

export const metadata = { title: "Roadmap" };

export default async function RoadmapPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const { user } = await requireStudent();
  const r = await getRoadmap(role);
  if (!r) notFound();
  const t = await getT();
  const prog = await one(`select completed_step_ids from roadmap_progress where student_id = $1 and role = $2`, [user.id, r.role]);
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/student/roadmaps" label={t("nav.roadmaps")} />
      <p className="eyebrow">{t("rm.eyebrow")}</p>
      <h1 className="mt-1 text-3xl font-bold">{r.title}</h1>
      <p className="mt-2 mb-6 text-ink-2">{r.summary}</p>
      <RoadmapView role={r.role} steps={r.steps} initialDone={(prog?.completed_step_ids as string[]) ?? []} />
    </div>
  );
}

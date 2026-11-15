import Link from "next/link";
import { requireStudent } from "@/lib/guards";
import { q } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { PageTitle, Section } from "@/components/ui";
import { addTargetRole } from "@/app/actions/student";
import { SubmitButton } from "@/components/SubmitButton";
import { slugify } from "@/db/taxonomy";
import { progressOf } from "@/lib/roadmaps";

export const metadata = { title: "Roadmaps" };

export default async function RoadmapsPage() {
  const { user, profile } = await requireStudent();
  const t = await getT();
  const all = await q(`select role, title, summary, steps from roadmaps order by title`);
  const statusRows = new Map((await q(`select role, statuses from roadmap_progress where student_id = $1`, [user.id])).map((r) => [r.role, r.statuses]));
  const paths = profile.pathways as { now: { role: string; slug: string }[]; pivot: { role: string; slug: string }[]; stretch: { role: string; slug: string }[] } | null;
  const mine = paths
    ? [...paths.now.map((p) => ({ ...p, tier: "now" })), ...paths.pivot.map((p) => ({ ...p, tier: "pivot" })), ...paths.stretch.map((p) => ({ ...p, tier: "stretch" }))]
    : ((profile.target_roles ?? []) as string[]).map((r) => ({ role: r, slug: slugify(r), tier: "" }));
  const card = (slug: string, title: string, summary: string | null, steps: unknown, tier?: string) => {
    const pr = steps ? progressOf(steps, statusRows.get(slug)) : null;
    const total = pr?.total ?? 0;
    const done = (pr?.done ?? 0) + (pr?.skipped ?? 0);
    return (
      <Link href={`/student/roadmaps/${slug}`} className="card flex h-full flex-col gap-2 p-5 hover:border-ink-3">
        {tier && <span className="eyebrow">{t(`path.${tier}`)}</span>}
        <span className="text-lg font-bold">{title}</span>
        {summary && <span className="text-sm text-ink-2">{summary}</span>}
        {total ? (
          <span className="mt-auto pt-2">
            <span className="block h-2 overflow-hidden rounded-full bg-sand"><span className="block h-full rounded-full bg-saffron" style={{ width: `${Math.round((done / total) * 100)}%` }} /></span>
            <span className="mt-1 block text-xs text-ink-3">{t("rm.progress", { done, total })}</span>
          </span>
        ) : (
          <span className="mt-auto pt-2 text-sm font-semibold text-saffron-deep">{t("rm.create")} →</span>
        )}
      </Link>
    );
  };
  const bySlug = new Map(all.map((r) => [r.role, r]));
  return (
    <div>
      <PageTitle eyebrow={t("rm.eyebrow")} title={t("rm.title")} sub={t("rm.sub")} />
      {mine.length > 0 && (
        <Section title={t("rm.for_you")}>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((m) => {
              const r = bySlug.get(m.slug);
              return <li key={`${m.tier}-${m.slug}`}>{card(m.slug, r?.title ?? m.role, r?.summary ?? null, r ? r.steps : null, m.tier || undefined)}</li>;
            })}
          </ul>
        </Section>
      )}
      <Section title={t("rm.all")}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((r) => <li key={r.role}>{card(r.role, r.title, r.summary, r.steps)}</li>)}
        </ul>
      </Section>
      <Section title={t("rm.other")}>
        <form action={addTargetRole} className="card flex flex-col gap-2 p-4 sm:flex-row">
          <label htmlFor="role" className="sr-only">{t("rm.other_label")}</label>
          <input id="role" name="role" className="input flex-1" placeholder={t("rm.other_ph")} required minLength={2} />
          <SubmitButton className="btn-primary" pendingLabel={t("rm.creating")}>{t("rm.open")}</SubmitButton>
        </form>
      </Section>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBusiness } from "@/lib/guards";
import { one, q } from "@/lib/db";
import { getT, getLang } from "@/lib/i18n/server";
import { BackLink, EmptyState, Notice, Section, StatusBadge, fmtDate } from "@/components/ui";
import { CategoryChips, ProblemStatement, TakerCount, NewBadge } from "@/components/ProblemBits";
import { setProblemOpen, deleteDraft } from "@/app/actions/business";
import { SubmitButton } from "@/components/SubmitButton";
import { roleTitle } from "@/db/taxonomy";
import { RelevantRoadmaps } from "@/components/RelevantRoadmaps";

export const metadata = { title: "Problem" };

export default async function BusinessProblem({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ live?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { user } = await requireBusiness();
  const p = await one(`select * from problems where id = $1 and business_id = $2`, [id, user.id]);
  if (!p) notFound();
  const t = await getT();
  const lang = await getLang();
  const engagements = await q(
    `select e.id, e.status, e.started_at, s.name, sp.college, sp.course,
            (select submitted_at from submissions x where x.engagement_id = e.id order by submitted_at desc limit 1) as submitted_at
       from engagements e join users s on s.id = e.student_id left join student_profiles sp on sp.user_id = e.student_id
      where e.problem_id = $1 order by e.started_at desc`,
    [id],
  );
  const takers = engagements.filter((e) => e.status !== "withdrawn").length;
  return (
    <div>
      <BackLink href="/business/dashboard" label={t("nav.home")} />
      {sp.live && <Notice kind="success" className="mb-5">{t("bp.now_live")}</Notice>}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2"><StatusBadge status={p.status} t={t} />{p.status === "live" && <NewBadge liveAt={p.live_at} t={t} />}<TakerCount n={takers} t={t} /></div>
          <h1 className="text-2xl leading-tight font-bold sm:text-3xl">{p.title || t("bd.untitled")}</h1>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Link href={`/business/problems/${id}/review`} className="btn-secondary flex-1 sm:flex-none">{t("common.edit")}</Link>
          {p.status !== "draft" ? (
            <form action={setProblemOpen} className="flex-1 sm:flex-none">
              <input type="hidden" name="problemId" value={id} />
              <input type="hidden" name="open" value={p.status === "live" ? "0" : "1"} />
              <SubmitButton className="btn-secondary w-full">{p.status === "live" ? t("bp.close") : t("bp.reopen")}</SubmitButton>
            </form>
          ) : (
            <form action={deleteDraft} className="flex-1 sm:flex-none">
              <input type="hidden" name="problemId" value={id} />
              <SubmitButton className="btn-danger w-full">{t("bp.delete_draft")}</SubmitButton>
            </form>
          )}
        </div>
      </div>
      {p.status === "closed" && <p className="mb-5 text-sm text-ink-2">{t("bp.closed_help")}</p>}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <Section title={t("bp.students")}>
            {engagements.length === 0 ? (
              <EmptyState title={t("bp.no_students")} body={p.status === "live" ? t("bp.no_students_body") : undefined} />
            ) : (
              <ul className="grid gap-2">
                {engagements.map((e) => (
                  <li key={e.id}>
                    <Link href={`/business/engagements/${e.id}`} className="card flex items-center justify-between gap-3 p-4 hover:border-ink-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info-soft font-bold text-info">{String(e.name ?? "?")[0]}</span>
                        <span className="min-w-0">
                          <span className="block font-bold">{e.name}</span>
                          <span className="block truncate text-sm text-ink-3">{[e.course, e.college].filter(Boolean).join(" · ")}</span>
                          <span className="block text-xs text-ink-3">{e.submitted_at ? t("bp.submitted_on", { date: fmtDate(e.submitted_at, lang) }) : t("bp.started_on", { date: fmtDate(e.started_at, lang) })}</span>
                        </span>
                      </span>
                      <StatusBadge status={e.status} t={t} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>
          <Section title={t("bp.statement")}>
            <div className="card px-5 py-2">
              <ProblemStatement p={p} t={t} />
            </div>
          </Section>
          <RelevantRoadmaps roles={p.categories?.related_roles ?? []} skills={p.categories?.skills ?? []} t={t} linkable={false} />
        </div>
        <aside>
          <div className="card space-y-4 p-5">
            <h2 className="font-bold">{t("review.categories")}</h2>
            <CategoryChips c={p.categories} t={t} full />
            {p.categories?.related_roles?.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold text-ink-3">{t("cat.related_roles")}</p>
                <p className="text-sm">{p.categories.related_roles.map(roleTitle).join(", ")}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

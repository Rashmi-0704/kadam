import Link from "next/link";
import { requireBusiness } from "@/lib/guards";
import { q } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { createDueReminders } from "@/lib/engagement";
import { PageTitle, Section, EmptyState, StatusBadge, Notice } from "@/components/ui";
import { CategoryChips, TakerCount } from "@/components/ProblemBits";

export const metadata = { title: "Dashboard" };

export default async function BusinessDashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { user, profile } = await requireBusiness();
  const t = await getT();
  const sp = await searchParams;
  const due = await createDueReminders(user.id);
  const problems = await q(
    `select p.id, p.title, p.status, p.categories, p.created_at,
            (select count(*)::int from engagements e where e.problem_id = p.id and e.status <> 'withdrawn') as takers,
            (select count(*)::int from engagements e where e.problem_id = p.id and e.status = 'submitted') as waiting
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
  const drafts = problems.filter((p) => p.status === "draft");
  const published = problems.filter((p) => p.status !== "draft");
  return (
    <div>
      <PageTitle
        eyebrow={profile.business_name}
        title={t("bd.title", { name: user.name?.split(" ")[0] ?? "" })}
        action={<Link href="/business/problems/new" className="btn-accent w-full sm:w-auto">+ {t("bd.new")}</Link>}
      />
      {sp.welcome && <Notice kind="success" className="mb-6">{t("bd.welcome")}</Notice>}

      {needsAction.length > 0 && (
        <Section title={t("bd.needs_action")}>
          <ul className="grid gap-2">
            {needsAction.map((e) => (
              <li key={e.id}>
                <Link href={`/business/engagements/${e.id}`} className="card flex items-center justify-between gap-3 border-saffron/40 bg-saffron-soft/40 p-4 hover:border-saffron">
                  <span className="min-w-0">
                    <span className="block font-bold">{e.status === "submitted" ? t("bd.review_submission", { name: e.student }) : t("bd.update_due", { name: e.student })}</span>
                    <span className="block truncate text-sm text-ink-2">{e.title}</span>
                  </span>
                  <span className="btn-primary btn-sm shrink-0">{e.status === "submitted" ? t("common.open") : t("bd.post_update")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {drafts.length > 0 && (
        <Section title={t("bd.drafts")}>
          <ul className="grid gap-2">
            {drafts.map((p) => (
              <li key={p.id}>
                <Link href={p.title ? `/business/problems/${p.id}/review` : `/business/problems/new?draft=${p.id}`} className="card flex items-center justify-between gap-3 p-4 hover:border-ink-3">
                  <span className="min-w-0 truncate font-semibold">{p.title || t("bd.untitled")}</span>
                  <StatusBadge status="draft" t={t} />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={t("bd.my_problems")}>
        {published.length === 0 ? (
          <EmptyState title={t("bd.empty_title")} body={t("bd.empty_body")} action={<Link href="/business/problems/new" className="btn-primary">{t("bd.new")}</Link>} />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {published.map((p) => (
              <li key={p.id}>
                <Link href={`/business/problems/${p.id}`} className="card flex h-full flex-col gap-3 p-5 hover:border-ink-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold leading-snug">{p.title}</h3>
                    <StatusBadge status={p.status} t={t} />
                  </div>
                  <CategoryChips c={p.categories} t={t} />
                  <div className="mt-auto flex items-center justify-between">
                    <TakerCount n={p.takers} t={t} />
                    {p.waiting > 0 && <span className="chip border-saffron/40 bg-saffron-soft text-saffron-deep">{t("bd.waiting", { n: p.waiting })}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

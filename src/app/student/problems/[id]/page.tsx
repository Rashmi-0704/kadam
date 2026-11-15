import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/guards";
import { one } from "@/lib/db";
import { getT, getLang } from "@/lib/i18n/server";
import { BackLink, Section, fmtDate } from "@/components/ui";
import { CategoryChips, ProblemStatement, TakerCount } from "@/components/ProblemBits";
import { gapsFor, liveProblems, suggestions, reasonText } from "@/lib/matching";
import { TakeUpButton } from "./TakeUpButton";
import { roleTitle } from "@/db/taxonomy";
import { RelevantRoadmaps } from "@/components/RelevantRoadmaps";

export const metadata = { title: "Problem" };

export default async function StudentProblem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, profile } = await requireStudent();
  const p = await one(
    `select p.*, b.business_name, b.city as business_city, b.type as business_type,
            (select count(*)::int from engagements e where e.problem_id = p.id and e.status <> 'withdrawn') as takers
       from problems p join business_profiles b on b.user_id = p.business_id where p.id = $1 and p.status in ('live','closed')`,
    [id],
  );
  if (!p) notFound();
  const t = await getT();
  const lang = await getLang();
  const mine = await one(`select id, status from engagements where problem_id = $1 and student_id = $2`, [id, user.id]);
  const gaps = profile.cv_parsed ? await gapsFor(user.id, profile, p) : [];
  let fit: string | null = null;
  if (profile.approved_at) {
    const m = (await suggestions(user.id, profile, await liveProblems())).get(id);
    if (m) fit = reasonText(m.reason, t);
  }
  const verified = profile.verification_status === "verified";
  const active = mine && mine.status !== "withdrawn";
  const action = (
    <div className="card space-y-3 p-5">
            {active ? (
              <>
                <p className="font-bold">{t("problem.you_are_on")}</p>
                <Link href={`/student/engagements/${mine.id}`} className="btn-primary w-full">{t("problem.open_workspace")}</Link>
              </>
            ) : p.status === "closed" ? (
              <p className="font-semibold text-ink-2">{t("problem.closed")}</p>
            ) : verified ? (
              <>
                <p className="text-sm text-ink-2">{t("problem.take_help", { business: p.business_name })}</p>
                <TakeUpButton problemId={id} />
              </>
            ) : (
              <>
                <button className="btn-primary w-full" disabled aria-describedby="lock-why">🔒 {t("problem.take_up")}</button>
                <p id="lock-why" className="text-sm text-ink-2">{t("problem.locked")} <Link href="/student/onboarding#verify" className="font-semibold underline">{t("vb.cta")}</Link></p>
              </>
            )}
          </div>
  );
  return (
    <div>
      <BackLink href="/student/problems" label={t("nav.problems")} />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="font-semibold text-ink-3">{p.business_name} · {p.business_city}</p>
          <h1 className="mt-1 text-[28px] leading-tight font-bold sm:text-[34px]">{p.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <TakerCount n={p.takers} t={t} />
            <span className="text-sm text-ink-3">{t("problem.posted", { date: fmtDate(p.live_at ?? p.created_at, lang) })}</span>
          </div>
          <div className="mt-4"><CategoryChips c={p.categories} t={t} full /></div>
          {fit && (
            <p className="mt-5 flex gap-2 rounded-2xl bg-saffron-soft px-4 py-3">
              <span aria-hidden="true" className="font-bold text-saffron-deep">✦</span>
              <span><strong>{t("problem.why_you")}</strong> {fit}</span>
            </p>
          )}
          <div className="mt-5 lg:hidden">{action}</div>
          <Section title={t("bp.statement")} className="mt-8">
            <div className="card px-5 py-2"><ProblemStatement p={p} t={t} /></div>
          </Section>
          <RelevantRoadmaps roles={p.categories?.related_roles ?? []} skills={p.categories?.skills ?? []} t={t} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="hidden lg:block">{action}</div>
          <div className="card p-5">
            <h2 className="font-bold">{t("problem.brush_up")}</h2>
            {!profile.cv_parsed ? (
              <p className="mt-2 text-sm text-ink-2">{t("problem.brush_up_need_cv")} <Link href="/student/profile" className="font-semibold underline">{t("problems.build_profile")}</Link></p>
            ) : gaps.length === 0 ? (
              <p className="mt-2 text-sm text-ink-2">{t("problem.brush_up_none")}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {gaps.map((g) => (
                  <li key={g.skill}>
                    <Link href={g.href} className="group block rounded-xl border border-line bg-paper p-3 hover:border-ink-3">
                      <span className="flex items-center justify-between font-semibold">{g.skill}<span aria-hidden="true" className="text-ink-3 group-hover:text-ink">→</span></span>
                      <span className="text-sm text-ink-2">{g.why}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {(p.categories?.related_roles ?? []).length > 0 && (
            <div className="card p-5">
              <h2 className="mb-2 font-bold">{t("cat.related_roles")}</h2>
              <div className="flex flex-wrap gap-1.5">
                {(p.categories.related_roles as string[]).map((r) => <Link key={r} href={`/student/roadmaps/${r}`} className="chip min-h-8 hover:border-ink">{roleTitle(r)}</Link>)}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

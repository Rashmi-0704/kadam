import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { one } from "@/lib/db";
import { getT, getLang } from "@/lib/i18n/server";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { fmtDate } from "@/components/ui";
import { ReportActions } from "./ReportActions";

// Public page: shows the latest report version and nothing else about the student or business.
async function load(token: string) {
  if (!/^[a-z0-9]{8,64}$/i.test(token)) return null;
  return one(
    `select r.version, r.summary, r.outcomes, r.skills_demonstrated, r.timeline, r.resume_bullets, r.generated_at,
            p.title, s.name as student_name, b.business_name, b.city, e.status
       from impact_reports r
       join engagements e on e.id = r.engagement_id
       join problems p on p.id = e.problem_id
       join users s on s.id = e.student_id
       join business_profiles b on b.user_id = p.business_id
      where r.share_token = $1 order by r.version desc limit 1`,
    [token],
  );
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const r = await load((await params).token);
  return r ? { title: `${r.student_name} · Impact report`, description: r.title, robots: { index: false } } : { title: "Impact report" };
}

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await load(token);
  if (!r) notFound();
  const t = await getT();
  const lang = await getLang();
  const outcomes = r.outcomes as { label: string; value: string }[];
  const timeline = r.timeline as { date: string; event: string }[];
  return (
    <div className="min-h-dvh">
      <header className="no-print mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
        <Link href="/"><Logo /></Link>
        <LanguageToggle compact />
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16">
        <article className="print-card card overflow-hidden">
          <div className="relative bg-ink px-6 pt-7 pb-8 text-paper sm:px-10">
            <div className="absolute top-6 right-6 hidden items-end gap-1 sm:flex print:flex" aria-hidden="true">
              <span className="h-4 w-3 rounded-sm bg-saffron/60" /><span className="h-7 w-3 rounded-sm bg-saffron/80" /><span className="h-10 w-3 rounded-sm bg-saffron" />
            </div>
            <p className="eyebrow text-saffron">{t("report.eyebrow")}</p>
            <h1 className="mt-2 max-w-xl text-[28px] leading-tight font-bold sm:text-[34px]">{r.title}</h1>
            <p className="mt-3 text-paper/80">
              <span className="font-semibold text-paper">{r.student_name}</span> · {t("report.for", { business: r.business_name, city: r.city })}
            </p>
            <p className="mt-1 text-sm text-paper/60">{t("report.version", { v: r.version, date: fmtDate(r.generated_at, lang) })}{r.status === "in_use" ? ` · ${t("status.in_use")}` : ""}</p>
          </div>

          <div className="space-y-9 px-6 py-8 sm:px-10">
            <section>
              <h2 className="eyebrow mb-2">{t("report.summary")}</h2>
              <p className="text-lg leading-relaxed">{r.summary}</p>
            </section>

            {outcomes.length > 0 && (
              <section>
                <h2 className="eyebrow mb-3">{t("report.outcomes")}</h2>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {outcomes.map((o) => (
                    <div key={o.label} className="rounded-2xl border border-line bg-paper p-4">
                      <dt className="text-sm text-ink-3">{o.label}</dt>
                      <dd className="mt-1 font-display text-xl leading-snug font-bold">{o.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section className="rounded-2xl bg-saffron-soft p-5 sm:p-6">
              <h2 className="eyebrow mb-3">{t("report.bullets")}</h2>
              <ul className="space-y-2.5">
                {(r.resume_bullets as string[]).map((b) => (
                  <li key={b} className="flex gap-3"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron-deep" /><span>{b}</span></li>
                ))}
              </ul>
              <div className="no-print mt-4"><ReportActions bullets={(r.resume_bullets as string[]).join("\n")} mode="bullets" /></div>
            </section>

            {(r.skills_demonstrated as string[]).length > 0 && (
              <section>
                <h2 className="eyebrow mb-3">{t("report.skills")}</h2>
                <div className="flex flex-wrap gap-2">{(r.skills_demonstrated as string[]).map((s) => <span key={s} className="chip px-3 py-1.5 text-sm">{s}</span>)}</div>
              </section>
            )}

            {timeline.length > 0 && (
              <section>
                <h2 className="eyebrow mb-3">{t("report.timeline")}</h2>
                <ol className="relative space-y-3 border-l-2 border-line pl-5">
                  {timeline.map((x, i) => (
                    <li key={i} className="relative">
                      <span className="absolute top-1.5 -left-[27px] h-3 w-3 rounded-full border-2 border-card bg-saffron" aria-hidden="true" />
                      <p className="text-xs text-ink-3">{fmtDate(x.date, lang)}</p>
                      <p>{x.event}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
          <footer className="flex items-center justify-between gap-3 border-t border-line px-6 py-4 text-xs text-ink-3 sm:px-10">
            <span>{t("report.footer")}</span>
            <span className="font-display font-bold text-ink">Kadam</span>
          </footer>
        </article>
        <div className="no-print mt-6"><ReportActions mode="page" /></div>
      </main>
    </div>
  );
}

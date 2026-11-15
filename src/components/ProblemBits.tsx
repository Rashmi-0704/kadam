import Link from "next/link";
import type { T } from "@/lib/i18n/config";
import { roleTitle } from "@/db/taxonomy";

type Cat = { sector?: string; problem_type?: string; skills?: string[]; difficulty?: string; time_needed?: string; work_mode?: string; city?: string; related_roles?: string[] };

export function CategoryChips({ c, t, full = false }: { c: Cat; t: T; full?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {c.problem_type && <span className="chip border-transparent bg-indigo-soft text-indigo">{t(`ptype.${c.problem_type}`)}</span>}
      {c.sector && <span className="chip">{t(`sector.${c.sector}`)}</span>}
      {c.difficulty && <span className="chip">{t(`diff.${c.difficulty}`)}</span>}
      {c.time_needed && <span className="chip">{t(`time.${c.time_needed}`)}</span>}
      {c.work_mode && <span className="chip">{t(`mode.${c.work_mode}`)}{c.work_mode !== "remote" && c.city ? ` · ${c.city}` : ""}</span>}
      {full && c.skills?.map((s) => <span key={s} className="chip border-dashed">{s}</span>)}
    </div>
  );
}

export function ProblemStatement({ p, t }: { p: Record<string, string | null>; t: T }) {
  const rows = ["background", "current_process", "problem", "desired_outcome", "constraints", "expected_timeline", "resources_provided"] as const;
  return (
    <dl className="divide-y divide-line">
      {rows.filter((r) => p[r]).map((r) => (
        <div key={r} className="grid gap-1 py-3.5 sm:grid-cols-[180px_1fr] sm:gap-4">
          <dt className="text-sm font-semibold text-ink-3">{t(`field.${r}`)}</dt>
          <dd className={r === "problem" ? "font-medium" : "text-ink-2"}>{p[r]}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TakerCount({ n, t }: { n: number; t: T }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-2">
      <span className="flex -space-x-1.5" aria-hidden="true">
        {Array.from({ length: Math.min(3, Math.max(1, n)) }).map((_, i) => (
          <span key={i} className={`h-5 w-5 rounded-full border-2 border-card ${n === 0 ? "bg-sand" : ["bg-saffron", "bg-indigo", "bg-leaf"][i]}`} />
        ))}
      </span>
      {n === 0 ? t("problem.takers_0") : n === 1 ? t("problem.takers_1") : t("problem.takers_n", { n })}
    </span>
  );
}

export function ProblemCard({
  p,
  t,
  href,
  fit,
}: {
  p: { id: string; title: string; business_name: string; city?: string; categories: Cat; takers: number; status?: string };
  t: T;
  href: string;
  fit?: string | null;
}) {
  return (
    <Link href={href} className="card group flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-ink-3 hover:shadow-[0_12px_30px_-20px_rgba(28,26,39,0.5)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-3">{p.business_name}</p>
          <h3 className="mt-0.5 text-lg leading-snug font-bold group-hover:underline group-hover:decoration-saffron group-hover:decoration-2 group-hover:underline-offset-4">{p.title}</h3>
        </div>
        {p.status === "closed" && <span className="chip shrink-0">{t("status.closed")}</span>}
      </div>
      <CategoryChips c={p.categories} t={t} />
      {fit && (
        <p className="flex gap-2 rounded-xl bg-saffron-soft px-3 py-2 text-sm text-ink">
          <span aria-hidden="true" className="font-bold text-saffron-deep">✦</span>
          <span>{fit}</span>
        </p>
      )}
      <div className="mt-auto flex items-center justify-between pt-1">
        <TakerCount n={p.takers} t={t} />
        {p.categories.related_roles?.[0] && <span className="text-xs text-ink-3">{roleTitle(p.categories.related_roles[0])}</span>}
      </div>
    </Link>
  );
}

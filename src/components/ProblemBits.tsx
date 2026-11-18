import Link from "next/link";
import type { T } from "@/lib/i18n/config";
import type { Row } from "@/lib/db";
import { roleTitle } from "@/db/taxonomy";
import { reasonParts, isNewProblem } from "@/lib/reason";
import { HighlightPill } from "@/components/motion/Highlight";

type Cat = { sector?: string; problem_type?: string; skills?: string[]; difficulty?: string; time_needed?: string; work_mode?: string; city?: string; related_roles?: string[] };

export function CategoryChips({ c, t, full = false }: { c: Cat; t: T; full?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {c.problem_type && <span className="chip border-transparent bg-info-soft text-info">{t(`ptype.${c.problem_type}`)}</span>}
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

/** Taker status: a dot whose colour changes with the count, and a label that always states the count. */
export function TakerCount({ n, t }: { n: number; t: T }) {
  const dot = n === 0 ? "var(--color-success)" : n <= 2 ? "var(--color-amber)" : "var(--color-alert)";
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-2">
      {n === 0 ? (
        <span className="pulse-dot" style={{ "--dot": dot } as React.CSSProperties} aria-hidden="true" />
      ) : (
        <span className="flex items-center -space-x-1.5" aria-hidden="true">
          <span className="relative z-10 mr-2 h-2.5 w-2.5 rounded-full ring-2 ring-card" style={{ background: dot }} />
          {Array.from({ length: Math.min(3, n) }).map((_, i) => (
            <span key={i} className={`h-5 w-5 rounded-full border-2 border-card ${["bg-primary", "bg-glow", "bg-highlight"][i]}`} />
          ))}
        </span>
      )}
      {n === 0 ? <span className="font-semibold text-success-ink">{t("problem.be_first")}</span> : n === 1 ? t("problem.takers_1") : t("problem.takers_n", { n })}
    </span>
  );
}

/** Coral "New" badge with a soft pulse, for problems that went live in the last 7 days. */
export function NewBadge({ liveAt, t }: { liveAt?: string | Date | null; t: T }) {
  if (!isNewProblem(liveAt)) return null;
  return (
    <span className="new-badge shrink-0">
      <span className="pulse-dot" style={{ "--dot": "var(--color-highlight)" } as React.CSSProperties} aria-hidden="true" />
      {t("problem.new")}
    </span>
  );
}

const PATH_CHIP: Record<string, string> = {
  now: "bg-success-soft text-success-ink",
  pivot: "bg-info-soft text-info",
  stretch: "bg-highlight-soft text-highlight-deep",
};

/** The AI fit reason ("✦ box"): the role is a highlighted pill and the path gets its own chip. */
export function FitReason({ reason, t, className = "" }: { reason: string; t: T; className?: string }) {
  const r = reasonParts(reason, t);
  if (r.kind === "text" && !r.text) return null;
  return (
    <div className={`glow-card flex gap-2 rounded-xl border-2 border-primary/15 bg-primary-soft px-3 py-2.5 text-sm text-ink ${className}`}>
      <span aria-hidden="true" className="font-bold text-highlight-deep">✦</span>
      {r.kind === "path" ? (
        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${PATH_CHIP[r.path]}`}>{t(`path.${r.path}`)}</span>
          {r.before && <span>{r.before.trim()}</span>}
          <HighlightPill>{r.role}</HighlightPill>
          {r.after.trim() && <span>{r.after.trim()}</span>}
          {r.extra && <span className="w-full text-ink-2">{r.extra}</span>}
        </span>
      ) : r.kind === "ai" ? (
        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${PATH_CHIP[r.path]}`}>{t(`path.${r.path}`)}</span>
          <HighlightPill>{r.role}</HighlightPill>
          <span className="w-full">{r.text}</span>
        </span>
      ) : (
        <span>{r.text}</span>
      )}
    </div>
  );
}

export function ProblemCard({
  p,
  t,
  href,
  fit,
  reason,
  index = 0,
  takeUp = false,
  mineId = null,
}: {
  p: Row;
  t: T;
  href: string;
  /** Plain text fit reason (older callers). */
  fit?: string | null;
  /** Raw match reason; rendered with the highlighted role pill. */
  reason?: string | null;
  index?: number;
  /** Student lists: show the small "Take up" button (hidden for problems that aren't live). */
  takeUp?: boolean;
  /** This student's active engagement on the problem: the button becomes "Open". */
  mineId?: string | null;
}) {
  const role = p.categories.related_roles?.[0] ? roleTitle(p.categories.related_roles[0]) : null;
  const button = takeUp && p.status === "live";
  // No nested links: the title is the card's link (stretched over the card with ::after); the button is its own link above it.
  return (
    <div className="glow-card card-tap group relative flex h-full flex-col gap-3 p-5 has-[a:focus-visible]:ring-4 has-[a:focus-visible]:ring-primary/25" style={{ "--glow-delay": `${-(index * 3.7) % 18}s` } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-3">{p.business_name}</p>
          <h3 className="mt-0.5 text-lg leading-snug font-bold">
            <Link href={href} className="after:absolute after:inset-0 after:z-0 after:content-[''] focus-visible:outline-none group-hover:underline group-hover:decoration-primary group-hover:decoration-2 group-hover:underline-offset-4">{p.title}</Link>
          </h3>
        </div>
        {p.status === "closed" ? <span className="chip shrink-0">{t("status.closed")}</span> : <NewBadge liveAt={p.live_at} t={t} />}
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <CategoryChips c={p.categories} t={t} />
        {button && role && <span className="text-xs text-ink-3">{role}</span>}
      </div>
      {reason ? <FitReason reason={reason} t={t} /> : fit ? <FitReason reason={fit} t={t} /> : null}
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <TakerCount n={p.takers} t={t} />
        {button ? (
          <Link href={mineId ? `/student/engagements/${mineId}` : `${href}?takeup=1`} className="btn-primary btn-sm relative z-10 min-h-11 shrink-0 px-5">
            {mineId ? "Open" : "Take up"}
          </Link>
        ) : (
          role && <span className="text-xs text-ink-3">{role}</span>
        )}
      </div>
    </div>
  );
}

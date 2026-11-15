import Link from "next/link";
import type { T } from "@/lib/i18n/config";

export function Notice({ kind = "info", children, className = "" }: { kind?: "info" | "error" | "success" | "warn"; children: React.ReactNode; className?: string }) {
  const styles = {
    info: "bg-indigo-soft text-indigo border-indigo/15",
    error: "bg-clay-soft text-clay border-clay/20",
    success: "bg-leaf-soft text-leaf border-leaf/20",
    warn: "bg-saffron-soft text-saffron-deep border-saffron/25",
  }[kind];
  return <div role={kind === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles} ${className}`}>{children}</div>;
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-10 text-center">
      <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
        <rect x="6" y="30" width="10" height="10" rx="2" fill="#f3ece0" />
        <rect x="19" y="22" width="10" height="18" rx="2" fill="#fcebd5" />
        <rect x="32" y="12" width="10" height="28" rx="2" fill="#f5a025" />
      </svg>
      <h3 className="text-lg font-bold">{title}</h3>
      {body && <p className="max-w-sm text-ink-2">{body}</p>}
      {action}
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-1 py-6 text-ink-2" role="status">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-saffron border-r-transparent" />
      {label}
    </div>
  );
}

const BADGE: Record<string, string> = {
  taken_up: "bg-indigo-soft text-indigo",
  in_progress: "bg-indigo-soft text-indigo",
  submitted: "bg-saffron-soft text-saffron-deep",
  received: "bg-saffron-soft text-saffron-deep",
  needs_changes: "bg-saffron-soft text-saffron-deep",
  accepted: "bg-leaf-soft text-leaf",
  in_use: "bg-leaf text-white",
  rejected: "bg-clay-soft text-clay",
  withdrawn: "bg-sand text-ink-3",
  draft: "bg-sand text-ink-2",
  live: "bg-leaf-soft text-leaf",
  closed: "bg-sand text-ink-3",
  pending: "bg-saffron-soft text-saffron-deep",
  verified: "bg-leaf-soft text-leaf",
  not_started: "bg-sand text-ink-2",
};

export function StatusBadge({ status, t }: { status: string; t: T }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${BADGE[status] ?? "bg-sand text-ink-2"}`}>
      {status === "in_use" && <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
      {t(`status.${status}`)}
    </span>
  );
}

export function PageTitle({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="text-[28px] leading-tight font-bold sm:text-[34px]">{title}</h1>
        {sub && <p className="mt-1.5 max-w-2xl text-ink-2">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-ink-2 hover:text-ink">
      <span aria-hidden="true">←</span> {label}
    </Link>
  );
}

export function Section({ title, children, className = "", action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={`mb-8 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function fmtDate(d: unknown, lang: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  const date = d instanceof Date ? d : new Date(String(d));
  if (isNaN(date.getTime())) return String(d ?? "");
  try {
    return new Intl.DateTimeFormat(lang === "en" ? "en-IN" : `${lang}-IN`, opts).format(date);
  } catch {
    return date.toDateString();
  }
}

export function timeAgo(d: unknown, t: T) {
  const date = d instanceof Date ? d : new Date(String(d));
  const s = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (s < 60) return t("time.now");
  if (s < 3600) return t("time.min", { n: Math.floor(s / 60) });
  if (s < 86400) return t("time.hour", { n: Math.floor(s / 3600) });
  return t("time.day", { n: Math.floor(s / 86400) });
}

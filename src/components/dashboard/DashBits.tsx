import Link from "next/link";

/* Shared building blocks for the student and business dashboards (round 3). Light theme, tokens only. */

/** Two columns on laptop (main ~2/3, side ~1/3), one column on phones in source order. */
export function DashColumns({ main, side }: { main: React.ReactNode; side: React.ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
      <div className="min-w-0 space-y-10 lg:col-span-2">{main}</div>
      <aside className="min-w-0 space-y-8">{side}</aside>
    </div>
  );
}

export function DashSection({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Taken → Working → Submitted → … with the current step highlighted. `current` -1 = none (withdrawn). */
export function ProgressLine({ steps, current, done = false, label }: { steps: string[]; current: number; done?: boolean; label: string }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs font-semibold" aria-label={label}>
      {steps.map((s, i) => {
        const past = i < current || (done && i === current);
        const now = i === current;
        return (
          <li key={s} className="flex items-center gap-1" aria-current={now ? "step" : undefined}>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${now ? "bg-primary text-white" : past ? "bg-primary-soft text-primary-deep" : "bg-mist text-ink-3"}`}>
              {past && !now ? <span aria-hidden="true">✓</span> : <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${now ? "bg-white" : "bg-ink-3/50"}`} />}
              {s}
            </span>
            {i < steps.length - 1 && <span aria-hidden="true" className={`h-0.5 w-3 rounded ${i < current ? "bg-primary/50" : "bg-line"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

const EMPTY_ICONS = {
  problems: <><rect x="10" y="14" width="44" height="36" rx="6" fill="#eef0ff" /><path d="M18 26h28M18 34h20M18 42h12" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" /><circle cx="48" cy="44" r="9" fill="#ff6b4a" /><path d="M44.5 44h7M48 40.5v7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /></>,
  report: <><path d="M16 8h22l10 10v38H16z" fill="#eef0ff" /><path d="M38 8v10h10" fill="#c7d2fe" /><rect x="22" y="38" width="5" height="10" rx="1.5" fill="#a5b4fc" /><rect x="30" y="32" width="5" height="16" rx="1.5" fill="#818cf8" /><rect x="38" y="26" width="5" height="22" rx="1.5" fill="#ff6b4a" /></>,
  path: <><path d="M8 52h12V40h12V28h12V16h12" fill="none" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M52 16V4" stroke="#151a30" strokeWidth="2.5" /><path d="M52 5h9l-3 4 3 4h-9z" fill="#ff6b4a" /></>,
  roadmap: <><circle cx="32" cy="32" r="20" fill="none" stroke="#eef0ff" strokeWidth="7" /><path d="M32 12a20 20 0 0 1 17 30" fill="none" stroke="#4338ca" strokeWidth="7" strokeLinecap="round" /><circle cx="32" cy="32" r="5" fill="#ff6b4a" /></>,
  activity: <><circle cx="32" cy="32" r="22" fill="#eef0ff" /><path d="M32 18v15l9 6" stroke="#4338ca" strokeWidth="4" strokeLinecap="round" fill="none" /><circle cx="50" cy="14" r="6" fill="#ff6b4a" /></>,
  inbox: <><path d="M10 34l8-20h28l8 20v16H10z" fill="#eef0ff" /><path d="M10 34h14l3 6h10l3-6h14" fill="none" stroke="#818cf8" strokeWidth="3" strokeLinejoin="round" /><circle cx="46" cy="16" r="6" fill="#16a34a" /><path d="M43.5 16l2 2 3.5-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></>,
  impact: <><path d="M10 50h44" stroke="#c8cee2" strokeWidth="3" strokeLinecap="round" /><path d="M14 44l12-12 9 7 17-19" fill="none" stroke="#4338ca" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="52" cy="20" r="6" fill="#ff6b4a" /></>,
} as const;

/** Friendly illustrated empty state: icon, title, one line, one button. */
export function EmptyCard({ icon, title, body, action }: { icon: keyof typeof EMPTY_ICONS; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-8 text-center">
      <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden="true">{EMPTY_ICONS[icon]}</svg>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="max-w-sm text-ink-2">{body}</p>
      {action}
    </div>
  );
}

/** The one "Your next step" card. Always shown; one big button. */
export function NextStepCard({ eyebrow, title, body, href, cta }: { eyebrow: string; title: string; body?: string; href: string; cta: string }) {
  return (
    <div className="glow-card card mb-6 flex flex-col gap-4 border-primary/40 bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex min-w-0 items-start gap-4">
        <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4v-5h4v-5h4V5h4" /></svg>
        </span>
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-1 text-xl leading-snug font-bold">{title}</h2>
          {body && <p className="mt-1 text-ink-2">{body}</p>}
        </div>
      </div>
      <Link href={href} className="btn-primary min-h-14 shrink-0 px-8 text-base">{cta} <span aria-hidden="true">→</span></Link>
    </div>
  );
}

export function Initials({ name }: { name: string | null | undefined }) {
  const ini = (name ?? "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";
  return <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-lg font-extrabold text-primary-deep" aria-hidden="true">{ini}</span>;
}

/** Welcome banner: soft gradient card with a slow glow, greeting, one status line and a small decorative scene. */
export function WelcomeBanner({ greeting, status, tone, art }: { greeting: string; status: string; tone: "student" | "business"; art: "steps" | "shop" }) {
  const bg = tone === "student" ? "from-primary-soft via-[#e9ebff] to-[#dfe3ff]" : "from-highlight-soft via-[#fdf1f4] to-[#e4e7ff]";
  return (
    <div className={`glow-card relative mb-6 overflow-hidden rounded-[24px] border-2 border-line bg-gradient-to-br ${bg} p-6 sm:p-8`}>
      <div className="relative z-10 pr-20 sm:max-w-[65%] sm:pr-0">
        <h1 className="text-[28px] leading-tight font-extrabold sm:text-[36px]">{greeting}</h1>
        <p className="mt-2 text-base font-semibold text-ink-2 sm:text-lg">{status}</p>
      </div>
      <svg viewBox="0 0 220 140" className="pointer-events-none absolute right-2 bottom-0 h-16 w-auto sm:right-6 sm:h-[78%] sm:max-h-36" aria-hidden="true">
        {art === "steps" ? (
          <>
            {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={20 + i * 36} y={120 - 18 - i * 18} width="32" height={18 + i * 18} rx="5" fill={i === 4 ? "#ff6b4a" : i % 2 ? "#6366f1" : "#4338ca"} opacity={0.9} />)}
            <path d="M178 30V2" stroke="#151a30" strokeWidth="3" strokeLinecap="round" />
            <path d="M179 3h24l-6 7 6 7h-24z" fill="#ff6b4a" />
            <circle cx="150" cy="44" r="7" fill="#c98a5a" />
            <rect x="144" y="52" width="12" height="16" rx="4" fill="#151a30" />
          </>
        ) : (
          <>
            <rect x="40" y="56" width="140" height="70" rx="6" fill="#ffffff" stroke="#c8cee2" strokeWidth="2" />
            <path d="M32 56h156l-10-24H42z" fill="#ff6b4a" />
            {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${32 + i * 26} 56q13 14 26 0`} fill="#ffb4a2" />)}
            <rect x="58" y="74" width="38" height="30" rx="4" fill="#c7d2fe" />
            <rect x="124" y="74" width="38" height="52" rx="4" fill="#4338ca" />
            <rect x="80" y="16" width="60" height="16" rx="5" fill="#eef0ff" stroke="#818cf8" strokeWidth="1.5" />
          </>
        )}
      </svg>
    </div>
  );
}

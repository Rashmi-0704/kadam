import Link from "next/link";
import { CountUp } from "./scene/Motion";

export type Insight = { label: string; value: number; suffix?: string; hint?: string; href?: string; tone: "ink" | "saffron" | "leaf" | "indigo"; icon: React.ReactNode };

const TONE: Record<Insight["tone"], string> = {
  ink: "bg-ink text-paper",
  saffron: "bg-saffron text-ink",
  leaf: "bg-leaf text-white",
  indigo: "bg-indigo text-white",
};

/** Big, glanceable numbers at the top of a dashboard. */
export function InsightTiles({ items }: { items: Insight[] }) {
  return (
    <ul className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((it) => {
        const inner = (
          <>
            <span className="pointer-events-none absolute -right-6 -bottom-8 opacity-15" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-28 w-28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{it.icon}</svg>
            </span>
            <span className="relative flex items-center gap-2 text-sm font-semibold opacity-85">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{it.icon}</svg>
              {it.label}
            </span>
            <span className="relative mt-2 block font-display text-4xl leading-none font-extrabold sm:text-5xl">
              <CountUp value={`${it.value}${it.suffix ?? ""}`} />
            </span>
            {it.hint && <span className="relative mt-2 block text-xs font-medium opacity-80">{it.hint}</span>}
          </>
        );
        const cls = `relative block h-full overflow-hidden rounded-2xl p-4 sm:p-5 ${TONE[it.tone]}`;
        return (
          <li key={it.label}>
            {it.href ? <Link href={it.href} className={`${cls} transition hover:-translate-y-0.5`}>{inner}</Link> : <div className={cls}>{inner}</div>}
          </li>
        );
      })}
    </ul>
  );
}

export const ICONS = {
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  report: <><path d="M6 3h9l3 3v15H6z" /><path d="M9 13h6M9 17h4M9 9h3" /></>,
  steps: <path d="M4 20h4v-5h4v-5h4V5h4" />,
  people: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 14.5c3 0 5.5 1.5 5.5 4.5" /></>,
  inbox: <><path d="M3 13h5l1 3h6l1-3h5" /><path d="M5 5h14l2 8v6H3v-6z" /></>,
  live: <><circle cx="12" cy="12" r="3" /><path d="M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" /></>,
};

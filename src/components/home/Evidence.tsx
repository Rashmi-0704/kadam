import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { SkillBars } from "./SkillBars";
import { EVIDENCE as E } from "@/db/evidence-data";

/** Landing page: how many students have worked, and what changed for the businesses. Data lives in db/evidence-data.ts. */
export function Evidence() {
  return (
    <section className="border-y-2 border-line bg-primary-soft/70" aria-labelledby="ev-title">
      <Reveal className="mx-auto max-w-6xl px-4 py-20">
        <p data-reveal className="eyebrow">Evidence</p>
        <h2 data-reveal id="ev-title" className="mt-2 max-w-3xl text-[32px] leading-tight font-bold sm:text-[44px]">{E.title}</h2>
        <p data-reveal className="mt-3 text-lg text-ink-2">{E.sub}</p>

        <dl className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {E.stats.map((s) => (
            <div key={s.label} data-reveal className="glow-card card flex flex-col-reverse p-5">
              <dt className="mt-1 text-sm text-ink-2">{s.label}</dt>
              <dd className="font-display text-4xl font-extrabold text-primary-deep sm:text-5xl"><CountUp value={s.value} /></dd>
            </div>
          ))}
        </dl>
        <p data-reveal className="mt-4 text-ink-2">{E.reach}</p>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <ul className="grid gap-3 sm:grid-cols-2">
            {E.results.map((r, i) => (
              <li key={r.business} data-reveal className="glow-card card flex flex-col p-5" style={{ "--glow-delay": `${-i * 4}s` } as React.CSSProperties}>
                <p className="text-sm font-semibold text-ink-3">{r.business} · {r.city}</p>
                <p className="mt-3 font-display text-3xl font-extrabold">
                  {r.before ? <>{r.before} <span className="text-highlight-deep" aria-label="to">→</span> {r.after}</> : r.after}
                </p>
                <p className="text-sm font-semibold text-ink-2">{r.unit}</p>
                <p className="mt-3 text-sm">{r.made}</p>
                <p className="mt-auto pt-3 text-xs font-bold text-primary-deep">{r.student}</p>
              </li>
            ))}
          </ul>
          <div data-reveal><SkillBars title={E.skillsTitle} items={E.skills} /></div>
        </div>
        <p className="mt-8 text-xs text-ink-3">{E.footnote}</p>
      </Reveal>
    </section>
  );
}

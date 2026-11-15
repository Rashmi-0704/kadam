"use client";
import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { toggleRoadmapStep } from "@/app/actions/student";
import { useT } from "@/lib/i18n/client";
import type { RoadmapStep } from "@/db/roadmaps-data";

export function RoadmapView({ role, steps, initialDone }: { role: string; steps: RoadmapStep[]; initialDone: string[] }) {
  const t = useT();
  const [, start] = useTransition();
  const [done, setDone] = useOptimistic(initialDone, (cur: string[], a: { id: string; on: boolean }) => (a.on ? [...cur, a.id] : cur.filter((x) => x !== a.id)));
  const total = steps.length;
  const pct = total ? Math.round((done.length / total) * 100) : 0;
  const toggle = (id: string, on: boolean) =>
    start(async () => {
      setDone({ id, on });
      await toggleRoadmapStep(role, id, on);
    });
  return (
    <div>
      <div className="card mb-6 p-4">
        <div className="flex items-center justify-between text-sm font-semibold"><span>{t("rm.progress", { done: done.length, total })}</span><span>{pct}%</span></div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sand"><div className="h-full rounded-full bg-saffron transition-all" style={{ width: `${pct}%` }} /></div>
      </div>
      <ol className="relative">
        {[...steps].sort((a, b) => a.order - b.order).map((s, i) => {
          const on = done.includes(s.id);
          return (
            <li key={s.id} id={s.id} className="relative scroll-mt-24 pb-5 pl-14 target:[&>div]:border-saffron target:[&>div]:ring-2 target:[&>div]:ring-saffron/30">
              {i < steps.length - 1 && <span className={`absolute top-10 bottom-0 left-[19px] w-0.5 ${on ? "bg-leaf" : "bg-line"}`} aria-hidden="true" />}
              <button
                type="button"
                onClick={() => toggle(s.id, !on)}
                aria-pressed={on}
                aria-label={on ? t("rm.mark_undone", { step: s.title }) : t("rm.mark_done", { step: s.title })}
                className={`absolute top-0 left-0 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition ${on ? "border-leaf bg-leaf text-white" : "border-line bg-card text-ink-2 hover:border-ink"}`}
              >
                {on ? "✓" : s.order}
              </button>
              <div className={`card p-4 ${on ? "bg-leaf-soft/30" : ""}`}>
                <h3 className="font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-2">{s.description}</p>
                {s.resources.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {s.resources.map((r) => (
                      <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer" className="chip min-h-9 border-indigo/20 bg-indigo-soft text-indigo hover:border-indigo">{r.title} ↗</a></li>
                    ))}
                  </ul>
                )}
                {/kadam/i.test(s.title + s.description) && (
                  <Link href="/student/problems?tab=suggested" className="mt-3 inline-block text-sm font-semibold underline underline-offset-2">{t("rm.find_problem")}</Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

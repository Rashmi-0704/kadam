"use client";
import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";

export type FaqItem = { q: string; a: string };

/** FAQ with Students / Businesses tabs and expandable questions. Text comes from the page (translated there). */
export function FaqTabs({ title, tabs, initial = 0 }: { title: string; tabs: { label: string; items: FaqItem[] }[]; initial?: number }) {
  const [tab, setTab] = useState(initial);
  return (
    <Reveal as="section" className="mx-auto max-w-3xl px-4 py-20" aria-labelledby="faq-title">
      <h2 data-reveal id="faq-title" className="text-center text-[32px] leading-tight font-bold sm:text-[40px]">{title}</h2>
      <div role="tablist" aria-label={title} className="mx-auto mt-8 grid w-full max-w-sm grid-cols-2 gap-1 rounded-2xl border-2 border-line bg-card p-1">
        {tabs.map((t, i) => (
          <button key={t.label} id={`faq-tab-${i}`} type="button" role="tab" aria-selected={tab === i} aria-controls={`faq-panel-${i}`} onClick={() => setTab(i)}
            className={`min-h-11 rounded-xl text-sm font-bold transition ${tab === i ? "bg-primary text-white shadow-[0_3px_0_var(--color-primary-edge)]" : "text-ink-2 hover:bg-mist"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.label} id={`faq-panel-${i}`} role="tabpanel" aria-labelledby={`faq-tab-${i}`} hidden={tab !== i} className="mt-8 space-y-3">
          {t.items.map((it) => (
            <details key={it.q} data-reveal={i === initial ? "" : undefined} className="group card p-0">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold [&::-webkit-details-marker]:hidden">
                <span>{it.q}</span>
                <span aria-hidden="true" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg text-primary-deep transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="px-5 pb-5 text-ink-2">{it.a}</p>
            </details>
          ))}
        </div>
      ))}
    </Reveal>
  );
}

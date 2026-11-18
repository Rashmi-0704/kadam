"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Horizontal indigo bars that grow from 0 (scaleX only) the first time they are visible. Reduced motion: drawn at full length. */
export function SkillBars({ title, items }: { title: string; items: readonly { label: string; n: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const max = Math.max(...items.map((i) => i.n));
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const bars = gsap.utils.toArray<HTMLElement>(".sb-bar");
        gsap.set(bars, { scaleX: 0 });
        const tl = gsap.to(bars, { scaleX: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, paused: true });
        const st = ScrollTrigger.create({ trigger: ref.current, start: "top 85%", once: true, onEnter: () => tl.play() });
        const safety = window.setTimeout(() => tl.progress(1), 6000);
        return () => { window.clearTimeout(safety); st.kill(); tl.kill(); gsap.set(bars, { clearProps: "transform" }); };
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="glow-card card p-5 sm:p-6">
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((s) => (
          <li key={s.label} className="grid grid-cols-[8.5rem_1fr_2rem] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_2rem]">
            <span className="font-semibold text-ink-2">{s.label}</span>
            <span className="h-3 overflow-hidden rounded-full bg-primary-soft" aria-hidden="true">
              <span className="sb-bar block h-full origin-left rounded-full bg-primary" style={{ width: `${(s.n / max) * 100}%` }} />
            </span>
            <span className="text-right font-display font-bold tabular-nums">{s.n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

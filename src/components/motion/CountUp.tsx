"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Number that counts from 0 to its value over 1.2 s (ease-out) the first time it is visible.
 * Keeps any prefix or suffix (₹, %, +, " → 81") and Indian digit grouping at every step.
 * "0" never counts. Reduced motion: the real value straight away. A safety timer always lands on it.
 */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!m) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ""));
    if (!Number.isFinite(target) || target === 0) return;
    const decimals = (num.split(".")[1] ?? "").length;
    const fmt = (v: number) => `${pre}${v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${post}`;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const o = { v: 0 };
      let started = false;
      el.textContent = fmt(0);
      const tween = gsap.to(o, {
        v: target, duration: 1.2, ease: "power2.out", paused: true,
        onUpdate: () => { el.textContent = fmt(o.v); },
        onComplete: () => { el.textContent = value; },
      });
      const go = () => { if (!started) { started = true; tween.play(); } };
      const st = ScrollTrigger.create({ trigger: el, start: "top bottom", once: true, onEnter: go });
      const safety = window.setTimeout(() => { if (!started) { tween.kill(); el.textContent = value; } }, 6000);
      return () => { window.clearTimeout(safety); st.kill(); tween.kill(); el.textContent = value; };
    });
  });
  return <span ref={ref} className={className}>{value}</span>;
}

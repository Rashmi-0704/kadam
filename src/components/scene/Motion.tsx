"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const motionOk = "(prefers-reduced-motion: no-preference)";

/** Reveals every [data-reveal] child as it scrolls into view. */
export function Reveal({ children, className = "", stagger = 0.12, y = 40 }: { children: React.ReactNode; className?: string; stagger?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOk, () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        gsap.set(items, { opacity: 0, y });
        ScrollTrigger.batch(items, {
          start: "top 88%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger }),
        });
        // Content must never stay hidden: anything not revealed within 4 s (or if scrolling is unusual) is shown.
        const safety = window.setTimeout(() => gsap.set(items, { opacity: 1, y: 0 }), 4000);
        return () => window.clearTimeout(safety);
      });
    },
    { scope: ref },
  );
  return <div ref={ref} className={className}>{children}</div>;
}

/** Headline that rises in word by word. */
export function SplitHeading({ text, accent, className = "", as: Tag = "h1", delay = 0.2 }: { text: string; accent?: string; className?: string; as?: "h1" | "h2"; delay?: number }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOk, () => {
        gsap.from(".sw", { yPercent: 110, opacity: 0, rotate: 4, duration: 0.9, ease: "power4.out", stagger: 0.06, delay });
        const safety = window.setTimeout(() => gsap.set(".sw", { clearProps: "all" }), 2500);
        return () => window.clearTimeout(safety);
      });
    },
    { scope: ref },
  );
  const words = (s: string, cls = "") =>
    s.split(" ").filter(Boolean).map((w, i) => (
      <span key={`${cls}${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
        <span className={`sw inline-block ${cls}`}>{w}&nbsp;</span>
      </span>
    ));
  return (
    <Tag ref={ref} className={className} aria-label={accent ? `${text} ${accent}` : text}>
      <span aria-hidden="true">
        {words(text)}
        {accent && words(accent, "text-saffron")}
      </span>
    </Tag>
  );
}

/** Number that counts up when it scrolls into view. Keeps any prefix/suffix (₹, %, +). */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const el = ref.current!;
    const m = value.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!m) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ""));
    const decimals = (num.split(".")[1] ?? "").length;
    const fmt = (v: number) => `${pre}${v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${post}`;
    const mm = gsap.matchMedia();
    mm.add(motionOk, () => {
      const o = { v: 0 };
      let started = false;
      el.textContent = fmt(0);
      const tween = gsap.to(o, {
        v: target,
        duration: 1.4,
        ease: "power2.out",
        paused: true,
        onUpdate: () => { el.textContent = fmt(o.v); },
        onComplete: () => { el.textContent = value; },
      });
      const go = () => { if (!started) { started = true; tween.play(); } };
      const st = ScrollTrigger.create({ trigger: el, start: "top 95%", once: true, onEnter: go });
      // Never leave a wrong number on screen: if the animation hasn't run (hidden tab, odd scroll), show the real value.
      const safety = window.setTimeout(() => { if (!started || tween.progress() < 1) { tween.kill(); el.textContent = value; } }, 2500);
      return () => { window.clearTimeout(safety); st.kill(); tween.kill(); el.textContent = value; };
    });
  });
  return <span ref={ref} className={className}>{value}</span>;
}

/** Endless horizontal strip. */
export function Marquee({ items, className = "", speed = 40 }: { items: string[]; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOk, () => {
        const track = ref.current!.querySelector<HTMLElement>(".mq-track")!;
        const w = track.scrollWidth / 2;
        const tween = gsap.to(track, { x: -w, duration: w / speed, ease: "none", repeat: -1 });
        const el = ref.current!;
        const slow = () => gsap.to(tween, { timeScale: 0.2, duration: 0.6 });
        const fast = () => gsap.to(tween, { timeScale: 1, duration: 0.6 });
        el.addEventListener("pointerenter", slow);
        el.addEventListener("pointerleave", fast);
        return () => {
          el.removeEventListener("pointerenter", slow);
          el.removeEventListener("pointerleave", fast);
        };
      });
    },
    { scope: ref },
  );
  const row = (k: string) =>
    items.map((it, i) => (
      <span key={`${k}${i}`} className="inline-flex items-center gap-4 pr-4 whitespace-nowrap">
        <span>{it}</span>
        <span aria-hidden="true" className="inline-flex items-end gap-0.5"><span className="h-2 w-1.5 rounded-sm bg-saffron/60" /><span className="h-3 w-1.5 rounded-sm bg-saffron/80" /><span className="h-4 w-1.5 rounded-sm bg-saffron" /></span>
      </span>
    ));
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div className="mq-track inline-flex">{row("a")}{row("b")}</div>
    </div>
  );
}

/** Stair bars that grow as the section scrolls in — Kadam's step motif. */
export function GrowSteps({ n = 4, active = n, className = "" }: { n?: number; active?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOk, () => {
        gsap.from(".gs", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.6, ease: "back.out(2)", stagger: 0.1, scrollTrigger: { trigger: ref.current, start: "top 90%", once: true } });
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={`flex items-end gap-1 ${className}`} aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className={`gs w-3 rounded-sm ${i < active ? "bg-saffron" : "bg-sand"}`} style={{ height: 8 + i * 7 }} />
      ))}
    </div>
  );
}

"use client";
import { useEffect, useRef } from "react";

/**
 * Roadmap progress ring: indigo arc with the percentage in the middle. The markup already shows the real
 * value (so nothing depends on JavaScript). With motion allowed, the arc is reset to 0 and grows to its
 * value once, the first time the ring is visible (stroke-dashoffset on one SVG circle: there is no
 * transform/opacity way to grow an arc). Reduced motion: the value is shown straight away.
 */
export function ProgressRing({ pct, size = 64 }: { pct: number; size?: number }) {
  const svg = useRef<SVGSVGElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const r = 26, c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, pct));
  const final = c * (1 - v / 100);
  useEffect(() => {
    const el = svg.current, a = arc.current;
    if (!el || !a || typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    a.style.transition = "none";
    a.style.strokeDashoffset = String(c);
    const show = () => { a.style.transition = ""; a.style.strokeDashoffset = String(final); };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { requestAnimationFrame(show); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    const safety = window.setTimeout(show, 6000);
    return () => { io.disconnect(); window.clearTimeout(safety); a.style.strokeDashoffset = String(final); };
  }, [c, final]);
  return (
    <svg ref={svg} viewBox="0 0 64 64" width={size} height={size} className="shrink-0" role="img" aria-label={`${v}%`}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-mist)" strokeWidth="7" />
      <circle ref={arc} cx="32" cy="32" r={r} fill="none" stroke="var(--color-primary)" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={final} transform="rotate(-90 32 32)" className="ring-arc" />
      <text x="32" y="36.5" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--color-ink)" fontFamily="var(--font-display)">{v}%</text>
    </svg>
  );
}

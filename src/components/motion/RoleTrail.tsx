"use client";
import { useEffect, useRef, useState } from "react";
import { ROLES } from "@/db/taxonomy";

/*
 * <RoleTrail>: career role names pop up under the pointer as it moves across the hero, then fade.
 * - New pill only after ≥ 90 px of movement AND ≥ 80 ms since the last one; at most one check per frame.
 * - A pool of 12 elements; the 13th pill recycles the oldest immediately.
 * - transform + opacity only (Web Animations API). Passive listeners, never preventDefault.
 * - Listeners are removed while the hero is off-screen. Reduced motion: 4 still pills at the edges.
 * Place it as the first child of a `relative` hero; it listens on its parent element.
 */

const POOL = 12;
const MIN_DIST = 90;
const MIN_GAP_MS = 80;
const POP = 150;
const HOLD = 400;
const FADE = 900;
const TOTAL = POP + HOLD + FADE;

const EXTRA = ["Product Manager", "Operations Associate", "Social Media Manager", "Backend Developer", "Sales & Business Development", "HR / People Operations"];
const ROLE_NAMES = Array.from(new Set([...ROLES.map((r) => r.title), ...EXTRA]));

function shuffled<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const PILL = "absolute whitespace-nowrap rounded-full border-[1.5px] bg-white px-3 py-1.5 font-display text-[14px] leading-none font-bold";
const NORMAL = "border-line text-primary";
const ACCENT = "border-highlight text-highlight-deep";
const SHADOW = { boxShadow: "0 4px 12px rgba(67, 56, 202, 0.12)" };

const STILL = [
  { text: "Data Analyst", style: { right: "4%", top: "14%" }, tilt: -6, accent: false },
  { text: "UX Designer", style: { right: "18%", bottom: "10%" }, tilt: 5, accent: true },
  { text: "Content Writer", style: { left: "3%", bottom: "5%" }, tilt: 4, accent: false },
  { text: "Operations Associate", style: { right: "3%", top: "52%" }, tilt: -3, accent: false },
];

export function RoleTrail() {
  const layer = useRef<HTMLDivElement>(null);
  const pills = useRef<(HTMLSpanElement | null)[]>([]);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const host = layer.current?.parentElement;
    if (!host) return;
    let queue = shuffled(ROLE_NAMES);
    let count = 0;
    let last: { x: number; y: number; t: number } | null = null;
    let pending: { x: number; y: number } | null = null;
    let raf = 0;
    const anims: (Animation | null)[] = Array(POOL).fill(null);

    const nextRole = () => {
      if (!queue.length) queue = shuffled(ROLE_NAMES);
      return queue.shift()!;
    };

    const spawn = (x: number, y: number) => {
      const i = count % POOL;
      const el = pills.current[i];
      if (!el) return;
      anims[i]?.cancel();
      count += 1;
      el.textContent = nextRole();
      el.className = `${PILL} top-0 left-0 ${count % 4 === 0 ? ACCENT : NORMAL}`;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const W = host.clientWidth;
      const H = host.clientHeight;
      // Centre on the pointer, nudged inward so the pill stays fully inside the hero.
      const left = Math.min(Math.max(x - w / 2, 4), Math.max(4, W - w - 4));
      const top = Math.min(Math.max(y - h / 2, 4), Math.max(4, H - h - 4));
      const tilt = Math.random() * 16 - 8;
      const base = `translate3d(${left}px, ${top}px, 0) rotate(${tilt}deg)`;
      const lift = `translate3d(${left}px, ${top - 16}px, 0) rotate(${tilt}deg)`;
      anims[i] = el.animate(
        [
          { opacity: 0, transform: `${base} scale(0.6)`, easing: "ease-out" },
          { opacity: 1, transform: `${base} scale(1)`, offset: POP / TOTAL, easing: "linear" },
          { opacity: 1, transform: `${base} scale(1)`, offset: (POP + HOLD) / TOTAL, easing: "ease-in" },
          { opacity: 0, transform: `${lift} scale(0.9)` },
        ],
        { duration: TOTAL, fill: "none" },
      );
      last = { x, y, t: performance.now() };
    };

    const frame = () => {
      raf = 0;
      if (!pending) return;
      const p = pending;
      pending = null;
      const now = performance.now();
      if (!last || (Math.hypot(p.x - last.x, p.y - last.y) >= MIN_DIST && now - last.t >= MIN_GAP_MS)) spawn(p.x, p.y);
    };

    const local = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      pending = local(e);
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const p = local(e);
      spawn(p.x, p.y);
    };

    let attached = false;
    const attach = () => {
      if (attached) return;
      attached = true;
      host.addEventListener("pointermove", onMove, { passive: true });
      host.addEventListener("pointerdown", onDown, { passive: true });
    };
    const detach = () => {
      if (!attached) return;
      attached = false;
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      pending = null;
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? attach() : detach()));
    io.observe(host);
    return () => {
      io.disconnect();
      detach();
      cancelAnimationFrame(raf);
      anims.forEach((a) => a?.cancel());
    };
  }, [reduced]);

  return (
    <div ref={layer} className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">
      {reduced
        ? STILL.map((s) => (
            <span key={s.text} className={`${PILL} ${s.accent ? ACCENT : NORMAL}`} style={{ ...s.style, transform: `rotate(${s.tilt}deg)`, ...SHADOW }}>{s.text}</span>
          ))
        : Array.from({ length: POOL }).map((_, i) => (
            <span key={i} ref={(el) => { pills.current[i] = el; }} className={`${PILL} top-0 left-0 ${NORMAL}`} style={{ opacity: 0, willChange: "transform, opacity", ...SHADOW }} />
          ))}
    </div>
  );
}

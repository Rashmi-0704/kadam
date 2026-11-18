"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { TRAIL_ROLES } from "@/db/trail-roles";

/*
 * <RoleTrail>: a short trail of job-role boxes that follows the pointer over EMPTY hero background.
 * - Lives inside the hero <section> (the layer is absolute inset-0; listeners go on its parent).
 * - Anything marked [data-trail-block] (expanded by 16 px) blocks new boxes. Boxes are cached and
 *   re-measured on resize, scroll and font load only.
 * - A box appears when the pointer moved >= 60 px and >= 50 ms since the last one. Life: 120 ms in,
 *   900 ms hold, 300 ms out, so the trail retracts oldest-first. At most 10 visible; the 11th sends the
 *   oldest out at once. Pool of 12 elements, transform/opacity only (Web Animations API).
 * - A dashed polyline joins the centres of the visible boxes, in order.
 * - Touch: dragging draws the same trail (passive listeners, scrolling still works); a tap shows one box.
 * - Off-screen hero: listeners are removed. Reduced motion: nothing at all.
 */

const POOL = 12, MAX = 10, GAP = 60, MIN_MS = 50, IN = 120, HOLD = 900, OUT = 300, PAD = 16;
const LIFE = IN + HOLD + OUT;

type Slot = { el: HTMLDivElement; text: HTMLSpanElement; anim: Animation | null; x: number; y: number; born: number; out: boolean; live: boolean; base: string };

function shuffled<T>(a: readonly T[]) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

export function RoleTrail() {
  const layer = useRef<HTMLDivElement>(null);
  const line = useRef<SVGPolylineElement>(null);
  // On only when motion is allowed (and never during server render).
  const on = useSyncExternalStore(
    (cb) => { const mq = window.matchMedia("(prefers-reduced-motion: reduce)"); mq.addEventListener("change", cb); return () => mq.removeEventListener("change", cb); },
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  useEffect(() => {
    if (!on) return;
    const root = layer.current!;
    const hero = root.parentElement!;
    const slots: Slot[] = Array.from(root.querySelectorAll<HTMLDivElement>("[data-slot]")).map((el) => ({
      el, text: el.querySelector("span:last-child") as HTMLSpanElement, anim: null, x: 0, y: 0, born: 0, out: false, live: false, base: "",
    }));
    let order: Slot[] = []; // visible boxes, oldest first
    let roles = shuffled(TRAIL_ROLES);
    let next = 0;
    let count = 0;
    let last = { x: -1e9, y: -1e9, t: 0 };
    let blocks: DOMRect[] = [];
    let heroBox = hero.getBoundingClientRect();
    let pending: { x: number; y: number } | null = null;
    let raf = 0;
    let measureRaf = 0;

    const measure = () => {
      heroBox = hero.getBoundingClientRect();
      blocks = Array.from(hero.querySelectorAll("[data-trail-block]")).map((e) => e.getBoundingClientRect());
    };
    const remeasure = () => { cancelAnimationFrame(measureRaf); measureRaf = requestAnimationFrame(measure); };
    const blocked = (x: number, y: number) =>
      blocks.some((r) => r.width > 0 && x >= r.left - PAD && x <= r.right + PAD && y >= r.top - PAD && y <= r.bottom + PAD);

    const drawLine = () => {
      line.current?.setAttribute("points", order.filter((s) => !s.out).map((s) => `${s.x},${s.y}`).join(" "));
    };
    const retire = (s: Slot) => {
      if (s.out) return;
      s.out = true;
      drawLine();
      const elapsed = performance.now() - s.born;
      if (elapsed < IN + HOLD) {
        // Sent out early (11th box): fade from where it is now.
        s.anim?.cancel();
        s.anim = s.el.animate(
          [{ opacity: 1, transform: `${s.base} scale(1)` }, { opacity: 0, transform: `${s.base} scale(0.85)` }],
          { duration: OUT, easing: "ease-in", fill: "forwards" },
        );
        s.anim.onfinish = () => free(s);
      }
    };
    const free = (s: Slot) => {
      s.live = false;
      s.out = false;
      order = order.filter((o) => o !== s);
      drawLine();
    };

    const spawn = (x: number, y: number) => {
      const s = slots.find((o) => !o.live) ?? order[0];
      if (!s) return;
      if (s.live) { s.anim?.cancel(); free(s); }
      if (next >= roles.length) { roles = shuffled(TRAIL_ROLES); next = 0; }
      s.text.textContent = roles[next++];
      count++;
      s.el.dataset.accent = count % 4 === 0 ? "1" : "";
      // Centre on the pointer, nudged inside the hero.
      const w = s.el.offsetWidth, h = s.el.offsetHeight;
      const lx = Math.min(Math.max(x - heroBox.left, w / 2 + 4), heroBox.width - w / 2 - 4);
      const ly = Math.min(Math.max(y - heroBox.top, h / 2 + 4), heroBox.height - h / 2 - 4);
      const tilt = (Math.random() * 8 - 4).toFixed(1);
      s.base = `translate(${(lx - w / 2).toFixed(1)}px, ${(ly - h / 2).toFixed(1)}px) rotate(${tilt}deg)`;
      s.x = lx; s.y = ly; s.born = performance.now(); s.out = false; s.live = true;
      order.push(s);
      s.anim = s.el.animate(
        [
          { opacity: 0, transform: `${s.base} scale(0.7)`, offset: 0, easing: "ease-out" },
          { opacity: 1, transform: `${s.base} scale(1)`, offset: IN / LIFE },
          { opacity: 1, transform: `${s.base} scale(1)`, offset: (IN + HOLD) / LIFE, easing: "ease-in" },
          { opacity: 0, transform: `${s.base} scale(0.85)`, offset: 1 },
        ],
        { duration: LIFE, fill: "forwards" },
      );
      const me = s.anim;
      // The line drops this point when its fade-out starts, so it shrinks with the trail.
      window.setTimeout(() => { if (s.anim === me && s.live) { s.out = true; drawLine(); } }, IN + HOLD);
      me.onfinish = () => { if (s.anim === me) free(s); };
      const visible = order.filter((o) => !o.out);
      if (visible.length > MAX) retire(visible[0]);
      drawLine();
    };

    const frame = () => {
      raf = 0;
      if (!pending) return;
      const { x, y } = pending;
      pending = null;
      const now = performance.now();
      const inside = x >= heroBox.left && x <= heroBox.right && y >= heroBox.top && y <= heroBox.bottom;
      if (!inside || blocked(x, y)) return;
      if (Math.hypot(x - last.x, y - last.y) < GAP || now - last.t < MIN_MS) return;
      last = { x, y, t: now };
      spawn(x, y);
    };
    const queue = (x: number, y: number) => { pending = { x, y }; if (!raf) raf = requestAnimationFrame(frame); };
    const onMove = (e: PointerEvent) => { if (e.pointerType !== "touch") queue(e.clientX, e.clientY); };
    const onTouch = (e: TouchEvent) => { const t = e.touches[0]; if (t) queue(t.clientX, t.clientY); };
    const onTap = (e: TouchEvent) => { const t = e.touches[0]; if (t) { last = { x: -1e9, y: -1e9, t: 0 }; queue(t.clientX, t.clientY); } };

    let listening = false;
    const listen = (yes: boolean) => {
      if (yes === listening) return;
      listening = yes;
      const f = yes ? "addEventListener" : "removeEventListener";
      hero[f]("pointermove", onMove as EventListener, { passive: true } as AddEventListenerOptions);
      hero[f]("touchstart", onTap as EventListener, { passive: true } as AddEventListenerOptions);
      hero[f]("touchmove", onTouch as EventListener, { passive: true } as AddEventListenerOptions);
      window[f]("scroll", remeasure, { passive: true } as AddEventListenerOptions);
      window[f]("resize", remeasure, { passive: true } as AddEventListenerOptions);
      if (yes) measure();
    };
    const io = new IntersectionObserver(([e]) => listen(e.isIntersecting));
    io.observe(hero);
    document.fonts?.ready.then(remeasure);
    // The hero's own entrance animation moves text for ~2 s: measure again once it has settled.
    const settle = window.setTimeout(remeasure, 2200);
    return () => {
      io.disconnect();
      listen(false);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(measureRaf);
      window.clearTimeout(settle);
      slots.forEach((s) => s.anim?.cancel());
    };
  }, [on]);

  if (!on) return null;
  return (
    <div ref={layer} className="role-trail pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <polyline ref={line} fill="none" stroke="#818CF8" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 6" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      {Array.from({ length: POOL }).map((_, i) => (
        <div key={i} data-slot="" className="rt-box">
          <span className="rt-dot" />
          <span />
        </div>
      ))}
    </div>
  );
}

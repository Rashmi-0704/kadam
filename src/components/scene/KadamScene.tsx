"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);
// Dev-only handle for visual checks.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") (window as unknown as { gsap: typeof gsap }).gsap = gsap;

export type SceneFocus = "both" | "student" | "business";

/*
 * Original illustration: a lane of small Indian businesses at dawn, a "career city" behind,
 * and Kadam's rising steps in the middle with a student climbing them. Problems flow from the
 * shops to the student along glowing dashed lines. Animated with GSAP; respects reduced motion.
 */

const GROUND = 800;
const STEP_W = 58;
const STEP_X0 = 516;
const STEPS = Array.from({ length: 7 }, (_, i) => ({ x: STEP_X0 + i * STEP_W, h: 44 + i * 50 }));

type Shop = { x: number; w: number; h: number; awning: string; sign: string; label: string; windows: number };
const SHOPS: Shop[] = [
  { x: 28, w: 180, h: 196, awning: "#4338ca", sign: "#eef0ff", label: "KIRANA", windows: 2 },
  { x: 222, w: 150, h: 160, awning: "#16a34a", sign: "#eef0ff", label: "TIFFIN", windows: 1 },
  { x: 384, w: 112, h: 118, awning: "#ff6b4a", sign: "#eef0ff", label: "CHAI", windows: 1 },
  { x: 958, w: 176, h: 206, awning: "#818cf8", sign: "#eef0ff", label: "HANDLOOM", windows: 2 },
  { x: 1148, w: 138, h: 168, awning: "#16a34a", sign: "#eef0ff", label: "NGO", windows: 1 },
  { x: 1298, w: 136, h: 186, awning: "#ff6b4a", sign: "#eef0ff", label: "TUITION", windows: 2 },
];

const TOWERS = [
  { x: 560, w: 70, h: 330 }, { x: 640, w: 54, h: 420 }, { x: 706, w: 86, h: 380 }, { x: 806, w: 60, h: 470 },
  { x: 880, w: 92, h: 350 }, { x: 990, w: 64, h: 300 }, { x: 1070, w: 80, h: 400 }, { x: 1170, w: 58, h: 330 },
  { x: 120, w: 70, h: 300 }, { x: 210, w: 56, h: 360 }, { x: 290, w: 84, h: 280 }, { x: 400, w: 60, h: 340 },
  { x: 1250, w: 76, h: 360 }, { x: 1340, w: 64, h: 290 },
];

// Floating role tags (at most 4, so the hero stays calm next to the cursor role trail).
const CHIPS = [
  { x: 1160, y: 120, w: 170, text: "Data Analyst", dot: "#4338ca", tilt: -5 },
  { x: 990, y: 250, w: 168, text: "UX Designer", dot: "#ff6b4a", tilt: 4 },
  { x: 560, y: 330, w: 180, text: "Content Writer", dot: "#16a34a", tilt: -3 },
  { x: 680, y: 150, w: 158, text: "Operations", dot: "#818cf8", tilt: 6 },
];

function awningPath(x: number, y: number, w: number) {
  const n = Math.max(4, Math.round(w / 26));
  const sw = w / n;
  let d = `M${x - 8},${y} L${x + w + 8},${y} L${x + w + 8},${y + 22}`;
  for (let i = n; i > 0; i--) {
    const cx = x - 8 + (i - 0.5) * ((w + 16) / n);
    d += ` Q${cx},${y + 38} ${x - 8 + (i - 1) * ((w + 16) / n)},${y + 22}`;
  }
  void sw;
  return d + " Z";
}

export function KadamScene({ focus = "both", className = "", intro = true }: { focus?: SceneFocus; className?: string; intro?: boolean }) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (intro) {
          tl.from(".k-star", { opacity: 0, duration: 1.2, stagger: { each: 0.02, from: "random" } }, 0)
            .from(".k-sun", { y: 180, opacity: 0, duration: 2.2, ease: "power2.out" }, 0)
            .from(".k-tower", { y: 120, opacity: 0, duration: 1.2, stagger: { each: 0.05, from: "center" } }, 0.2)
            .from(".k-shop", { y: 140, opacity: 0, duration: 1, stagger: 0.09, ease: "back.out(1.4)" }, 0.45)
            .from(".k-step", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.7, stagger: 0.08, ease: "back.out(1.6)" }, 0.8)
            .from(".k-window", { opacity: 0, duration: 0.4, stagger: { each: 0.06, from: "random" } }, 1.2)
            .from(".k-link", { opacity: 0, duration: 0.8, stagger: 0.1 }, 1.4)
            .from(".k-chip", { opacity: 0, scale: 0.6, transformOrigin: "50% 50%", duration: 0.6, stagger: 0.12, ease: "back.out(2)" }, 1.6)
            .from(".k-student", { opacity: 0, y: 30, duration: 0.6 }, 1.5);
        }
        // Problems flowing from shops to the student.
        const loops: gsap.core.Animation[] = [];
        loops.push(gsap.to(".k-link", { strokeDashoffset: -280, duration: 6, ease: "none", repeat: -1 }));
        // Twinkle + window flicker.
        loops.push(gsap.to(".k-star", { opacity: 0.25, duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: { each: 0.15, from: "random", repeat: -1, yoyo: true } }));
        loops.push(gsap.to(".k-window", { opacity: 0.55, duration: 0.9, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: { each: 0.4, from: "random", repeat: -1, yoyo: true } }));
        // Floating outcome chips.
        gsap.utils.toArray<SVGGElement>(".k-chip").forEach((el, i) => {
          loops.push(gsap.to(el, { y: i % 2 ? 14 : -14, duration: 3 + i * 0.4, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 2 }));
        });
        // The student climbs Kadam's steps, one step at a time.
        const climb = gsap.timeline({ repeat: -1, repeatDelay: 0.8, delay: intro ? 2.2 : 0.3 });
        loops.push(climb);
        climb.set(".k-student", { x: STEPS[0].x + STEP_W / 2, y: GROUND - STEPS[0].h, opacity: 1 });
        STEPS.slice(1).forEach((s) => {
          climb.to(".k-student", { keyframes: { x: [null, s.x + STEP_W / 2 - 12, s.x + STEP_W / 2], y: [null, GROUND - s.h - 34, GROUND - s.h], easeEach: "sine.inOut" }, duration: 0.55 });
          climb.to(".k-student-body", { scaleY: 0.9, transformOrigin: "50% 100%", duration: 0.08, yoyo: true, repeat: 1 });
        });
        climb.to(".k-flag", { rotation: -12, transformOrigin: "0% 100%", duration: 0.3, yoyo: true, repeat: 3, ease: "sine.inOut" });
        climb.to(".k-burst", { scale: 1.6, opacity: 0, transformOrigin: "50% 50%", duration: 0.8, ease: "power2.out" }, "<");
        climb.set(".k-burst", { scale: 0.4, opacity: 0.9 });
        climb.to(".k-student", { opacity: 0, duration: 0.4 }, "+=0.6");

        // Gentle parallax on pointer move (desktop).
        const svg = root.current!;
        const qt = [
          { sel: ".k-layer-far", f: 6 },
          { sel: ".k-layer-mid", f: 12 },
          { sel: ".k-layer-chips", f: 22 },
        ].map(({ sel, f }) => ({ x: gsap.quickTo(sel, "x", { duration: 1.2, ease: "power3" }), y: gsap.quickTo(sel, "y", { duration: 1.2, ease: "power3" }), f }));
        const onMove = (e: PointerEvent) => {
          const r = svg.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          qt.forEach((q) => { q.x(-nx * q.f); q.y(-ny * q.f * 0.5); });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        // Pause every loop while the scene is off-screen (hidden tabs are paused by the browser).
        const io = new IntersectionObserver(([e]) => loops.forEach((l) => (e.isIntersecting ? l.resume() : l.pause())));
        io.observe(svg);
        return () => { window.removeEventListener("pointermove", onMove); io.disconnect(); };
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".k-student", { x: STEPS[6].x + STEP_W / 2, y: GROUND - STEPS[6].h, opacity: 1 });
      });
    },
    { scope: root, dependencies: [] },
  );

  // Focus: brighten the student's steps or the businesses.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const shopsOn = focus !== "student";
      const stepsOn = focus !== "business";
      gsap.to(".k-shop", { opacity: shopsOn ? 1 : 0.35, duration: 0.6, ease: "power2.out" });
      gsap.to(".k-steps, .k-student-wrap", { opacity: stepsOn ? 1 : 0.35, duration: 0.6, ease: "power2.out" });
      gsap.to(".k-glow-steps", { opacity: focus === "student" ? 0.9 : 0.35, duration: 0.6 });
      gsap.to(".k-glow-shops", { opacity: focus === "business" ? 0.85 : 0.25, duration: 0.6 });
    }, root);
    return () => ctx.revert();
  }, [focus]);

  return (
    <svg ref={root} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" className={`h-full w-full ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="k-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f8fc" />
          <stop offset="0.55" stopColor="#eef0ff" />
          <stop offset="0.85" stopColor="#f3eefe" />
          <stop offset="1" stopColor="#fff1ec" />
        </linearGradient>
        <radialGradient id="k-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd9cf" />
          <stop offset="0.45" stopColor="#ffb4a2" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ff6b4a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="k-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#818cf8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="k-step" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="k-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3e7f2" />
          <stop offset="1" stopColor="#d5dbee" />
        </linearGradient>
        <filter id="k-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
      </defs>

      <rect width="1440" height="900" fill="url(#k-sky)" />
      <g>
        {Array.from({ length: 46 }).map((_, i) => (
          <circle key={i} className="k-star" cx={(i * 337) % 1440} cy={(i * 131) % 420 + 20} r={i % 5 === 0 ? 1.8 : 1.1} fill="#a5b4fc" opacity={0.5} />
        ))}
      </g>
      <circle className="k-sun" cx="720" cy="560" r="260" fill="url(#k-sun)" opacity="0.85" />

      {/* Career city */}
      <g className="k-layer-far">
        {TOWERS.map((t, i) => (
          <g key={i} className="k-tower">
            <rect x={t.x} y={GROUND - t.h} width={t.w} height={t.h} rx="4" fill="#dfe3f6" opacity="0.95" />
            {Array.from({ length: Math.floor(t.h / 34) }).map((_, r) =>
              Array.from({ length: Math.max(1, Math.floor(t.w / 22)) }).map((__, c) =>
                (r * 7 + c * 3 + i) % 4 === 0 ? (
                  <rect key={`${r}-${c}`} className="k-window" x={t.x + 8 + c * 20} y={GROUND - t.h + 14 + r * 34} width="9" height="13" rx="1.5" fill="#b4bdf3" opacity="0.85" />
                ) : null,
              ),
            )}
          </g>
        ))}
      </g>

      <ellipse className="k-glow-steps" cx="720" cy="560" rx="260" ry="220" fill="url(#k-glow)" filter="url(#k-soft)" opacity="0.35" />
      <ellipse className="k-glow-shops" cx="250" cy="720" rx="300" ry="120" fill="url(#k-glow)" filter="url(#k-soft)" opacity="0.25" />
      <ellipse className="k-glow-shops" cx="1190" cy="720" rx="300" ry="120" fill="url(#k-glow)" filter="url(#k-soft)" opacity="0.25" />

      <rect y={GROUND} width="1440" height={900 - GROUND} fill="url(#k-ground)" />

      {/* Problems flowing to the student */}
      <g fill="none" strokeLinecap="round">
        {SHOPS.map((s, i) => {
          const sx = s.x + s.w / 2;
          const sy = GROUND - s.h - 4;
          const tx = 720;
          const ty = 470;
          return <path key={i} className="k-link" d={`M${sx},${sy} Q${(sx + tx) / 2},${Math.min(sy, ty) - 170} ${tx},${ty}`} stroke="#818cf8" strokeWidth="2.2" strokeDasharray="3 11" opacity="0.75" />;
        })}
      </g>

      {/* Shops */}
      <g className="k-layer-mid">
        {SHOPS.map((s, i) => {
          const top = GROUND - s.h;
          return (
            <g key={i} className="k-shop">
              <rect x={s.x} y={top} width={s.w} height={s.h} rx="6" fill="#ffffff" stroke="#c8cee2" strokeWidth="2" />
              <rect x={s.x} y={top} width={s.w} height="10" rx="4" fill="#e3e7f2" />
              <rect x={s.x + s.w / 2 - Math.min(64, s.w / 2 - 10)} y={top + 16} width={Math.min(128, s.w - 20)} height="26" rx="5" fill={s.sign} />
              <text x={s.x + s.w / 2} y={top + 34} textAnchor="middle" fontFamily="var(--font-nunito), system-ui, sans-serif" fontWeight="800" fontSize={s.label.length > 6 ? 12 : 14} letterSpacing="1.5" fill="#151a30">{s.label}</text>
              <path d={awningPath(s.x, top + 50, s.w)} fill={s.awning} />
              {Array.from({ length: s.windows }).map((_, w) => {
                const ww = (s.w - 30 - (s.windows - 1) * 12) / s.windows;
                return <rect key={w} className="k-window" x={s.x + 15 + w * (ww + 12)} y={top + 96} width={ww} height={Math.max(30, s.h - 150)} rx="4" fill="#c7d2fe" opacity="0.9" />;
              })}
              <rect x={s.x + s.w / 2 - 16} y={GROUND - 54} width="32" height="54" rx="3" fill="#c8cee2" />
            </g>
          );
        })}
      </g>

      {/* Kadam steps */}
      <g className="k-steps">
        {STEPS.map((s, i) => (
          <g key={i}>
            <rect className="k-step" x={s.x} y={GROUND - s.h} width={STEP_W - 4} height={s.h} rx="6" fill={i === STEPS.length - 1 ? "#ff6b4a" : "url(#k-step)"} />
            <rect x={s.x} y={GROUND - s.h} width={STEP_W - 4} height="6" rx="3" fill="#fff" opacity="0.35" />
          </g>
        ))}
        <g className="k-flag">
          <rect x={STEPS[6].x + 24} y={GROUND - STEPS[6].h - 70} width="3" height="70" fill="#4338ca" />
          <path d={`M${STEPS[6].x + 27},${GROUND - STEPS[6].h - 70} l38,12 l-38,12 z`} fill="#ff6b4a" />
        </g>
        <circle className="k-burst" cx={STEPS[6].x + 27} cy={GROUND - STEPS[6].h - 40} r="40" fill="none" stroke="#ff6b4a" strokeWidth="3" opacity="0" />
      </g>

      {/* Student */}
      <g className="k-student-wrap">
        <g className="k-student" opacity="0">
          <g className="k-student-body">
            <ellipse cx="0" cy="0" rx="13" ry="3" fill="#151a30" opacity="0.15" />
            <rect x="-7" y="-20" width="5" height="20" rx="2.5" fill="#151a30" />
            <rect x="2" y="-20" width="5" height="20" rx="2.5" fill="#151a30" />
            <rect x="-11" y="-46" width="22" height="30" rx="9" fill="#4338ca" />
            <rect x="-17" y="-44" width="9" height="20" rx="4" fill="#ff6b4a" />
            <circle cx="0" cy="-57" r="10" fill="#c98a5a" />
            <path d="M-10,-60 q10,-14 20,0 q-4,-5 -10,-4 q-6,-1 -10,4z" fill="#151a30" />
          </g>
        </g>
      </g>

      {/* Outcome chips */}
      <g className="k-layer-chips max-md:hidden">
        {CHIPS.map((c, i) => (
          <g key={i} className="k-chip" transform={`rotate(${c.tilt} ${c.x + c.w / 2} ${c.y + 20})`}>
            <rect x={c.x} y={c.y} width={c.w} height="40" rx="20" fill="#ffffff" stroke="#e3e7f2" strokeWidth="1.5" />
            <circle cx={c.x + 20} cy={c.y + 20} r="6" fill={c.dot} />
            <text x={c.x + 34} y={c.y + 26} fontFamily="var(--font-nunito), system-ui, sans-serif" fontWeight="800" fontSize="15" fill="#4338ca">{c.text}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

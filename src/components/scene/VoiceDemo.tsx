"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/** Looping illustration: an owner speaks, the waveform moves, and the words appear as a draft. */
export function VoiceDemo({ label, lines, done }: { label: string; lines: string[]; done: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".vb", { scaleY: () => gsap.utils.random(0.2, 1), duration: 0.18, ease: "sine.inOut", repeat: -1, repeatRefresh: true, yoyo: true, stagger: { each: 0.03, from: "center" }, transformOrigin: "50% 50%" });
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay: 1.4 });
        tl.set(".vl", { opacity: 0, y: 10 }).set(".vdone", { opacity: 0, scale: 0.8 });
        tl.to(".vl", { opacity: 1, y: 0, duration: 0.5, stagger: 1.1, ease: "power2.out" });
        tl.to(".vdone", { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, "+=0.4");
        tl.to(".vl, .vdone", { opacity: 0, duration: 0.4 }, "+=2.2");
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-sm">
      <div className="absolute -top-4 -right-4 h-full w-full rotate-[3deg] rounded-3xl bg-primary/80" aria-hidden="true" />
      <div className="relative rounded-3xl bg-canvas p-6 text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" aria-hidden="true" />
            <svg viewBox="0 0 24 24" className="relative h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
          </span>
          <div className="flex h-10 flex-1 items-center gap-[3px]" aria-hidden="true">
            {Array.from({ length: 28 }).map((_, i) => <span key={i} className="vb h-full w-1 rounded-full bg-primary/80" style={{ transform: `scaleY(${0.25 + ((i * 37) % 10) / 14})` }} />)}
          </div>
        </div>
        <p className="mt-3 text-xs font-bold tracking-wide text-ink-3 uppercase">{label}</p>
        <div className="mt-2 min-h-32 space-y-2">
          {lines.map((l) => <p key={l} className="vl rounded-2xl rounded-tl-sm bg-mist px-3 py-2 text-[15px]">{l}</p>)}
        </div>
        <p className="vdone mt-3 inline-flex items-center gap-2 rounded-full bg-success-ink px-3 py-1.5 text-sm font-semibold text-white">✓ {done}</p>
      </div>
    </div>
  );
}

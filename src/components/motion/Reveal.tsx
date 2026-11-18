"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/*
 * One shared scroll reveal for homepages and dashboards.
 * - A section fades up (opacity 0 -> 1, 24 px -> 0, 600 ms, ease-out) when its top is 15 % inside the
 *   bottom of the screen. It plays once.
 * - If the section has [data-reveal] children (cards, steps, FAQ rows, list items), those fade up one after
 *   another, 80 ms apart; only the first 8 are staggered, the rest arrive together.
 * - Content is visible by default: hiding happens only inside JS, a safety timer shows everything, and
 *   prefers-reduced-motion skips it all. Transform/opacity only, so there is no layout shift.
 */
export const REVEAL = { y: 24, duration: 0.6, stagger: 0.08, maxStagger: 8, start: "top 85%", ease: "power2.out" } as const;
const motionOk = "(prefers-reduced-motion: no-preference)";

type Props = { children: React.ReactNode; className?: string; as?: "div" | "section" | "ul" | "ol"; id?: string } & Omit<React.HTMLAttributes<HTMLElement>, "children" | "className" | "id">;

export function Reveal({ children, className = "", as = "div", id, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(motionOk, () => {
        // Items that belong to this Reveal (not to a Reveal nested inside it).
        const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => el.closest("[data-reveal-root]") === root);
        const targets: HTMLElement[] = items.length ? items : [root];
        gsap.set(targets, { opacity: 0, y: REVEAL.y });
        let done = false;
        const play = () => {
          if (done) return;
          done = true;
          const first = targets.slice(0, REVEAL.maxStagger), rest = targets.slice(REVEAL.maxStagger);
          gsap.to(first, { opacity: 1, y: 0, duration: REVEAL.duration, ease: REVEAL.ease, stagger: REVEAL.stagger, clearProps: "transform" });
          if (rest.length) gsap.to(rest, { opacity: 1, y: 0, duration: REVEAL.duration, ease: REVEAL.ease, delay: REVEAL.stagger * REVEAL.maxStagger, clearProps: "transform" });
        };
        const st = ScrollTrigger.create({ trigger: root, start: REVEAL.start, once: true, onEnter: play });
        // Never leave content hidden if the trigger doesn't fire (odd scrolling, print, hidden tab).
        const safety = window.setTimeout(() => { if (!done) { done = true; gsap.set(targets, { opacity: 1, y: 0, clearProps: "transform" }); } }, 6000);
        return () => { window.clearTimeout(safety); st.kill(); gsap.set(targets, { clearProps: "opacity,transform" }); };
      });
    },
    { scope: ref },
  );
  const Tag = as as "div";
  return <Tag {...rest} ref={ref as React.RefObject<HTMLDivElement>} id={id} data-reveal-root="" className={className}>{children}</Tag>;
}

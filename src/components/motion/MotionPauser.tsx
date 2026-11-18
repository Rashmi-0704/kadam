"use client";
import { useEffect } from "react";

const SELECTOR = ".hl, .hl-pill, .glow-card, .pulse-dot, .hw-rows, [data-anim]";

/**
 * Pauses CSS animations that are off-screen by adding .anim-off (see globals.css).
 * Hidden tabs are paused by the browser already. Watches for new elements as pages change.
 */
export function MotionPauser() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle("anim-off", !e.isIntersecting);
    }, { rootMargin: "120px" });
    const seen = new WeakSet<Element>();
    const scan = () => document.querySelectorAll(SELECTOR).forEach((el) => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
    scan();
    let raf = 0;
    const mo = new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(scan); });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  return null;
}

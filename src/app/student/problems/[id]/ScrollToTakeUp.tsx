"use client";
import { useEffect } from "react";

/** After "Take up" on a problem card: bring the visible take-up panel into view (it is highlighted with .takeup-ring). */
export function ScrollToTakeUp() {
  useEffect(() => {
    const panel = Array.from(document.querySelectorAll<HTMLElement>("[data-takeup]")).find((el) => el.offsetParent !== null);
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panel?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" });
  }, []);
  return null;
}

"use client";
import { useRef } from "react";

/*
 * <WordMarquee>: three rows of big words sliding left, right, left, forever (CSS keyframes, see globals.css).
 * Each row holds two identical halves, each wider than two screens, so translateX(-50%) loops seamlessly.
 * Not linked to scroll. Hover slows a row to a quarter speed (desktop only). Off-screen bands pause via
 * <MotionPauser> (.wm-band). Decorative: aria-hidden, and the same messages exist as text on the page.
 */

const DURATIONS = [40, 50, 45];
const REPEAT = 4;

function Half({ words }: { words: string[] }) {
  return (
    <span className="flex shrink-0 items-center">
      {Array.from({ length: REPEAT }).flatMap((_, r) =>
        words.map((w, i) => (
          <span key={`${r}-${i}`} className="flex items-center">
            <span>{w}</span>
            <span className="mx-[0.45em] text-[0.55em] text-highlight [-webkit-text-stroke:0]">✦</span>
          </span>
        )),
      )}
    </span>
  );
}

export function WordMarquee({ rows }: { rows: [string[], string[], string[]] }) {
  const band = useRef<HTMLDivElement>(null);
  const speed = (row: HTMLElement | null, rate: number) => {
    if (!row || !window.matchMedia("(hover: hover)").matches) return;
    row.getAnimations().forEach((a) => { a.playbackRate = rate; });
  };
  return (
    <div ref={band} className="wm-band overflow-hidden bg-canvas py-8 font-display leading-[1.05] font-extrabold" aria-hidden="true">
      <div className="flex flex-col gap-2 text-[clamp(48px,8vw,128px)]">
        {rows.map((words, i) => (
          <div key={i} className="overflow-hidden" onPointerEnter={(e) => speed(e.currentTarget.firstElementChild as HTMLElement, 0.25)} onPointerLeave={(e) => speed(e.currentTarget.firstElementChild as HTMLElement, 1)}>
            <div
              className={`wm-row ${i === 0 ? "text-primary" : i === 1 ? "wm-outline" : "text-ink"}`}
              data-dir={i === 1 ? "right" : "left"}
              style={{ "--wm-dur": `${DURATIONS[i]}s` } as React.CSSProperties}
            >
              <Half words={words} />
              <Half words={words} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

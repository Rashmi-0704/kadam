/*
 * <HeroWords>: faint word rows that slide behind the hero content, like a moving watermark.
 * 5 rows (4 on phones), spread over the hero's full height, alternating left / right.
 * Rows 1, 3, 5 solid indigo at 7 %; rows 2 and 4 outlined (1.5 px indigo at 14 %); ✦ coral at 18 %.
 * CSS keyframes only (globals.css: .hw-row). Each track holds two identical halves wider than two
 * screens, so translateX(-50%) loops with no jump. Not linked to scroll, no hover effect,
 * pointer-events: none. Off-screen it pauses via <MotionPauser> (.hw-rows); reduced motion = still.
 */

// Start phrase per row: 0 Real problems, 2 Real impact, 3 Take your first step, 1 Real solutions, 0 again.
const STARTS = [0, 2, 3, 1, 0];
const DURATIONS = [60, 75, 65, 80, 70];
const REPEAT = 3;

function Half({ phrases, start }: { phrases: string[]; start: number }) {
  const seq = [...phrases.slice(start), ...phrases.slice(0, start)];
  return (
    <span className="flex shrink-0 items-center">
      {Array.from({ length: REPEAT }).flatMap((_, r) =>
        seq.map((w, i) => (
          <span key={`${r}-${i}`} className="flex items-center">
            <span>{w}</span>
            <span className="hw-sep">✦</span>
          </span>
        )),
      )}
    </span>
  );
}

/** `phrases` in this order: Real problems, Real solutions, Real impact, Take your first step. */
export function HeroWords({ phrases }: { phrases: [string, string, string, string] }) {
  return (
    <div className="hw-rows pointer-events-none absolute inset-0 flex flex-col justify-evenly overflow-hidden select-none" aria-hidden="true">
      {STARTS.map((start, i) => (
        <div key={i} className={`overflow-hidden ${i === 4 ? "max-sm:hidden" : ""}`}>
          <div
            className={`hw-row ${i % 2 ? "hw-outline" : "hw-solid"}`}
            data-dir={i % 2 ? "right" : "left"}
            style={{ "--hw-dur": `${DURATIONS[i]}s` } as React.CSSProperties}
          >
            <Half phrases={phrases} start={start} />
            <Half phrases={phrases} start={start} />
          </div>
        </div>
      ))}
    </div>
  );
}

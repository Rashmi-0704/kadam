"use client";
import { useSyncExternalStore } from "react";

const Q = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const m = window.matchMedia(Q);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(Q).matches, () => false);
}

/** Translate with an English fallback until the key is merged into the locale files. */
export function tr(t: (k: string) => string, key: string, fallback: string) {
  const s = t(key);
  return s === key ? fallback : s;
}

/** Keyframes animate transform and opacity only. Reduced motion: no movement, content still appears. */
export function ChatMotionStyles() {
  return (
    <style>{`
@keyframes kc-in-left{from{opacity:0;transform:translate3d(-14px,8px,0)}to{opacity:1;transform:none}}
@keyframes kc-in-right{from{opacity:0;transform:translate3d(14px,8px,0)}to{opacity:1;transform:none}}
@keyframes kc-dot{0%,80%,100%{transform:translate3d(0,0,0);opacity:.45}40%{transform:translate3d(0,-5px,0);opacity:1}}
@keyframes kc-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:.75}}
@keyframes kc-pop{0%{opacity:0;transform:scale(.85) translate3d(0,6px,0)}100%{opacity:1;transform:none}}
@keyframes kc-shake{0%,100%{transform:translate3d(0,0,0)}20%{transform:translate3d(-5px,0,0)}40%{transform:translate3d(5px,0,0)}60%{transform:translate3d(-3px,0,0)}80%{transform:translate3d(3px,0,0)}}
.kc-in-left{animation:kc-in-left .28s ease-out both}
.kc-in-right{animation:kc-in-right .28s ease-out both}
.kc-dot{display:inline-block;height:.5rem;width:.5rem;border-radius:9999px;background:currentColor;animation:kc-dot 1.1s ease-in-out infinite}
.kc-pulse{animation:kc-pulse 1.4s ease-in-out infinite}
.kc-pop{animation:kc-pop .26s ease-out both}
.kc-shake{animation:kc-shake .45s ease-in-out 1}
@media (prefers-reduced-motion: reduce){
.kc-in-left,.kc-in-right,.kc-pop{animation:kc-fade .2s linear both}
.kc-dot{animation:kc-fade-loop 1.2s linear infinite}
.kc-pulse,.kc-shake{animation:none}
@keyframes kc-fade{from{opacity:0}to{opacity:1}}
@keyframes kc-fade-loop{0%,100%{opacity:.4}50%{opacity:1}}
}
`}</style>
  );
}

// Shared "magical" highlight: gradient text, a shimmer sweep, a soft glow and sparkles on hover.
// Use about once or twice per screen. Works in server and client components.
export function Highlight({ children, className = "", delay = 1 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <span className={`hl-wrap ${className}`}>
      <span className="hl" style={{ "--hl-delay": `${delay}s` } as React.CSSProperties}>{children}</span>
      <span aria-hidden="true" className="hl-spark" style={{ top: "-0.35em", left: "-0.2em" }}>✦</span>
      <span aria-hidden="true" className="hl-spark" style={{ top: "-0.45em", right: "-0.25em" }}>✦</span>
      <span aria-hidden="true" className="hl-spark" style={{ bottom: "-0.2em", right: "18%" }}>✦</span>
    </span>
  );
}

const PATH_ICON = <path d="M4 20h4v-5h4v-5h4V5h4" />;

/** A highlighted pill, e.g. a role name. `icon` defaults to Kadam's step path. */
export function HighlightPill({ children, className = "", icon = true, delay = 1.4 }: { children: React.ReactNode; className?: string; icon?: boolean; delay?: number }) {
  return (
    <span className={`hl-pill ${className}`} style={{ "--hl-delay": `${delay}s` } as React.CSSProperties}>
      {icon && (
        <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{PATH_ICON}</svg>
      )}
      <span>{children}</span>
    </span>
  );
}

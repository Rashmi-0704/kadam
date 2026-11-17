import { Highlight } from "@/components/motion/Highlight";

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#4338ca" />
      <rect x="7" y="19" width="5" height="6" rx="1.2" fill="#c7d2fe" />
      <rect x="13.5" y="14" width="5" height="11" rx="1.2" fill="#ffffff" />
      <rect x="20" y="8" width="5" height="17" rx="1.2" fill="#ff6b4a" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className="font-display text-xl font-bold tracking-tight">Kadam</span>
    </span>
  );
}

/** Brand lock-up: "Kadam. Take your first step." with the tagline in the Highlight treatment. */
export function LockUp({ tagline, className = "", size = "md" }: { tagline: string; className?: string; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={lg ? "h-11 w-11" : "h-8 w-8"} />
      <span className={`flex flex-col leading-none sm:flex-row sm:items-baseline sm:gap-2 ${lg ? "text-2xl" : "text-xl"}`}>
        <span className="font-display font-extrabold tracking-tight text-ink">Kadam.</span>
        <span className={`font-display ${lg ? "text-lg sm:text-2xl" : "text-[13px] sm:text-lg"}`}><Highlight delay={2}>{tagline}</Highlight></span>
      </span>
    </span>
  );
}

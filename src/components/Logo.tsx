export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#1c1a27" />
      <rect x="7" y="19" width="5" height="6" rx="1.2" fill="#f5a025" />
      <rect x="13.5" y="14" width="5" height="11" rx="1.2" fill="#f5a025" />
      <rect x="20" y="8" width="5" height="17" rx="1.2" fill="#fbf7f0" />
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

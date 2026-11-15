"use client";
import { useFormStatus } from "react-dom";

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} aria-hidden="true" />;
}

export function SubmitButton({ children, className = "btn-primary", pendingLabel, disabled, name, value }: { children: React.ReactNode; className?: string; pendingLabel?: string; disabled?: boolean; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} name={name} value={value} aria-busy={pending}>
      {pending ? <><Spinner />{pendingLabel ?? children}</> : children}
    </button>
  );
}

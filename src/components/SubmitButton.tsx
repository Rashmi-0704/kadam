"use client";
import { useRef } from "react";
import { useFormStatus } from "react-dom";

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} aria-hidden="true" />;
}

export function SubmitButton({ children, className = "btn-primary", pendingLabel, disabled, name, value }: { children: React.ReactNode; className?: string; pendingLabel?: string; disabled?: boolean; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  // `pending` turns on a frame after the click; a second tap inside that gap (or within a second) must not send the form again.
  const last = useRef(0);
  const guard = (e: React.MouseEvent<HTMLButtonElement>) => {
    const now = e.timeStamp || performance.now();
    if (pending || now - last.current < 1000) e.preventDefault();
    else last.current = now;
  };
  return (
    <button type="submit" className={className} disabled={pending || disabled} name={name} value={value} aria-busy={pending} onClick={guard}>
      {pending ? <><Spinner />{pendingLabel ?? children}</> : children}
    </button>
  );
}

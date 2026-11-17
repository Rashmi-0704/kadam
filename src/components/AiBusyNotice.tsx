"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useT } from "@/lib/i18n/client";
import { aiText, type AiCopyKey } from "@/lib/ai/copy";
import { Spinner } from "./SubmitButton";

/**
 * Friendly "AI is busy" note with a Try again button. `retry` is a server action (bound to its arguments) that clears the
 * fallback; without one the button just reloads the page data (enough where the page itself tries the AI again).
 */
export function AiBusyNotice({ retry, message = "ai.busy_last", className = "" }: { retry?: () => Promise<unknown>; message?: AiCopyKey; className?: string }) {
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div role="status" className={`flex flex-wrap items-center gap-2 rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-ink ${className}`}>
      <span className="flex-1">{aiText(t, message)}</span>
      <button
        type="button"
        className="btn-secondary btn-sm"
        disabled={pending}
        aria-busy={pending}
        onClick={() =>
          start(async () => {
            if (retry) await retry();
            router.refresh();
          })
        }
      >
        {pending && <Spinner />}
        {t("common.retry")}
      </button>
    </div>
  );
}

/** Shows "Updating…" and refreshes the page when the report's 2-minute window ends, then every few seconds until it is done. */
export function ReportUpdating({ dueInSec, compact = false }: { dueInSec: number; compact?: boolean }) {
  const t = useT();
  const router = useRouter();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const ms = dueInSec > 0 ? dueInSec * 1000 + 1500 : 6000 + tick * 2000;
    if (tick > 12) return; // stop polling after ~2 minutes overdue
    const id = setTimeout(() => {
      router.refresh();
      setTick((n) => n + 1);
    }, ms);
    return () => clearTimeout(id);
  }, [dueInSec, tick, router]);
  return (
    <p role="status" className={`flex items-start gap-2 rounded-xl bg-primary-soft px-3 py-2 text-sm text-primary-deep ${compact ? "" : "font-semibold"}`}>
      <Spinner className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        <span className="font-semibold">{aiText(t, "report.updating")}</span>
        {!compact && <span className="font-normal"> {aiText(t, "report.updating_note")}</span>}
      </span>
    </p>
  );
}

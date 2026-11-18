"use client";
import { useActionState, useState } from "react";
import { resetUserPassword, type ResetState } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

/** Admin page only, English only (decision 32 does not apply: the admin is the Kadam team). */
export function ResetPasswordForm({ email, compact = false }: { email?: string; compact?: boolean }) {
  const [state, action] = useActionState<ResetState, FormData>(resetUserPassword, {});
  const [show, setShow] = useState(false);
  return (
    <form action={action} className={compact ? "space-y-2" : "space-y-3"}>
      {email ? (
        <input type="hidden" name="email" value={email} />
      ) : (
        <div>
          <label className="label" htmlFor="reset-email">Email</label>
          <input id="reset-email" name="email" type="email" required className="input" defaultValue={state.email} />
        </div>
      )}
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`tmp-${email ?? "any"}`}>Temporary password</label>
        <input id={`tmp-${email ?? "any"}`} name="password" type={show ? "text" : "password"} minLength={8} maxLength={72} required autoComplete="off"
          placeholder="Temporary password (8+ characters)" className="input min-h-11 flex-1 py-2 text-sm" />
        <button type="button" onClick={() => setShow((s) => !s)} className="btn-ghost min-h-11 px-3 text-sm">{show ? "Hide" : "Show"}</button>
      </div>
      <SubmitButton className={compact ? "btn-secondary w-full min-h-11 text-sm" : "btn-primary w-full"} pendingLabel="Resetting…">Reset password</SubmitButton>
      {state.message && (
        <p role="status" className={`text-sm font-semibold ${state.ok ? "text-success-ink" : "text-alert"}`}>{state.message}</p>
      )}
    </form>
  );
}

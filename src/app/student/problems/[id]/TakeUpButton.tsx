"use client";
import { useActionState } from "react";
import { takeUpProblem, type FormState } from "@/app/actions/student";
import { SubmitButton } from "@/components/SubmitButton";
import { useT } from "@/lib/i18n/client";

export function TakeUpButton({ problemId }: { problemId: string }) {
  const t = useT();
  const [state, action] = useActionState<FormState, FormData>(takeUpProblem, {});
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="problemId" value={problemId} />
      <SubmitButton className="btn-accent w-full" pendingLabel={t("common.saving")}>{t("problem.take_up")}</SubmitButton>
      {state.error && <p className="text-sm font-semibold text-clay" role="alert">{t(state.error)}</p>}
    </form>
  );
}

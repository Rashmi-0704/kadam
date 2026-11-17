import { redirect } from "next/navigation";
import { requireBusiness } from "@/lib/guards";
import { one } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { hasServerStt } from "@/lib/stt";
import { ProblemStarter } from "./ProblemStarter";
import { AiChatPanel } from "@/components/AiChatPanel";
import { answerIntake, finishIntakeNow } from "@/app/actions/business";
import { SubmitButton } from "@/components/SubmitButton";
import { StepRail } from "@/components/StepRail";

// AI calls can take several seconds.
export const maxDuration = 60;

export const metadata = { title: "New problem" };

export default async function NewProblem({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const { user } = await requireBusiness();
  const t = await getT();
  const sp = await searchParams;
  const steps = [t("pc.rail1"), t("pc.rail2"), t("pc.rail3")];

  if (sp.draft) {
    const p = await one(`select id, intake, status from problems where id = $1 and business_id = $2`, [sp.draft, user.id]);
    if (!p) redirect("/business/problems/new");
    if (p.status !== "draft") redirect(`/business/problems/${p.id}`);
    const turns = (p.intake as { role: "assistant" | "user"; text: string; key?: string }[]).map((x) => ({ role: x.role, text: x.key ? t(x.key) : x.text }));
    return (
      <div className="mx-auto max-w-2xl">
        <StepRail steps={steps} current={1} />
        <h1 className="mt-5 text-2xl font-bold sm:text-3xl">{t("pc.chat_title")}</h1>
        <p className="mt-1 mb-5 text-ink-2">{t("pc.chat_sub")}</p>
        <AiChatPanel
          turns={turns}
          action={answerIntake}
          hidden={{ problemId: p.id }}
          placeholder={t("pc.answer_ph")}
          voice
          serverStt={hasServerStt()}
          skipLabel={t("pc.skip")}
          assistantName={t("pc.assistant")}
        />
        <form action={finishIntakeNow} className="mt-4 flex flex-col items-center gap-2">
          <input type="hidden" name="problemId" value={p.id} />
          <SubmitButton className="btn-secondary w-full sm:w-auto" pendingLabel={t("pc.writing")}>{t("pc.finish_now")}</SubmitButton>
          <p className="text-center text-xs text-ink-3">{t("pc.finish_help")}</p>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <StepRail steps={steps} current={0} />
      <h1 className="mt-5 text-2xl font-bold sm:text-3xl">{t("pc.title")}</h1>
      <p className="mt-1 mb-6 text-ink-2">{t("pc.sub")}</p>
      <ProblemStarter serverStt={hasServerStt()} />
    </div>
  );
}

import Link from "next/link";
import { requireStudent } from "@/lib/guards";
import { getT, getLang } from "@/lib/i18n/server";
import { StepRail } from "@/components/StepRail";
import { AiChatPanel } from "@/components/AiChatPanel";
import { PathwayEditor, PathwayView, type Paths } from "@/components/PathwayCards";
import { answerCareerIntake, finishCareerIntakeNow, restartIntake, editPathways } from "@/app/actions/student";
import { SubmitButton } from "@/components/SubmitButton";
import { CvUpload } from "./CvUpload";
import { Notice, PageTitle, fmtDate } from "@/components/ui";
import { hasServerStt } from "@/lib/stt";
import { AiBusyNotice } from "@/components/AiBusyNotice";
import { retryPathways } from "@/app/actions/ai";
import { hasBusyFlag } from "@/lib/ai/guard";

// AI calls can take several seconds.
export const maxDuration = 60;

export const metadata = { title: "Career profile" };

export default async function ProfilePage() {
  const { user, profile } = await requireStudent();
  const t = await getT();
  const lang = await getLang();
  const steps = [t("profile.rail1"), t("profile.rail2"), t("profile.rail3")];
  const cv = profile.cv_parsed as { skills?: string[]; education?: { degree: string; institution: string }[] } | null;

  if (!cv) {
    return (
      <div className="mx-auto max-w-2xl">
        <StepRail steps={steps} current={0} />
        <h1 className="mt-5 text-2xl font-bold sm:text-3xl">{t("profile.cv_title")}</h1>
        <p className="mt-1 mb-6 text-ink-2">{t("profile.cv_sub")}</p>
        <CvUpload />
      </div>
    );
  }

  if (!profile.pathways) {
    const turns = (profile.intake_transcript as { role: "assistant" | "user"; text: string; key?: string }[]).map((x) => ({ role: x.role, text: x.key ? t(x.key) : x.text }));
    const answered = turns.filter((x) => x.role === "user").length;
    return (
      <div className="mx-auto max-w-2xl">
        <StepRail steps={steps} current={1} />
        <h1 className="mt-5 text-2xl font-bold sm:text-3xl">{t("profile.chat_title")}</h1>
        <p className="mt-1 mb-4 text-ink-2">{t("profile.chat_sub")}</p>
        {cv.skills && cv.skills.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-sm font-semibold text-ink-3">{t("profile.from_cv")}</span>
            {cv.skills.slice(0, 10).map((s) => <span key={s} className="chip">{s}</span>)}
          </div>
        )}
        <AiChatPanel turns={turns} action={answerCareerIntake} hidden={{}} placeholder={t("profile.answer_ph")} voice serverStt={hasServerStt()} assistantName={t("profile.assistant")} />
        {answered >= 2 && (
          <form action={finishCareerIntakeNow} className="mt-4 flex justify-center">
            <SubmitButton className="btn-secondary" pendingLabel={t("profile.building")}>{t("profile.build_now")}</SubmitButton>
          </form>
        )}
      </div>
    );
  }

  const paths = profile.pathways as Paths;
  if (!profile.approved_at) {
    return (
      <div>
        <StepRail steps={steps} current={2} />
        <h1 className="mt-5 text-2xl font-bold sm:text-3xl">{t("profile.paths_title")}</h1>
        <p className="mt-1 mb-6 max-w-2xl text-ink-2">{t("profile.paths_sub")}</p>
        {(await hasBusyFlag(`pathways:${user.id}`)) && <AiBusyNotice className="mb-4 max-w-2xl" message="ai.busy_basic" retry={retryPathways} />}
        <PathwayEditor key={profile.updated_at ? String(profile.updated_at) : undefined} initial={paths} />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        eyebrow={t("profile.eyebrow")}
        title={user.name ?? ""}
        sub={[profile.course, profile.year, profile.college].filter(Boolean).join(" · ")}
      />
      <Notice kind="success" className="mb-6">{t("profile.approved_on", { date: fmtDate(profile.approved_at, lang) })}</Notice>
      <PathwayView paths={paths} />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 font-bold">{t("profile.skills")}</h2>
          <div className="flex flex-wrap gap-1.5">{(cv.skills ?? []).map((s) => <span key={s} className="chip">{s}</span>)}</div>
          {(profile.target_roles ?? []).length > 0 && (
            <>
              <h2 className="mt-5 mb-2 font-bold">{t("profile.targets")}</h2>
              <p className="text-ink-2">{(profile.target_roles as string[]).join(", ")}</p>
            </>
          )}
        </div>
        <div className="card flex flex-col gap-3 p-5">
          <h2 className="font-bold">{t("profile.next")}</h2>
          <Link href="/student/problems?tab=suggested" className="btn-primary">{t("profile.see_suggested")}</Link>
          <form action={editPathways}><SubmitButton className="btn-secondary w-full">{t("profile.edit_paths")}</SubmitButton></form>
          <form action={restartIntake}><SubmitButton className="btn-ghost w-full">{t("profile.start_over")}</SubmitButton></form>
        </div>
      </div>
    </div>
  );
}

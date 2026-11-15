import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/guards";
import { getT, getLang } from "@/lib/i18n/server";
import { loadWorkspace, SubmissionView, ImpactTimeline, ReportTeaser } from "@/components/Workspace";
import { ChatThread } from "@/components/ChatThread";
import { SubmissionForm, WithdrawButton } from "@/components/EngagementForms";
import { BackLink, Notice, StatusBadge } from "@/components/ui";

export const metadata = { title: "Workspace" };

export default async function StudentWorkspace({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { user } = await requireStudent();
  const ws = await loadWorkspace(id, user);
  if (ws.e.student_id !== user.id) notFound();
  const t = await getT();
  const lang = await getLang();
  const { e } = ws;
  const canSubmit = ["taken_up", "in_progress", "needs_changes"].includes(e.status);
  const lastReason = ws.history.find((h) => (h.status === "rejected" || h.status === "needs_changes") && h.reason);
  return (
    <div>
      <BackLink href="/student/dashboard" label={t("nav.home")} />
      <div className="mb-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={e.status} t={t} />
          <span className="text-sm text-ink-3">{e.business_name} · {e.business_city}</span>
        </div>
        <h1 className="text-2xl leading-tight font-bold sm:text-3xl">
          <Link href={`/student/problems/${e.problem_id}`} className="hover:underline">{e.problem_title}</Link>
        </h1>
      </div>
      {sp.new && ["taken_up", "in_progress"].includes(e.status) && <Notice kind="success" className="mb-5">{t("eng.taken_up_notice", { business: e.business_name })}</Notice>}
      {e.status === "rejected" && lastReason && <Notice kind="error" className="mb-5"><strong>{t("eng.rejected_reason")}</strong> {lastReason.reason}</Notice>}
      {e.status === "needs_changes" && <Notice kind="warn" className="mb-5"><strong>{t("eng.needs_changes_notice")}</strong> {lastReason?.reason ?? ""}</Notice>}
      {e.status === "withdrawn" && <Notice kind="info" className="mb-5">{t("eng.withdrawn_notice")}</Notice>}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ChatThread engagementId={id} otherName={e.business_name} disabled={e.status === "withdrawn"} />
          {ws.history.length > 0 && (
            <section className="card p-5">
              <h2 className="mb-4 font-bold">{t("impact.timeline")}</h2>
              <ImpactTimeline updates={ws.updates} feedback={ws.feedback} history={ws.history} t={t} lang={lang} />
            </section>
          )}
        </div>
        <aside className="space-y-6">
          {canSubmit ? (
            <section className="card p-5">
              <h2 className="mb-1 font-bold">{e.status === "needs_changes" ? t("sub.title_again") : t("sub.title")}</h2>
              <p className="mb-4 text-sm text-ink-2">{t("sub.help")}</p>
              <SubmissionForm engagementId={id} resubmit={e.status === "needs_changes"} />
              {["taken_up", "in_progress"].includes(e.status) && <div className="mt-4 border-t border-line pt-3"><WithdrawButton engagementId={id} /></div>}
            </section>
          ) : ws.sub ? (
            <section className="card p-5">
              <h2 className="mb-3 font-bold">{t("sub.yours")}</h2>
              <SubmissionView sub={ws.sub} files={ws.subFiles} t={t} lang={lang} />
              {e.status === "submitted" && <p className="mt-4 rounded-xl bg-sand px-3 py-2 text-sm">{t("sub.waiting_receipt", { business: e.business_name })}</p>}
            </section>
          ) : null}
          {e.status !== "withdrawn" && <ReportTeaser ws={ws} t={t} lang={lang} isStudent />}
        </aside>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBusiness } from "@/lib/guards";
import { getT, getLang } from "@/lib/i18n/server";
import { one } from "@/lib/db";
import { loadWorkspace, SubmissionView, ImpactTimeline, ReportTeaser } from "@/components/Workspace";
import { ChatThread } from "@/components/ChatThread";
import { ConfirmReceiptButton, StatusSetter, ImpactUpdateForm, FeedbackForm } from "@/components/EngagementForms";
import { BackLink, StatusBadge } from "@/components/ui";

// AI calls can take several seconds.
export const maxDuration = 60;

export const metadata = { title: "Workspace" };

export default async function BusinessWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireBusiness();
  const ws = await loadWorkspace(id, user);
  if (ws.e.business_id !== user.id) notFound();
  const t = await getT();
  const lang = await getLang();
  const { e } = ws;
  const sp = await one(`select college, course, year from student_profiles where user_id = $1`, [e.student_id]);
  const tracking = ["accepted", "in_use"].includes(e.status);
  return (
    <div>
      <BackLink href={`/business/problems/${e.problem_id}`} label={t("common.back")} />
      <div className="mb-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={e.status} t={t} />
          <span className="text-sm text-ink-3">{e.student_name}{sp ? ` · ${[sp.course, sp.year, sp.college].filter(Boolean).join(", ")}` : ""}</span>
        </div>
        <h1 className="text-2xl leading-tight font-bold sm:text-3xl">
          <Link href={`/business/problems/${e.problem_id}`} className="hover:underline">{e.problem_title}</Link>
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="order-2 space-y-6 lg:order-1">
          <ChatThread engagementId={id} otherName={e.student_name} disabled={e.status === "withdrawn"} />
          {ws.history.length > 0 && (
            <section className="card p-5">
              <h2 className="mb-4 font-bold">{t("impact.timeline")}</h2>
              <ImpactTimeline updates={ws.updates} feedback={ws.feedback} history={ws.history} t={t} lang={lang} />
            </section>
          )}
        </div>

        <aside className="order-1 space-y-6 lg:order-2">
          {e.status === "withdrawn" && <section className="card p-5 text-ink-2">{t("eng.biz_withdrawn", { name: e.student_name })}</section>}
          {["taken_up", "in_progress", "needs_changes"].includes(e.status) && (
            <section className="card p-5">
              <h2 className="font-bold">{t("eng.biz_working_title", { name: e.student_name })}</h2>
              <p className="mt-1 text-sm text-ink-2">{t("eng.biz_working_body")}</p>
            </section>
          )}
          {ws.sub && (
            <section className={`card p-5 ${e.status === "submitted" ? "border-saffron ring-2 ring-saffron/30" : ""}`}>
              <h2 className="mb-3 font-bold">{t("sub.from", { name: e.student_name })}</h2>
              <SubmissionView sub={ws.sub} files={ws.subFiles} t={t} lang={lang} />
              {e.status === "submitted" && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="mb-3 text-sm text-ink-2">{t("eng.confirm_help")}</p>
                  <ConfirmReceiptButton engagementId={id} />
                </div>
              )}
              {["received", "accepted"].includes(e.status) && (
                <div className="mt-4 border-t border-line pt-4">
                  <StatusSetter engagementId={id} current={e.status} />
                </div>
              )}
            </section>
          )}
          {tracking && (
            <section className="card p-5">
              <h2 className="font-bold">{t("impact.title")}</h2>
              <p className="mt-1 mb-4 text-sm text-ink-2">{t("impact.help")}</p>
              <ImpactUpdateForm engagementId={id} />
            </section>
          )}
          {ws.sub && e.status !== "withdrawn" && (
            <section className="card p-5">
              <FeedbackForm engagementId={id} />
            </section>
          )}
          {ws.sub && <ReportTeaser ws={ws} t={t} lang={lang} isStudent={false} />}
        </aside>
      </div>
    </div>
  );
}

import Link from "next/link";
import { requireUser, studentProfile } from "@/lib/session";
import { one } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { DetailsForm, VerifyPanel } from "./Forms";
import { Notice, StatusBadge } from "@/components/ui";

export const metadata = { title: "Get started" };

export default async function StudentOnboarding() {
  const user = await requireUser("student");
  const profile = await studentProfile(user.id);
  const t = await getT();
  const lastReq = await one(`select status, note from verification_requests where student_id = $1 order by submitted_at desc limit 1`, [user.id]);
  const status = profile?.verification_status ?? "not_started";
  const hasDetails = Boolean(profile?.college);
  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <p className="eyebrow">{t("so.eyebrow")}</p>
        <h1 className="mt-1 text-3xl font-bold">{t("so.title", { name: user.name?.split(" ")[0] ?? "" })}</h1>
        <p className="mt-2 text-ink-2">{t("so.sub")}</p>
      </div>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs text-paper">1</span>{t("so.details")}</h2>
        <DetailsForm initial={{ name: user.name ?? "", college: profile?.college ?? "", course: profile?.course ?? "", year: profile?.year ?? "" }} />
      </section>

      <section id="verify" className={`card scroll-mt-24 p-5 sm:p-6 ${hasDetails ? "" : "pointer-events-none opacity-50"}`}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-bold"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs text-paper">2</span>{t("so.verify")}</h2>
          <StatusBadge status={status} t={t} />
        </div>
        {status === "verified" ? (
          <Notice kind="success">{profile?.college_email ? t("so.verified_email", { email: profile.college_email }) : t("so.verified")}</Notice>
        ) : status === "pending" ? (
          <Notice kind="warn">{t("so.pending")}</Notice>
        ) : (
          <>
            {status === "rejected" && <Notice kind="error" className="mb-4">{t("so.rejected")}{lastReq?.note ? ` ${lastReq.note}` : ""}</Notice>}
            <p className="mb-4 text-sm text-ink-2">{t("so.verify_why")}</p>
            <VerifyPanel />
          </>
        )}
      </section>

      {hasDetails && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/student/profile" className="btn-primary flex-1">{t("so.next_profile")}</Link>
          <Link href="/student/problems" className="btn-secondary">{t("so.browse")}</Link>
        </div>
      )}
    </div>
  );
}

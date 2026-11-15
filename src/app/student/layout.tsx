import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { requireUser, studentProfile } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("student");
  const profile = await studentProfile(user.id);
  const t = await getT();
  const status = profile?.verification_status ?? "not_started";
  return (
    <AppShell user={user}>
      {profile?.college && status !== "verified" && (
        <div className={`no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${status === "pending" ? "border-saffron/30 bg-saffron-soft" : status === "rejected" ? "border-clay/25 bg-clay-soft" : "border-indigo/15 bg-indigo-soft"}`}>
          <p className="text-sm font-medium">
            <strong className="font-bold">{t(`vb.${status}_title`)}</strong> {t(`vb.${status}_body`)}
          </p>
          {status !== "pending" && <Link href="/student/onboarding#verify" className="btn-primary btn-sm">{t("vb.cta")}</Link>}
        </div>
      )}
      {children}
    </AppShell>
  );
}

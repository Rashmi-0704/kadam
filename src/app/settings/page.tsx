import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { requireUser, businessProfile } from "@/lib/session";
import { getT, getLang } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/LanguageToggle";
import { BusinessProfileForm } from "@/app/business/onboarding/BusinessProfileForm";
import { signOut } from "@/app/actions/common";
import { SubmitButton } from "@/components/SubmitButton";
import { Notice, PageTitle, Section, fmtDate } from "@/components/ui";

export const metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const t = await getT();
  const lang = await getLang();
  const sp = await searchParams;
  const biz = user.role === "business" ? await businessProfile(user.id) : null;
  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-xl">
        <PageTitle title={t("settings.title")} />
        {sp.saved && <Notice kind="success" className="mb-6">{t("settings.saved")}</Notice>}
        {user.role === "business" && <Section title={t("settings.language")}>
          <div className="card flex items-center justify-between gap-3 p-4">
            <p className="text-sm text-ink-2">{t("settings.language_help")}</p>
            <LanguageToggle />
          </div>
        </Section>}
        <Section title={t("settings.account")}>
          <dl className="card divide-y divide-line">
            <div className="flex justify-between gap-3 p-4"><dt className="text-ink-3">{t("settings.name")}</dt><dd className="font-semibold">{user.name}</dd></div>
            <div className="flex justify-between gap-3 p-4"><dt className="text-ink-3">{t("auth.email")}</dt><dd className="truncate font-semibold">{user.email}</dd></div>
            <div className="flex justify-between gap-3 p-4"><dt className="text-ink-3">{t("settings.role")}</dt><dd className="font-semibold">{t(`settings.role_${user.role}`)}</dd></div>
          </dl>
          {user.role === "student" && <Link href="/student/profile" className="btn-secondary mt-3 w-full">{t("settings.edit_student")}</Link>}
        </Section>
        {biz && (
          <Section title={t("settings.business")}>
            <div className="card p-5"><BusinessProfileForm profile={biz} next="settings" /></div>
          </Section>
        )}
        <Section title={t("settings.consent")}>
          <div className="card p-4 text-sm text-ink-2">
            <p>{t("auth.consent")}</p>
            {user.consent_at && <p className="mt-2 font-semibold text-ink">{t("settings.consent_on", { date: fmtDate(user.consent_at, lang) })}</p>}
          </div>
        </Section>
        <form action={signOut}>
          <SubmitButton className="btn-danger w-full">{t("settings.sign_out")}</SubmitButton>
        </form>
      </div>
    </AppShell>
  );
}

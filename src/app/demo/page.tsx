import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { DEMO_ACCOUNTS } from "@/db/seed-data";
import { demoSignIn, demoReset } from "@/app/actions/auth";
import { Logo } from "@/components/Logo";
import { SubmitButton } from "@/components/SubmitButton";
import { Notice } from "@/components/ui";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Quick sign-in", robots: { index: false } };

export default async function DemoPage({ searchParams }: { searchParams: Promise<{ reset?: string; missing?: string }> }) {
  if (!env.demoMode) notFound();
  const sp = await searchParams;
  const t = await getT();
  const groups = ["student", "business", "admin"] as const;
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <Logo />
      <h1 className="mt-8 text-3xl font-bold">{t("demo.title")}</h1>
      <p className="mt-1 text-ink-2">{t("demo.sub")}</p>
      {sp.reset && <Notice kind="success" className="mt-4">{t("demo.reset_done")}</Notice>}
      {sp.missing && <Notice kind="warn" className="mt-4">{t("demo.missing")}</Notice>}
      {groups.map((g) => (
        <section key={g} className="mt-8">
          <h2 className="eyebrow mb-3">{t(`demo.group_${g}`)}</h2>
          <div className="grid gap-2">
            {DEMO_ACCOUNTS.filter((a) => a.role === g).map((a) => (
              <form key={a.id} action={demoSignIn}>
                <input type="hidden" name="id" value={a.id} />
                <button className="card flex w-full items-center justify-between gap-3 p-4 text-left hover:border-ink">
                  <span>
                    <span className="block font-bold">{a.label}</span>
                    <span className="text-sm text-ink-2">{a.note}</span>
                  </span>
                  <span aria-hidden="true" className="text-xl">→</span>
                </button>
              </form>
            ))}
          </div>
        </section>
      ))}
      <form action={demoReset} className="mt-10 border-t border-line pt-6">
        <p className="mb-3 text-sm text-ink-2">{t("demo.reset_help")}</p>
        <SubmitButton className="btn-secondary" pendingLabel={t("demo.resetting")}>{t("demo.reset")}</SubmitButton>
      </form>
    </main>
  );
}

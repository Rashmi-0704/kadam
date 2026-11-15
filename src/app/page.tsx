import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getT } from "@/lib/i18n/server";
import { currentUser, homeFor } from "@/lib/session";

export default async function Landing() {
  const t = await getT();
  const u = await currentUser();
  return (
    <div className="overflow-x-hidden">
      <header className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        <Logo />
        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle compact />
          <Link href={u ? homeFor(u.role) : "/auth"} className="btn-primary btn-sm whitespace-nowrap">{u ? t("landing.open") : t("landing.login")}</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 pt-8 pb-16 md:grid-cols-[1.1fr_1fr] md:pt-16">
        <div>
          <p className="eyebrow">{t("landing.tagline")}</p>
          <h1 className="mt-3 text-[34px] leading-[1.08] font-extrabold break-words sm:text-[56px]">
            {t("landing.h1a")} <span className="text-saffron-deep">{t("landing.h1b")}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2">{t("landing.sub")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth?as=student" className="btn-primary px-7">{t("landing.cta_student")}</Link>
            <Link href="/auth?as=business" className="btn-secondary px-7">{t("landing.cta_business")}</Link>
          </div>
          <p className="mt-4 text-sm text-ink-3">{t("landing.not_portal")}</p>
        </div>

        {/* Outcome preview: what a student walks away with */}
        <div className="relative mx-auto w-full max-w-md min-w-0 pl-3 sm:pl-0">
          <div className="absolute -top-4 -left-4 h-full w-full rounded-3xl bg-saffron-soft" aria-hidden="true" />
          <div className="relative card rotate-[-1.2deg] p-6 shadow-[0_20px_60px_-30px_rgba(28,26,39,0.45)]">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{t("landing.card_eyebrow")}</span>
              <span className="rounded-full bg-leaf px-2.5 py-1 text-xs font-bold text-white">{t("status.in_use")}</span>
            </div>
            <h3 className="mt-3 text-xl leading-snug font-bold">{t("landing.card_title")}</h3>
            <p className="mt-1 text-sm text-ink-2">{t("landing.card_meta")}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-paper p-3">
                <p className="text-xs text-ink-3">{t("landing.card_m1")}</p>
                <p className="font-display text-2xl font-bold">38 → 81</p>
              </div>
              <div className="rounded-xl bg-paper p-3">
                <p className="text-xs text-ink-3">{t("landing.card_m2")}</p>
                <p className="font-display text-2xl font-bold">+₹36k</p>
              </div>
            </div>
            <div className="mt-5 border-t border-dashed border-line pt-4">
              <p className="text-xs font-bold text-ink-3 uppercase">{t("landing.card_resume")}</p>
              <p className="mt-1.5 text-sm leading-relaxed">“{t("landing.card_bullet")}”</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="max-w-2xl text-3xl font-bold">{t("landing.walls_title")}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border-t border-paper/20 pt-4">
                <p className="font-display text-sm font-bold text-saffron">0{n}</p>
                <h3 className="mt-1 text-xl font-bold">{t(`landing.wall${n}`)}</h3>
                <p className="mt-1 text-paper/70">{t(`landing.wall${n}_sub`)}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 grid gap-4 border-t border-paper/15 pt-8 sm:grid-cols-3">
            {[
              ["56.35%", "landing.stat1"],
              ["11.2%", "landing.stat2"],
              ["56%", "landing.stat3"],
            ].map(([n, k]) => (
              <div key={k}>
                <p className="font-display text-4xl font-extrabold text-saffron">{n}</p>
                <p className="mt-1 text-sm text-paper/75">{t(k)}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-paper/45">{t("landing.sources")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="eyebrow">{t("landing.how_eyebrow")}</p>
        <h2 className="mt-2 text-3xl font-bold">{t("landing.how_title")}</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="card relative p-5">
              <div className="flex items-end gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((s) => (
                  <span key={s} className={`w-3 rounded-sm ${s <= n ? "bg-saffron" : "bg-sand"}`} style={{ height: 6 + s * 5 }} />
                ))}
              </div>
              <h3 className="mt-4 text-lg font-bold">{t(`landing.step${n}`)}</h3>
              <p className="mt-1 text-sm text-ink-2">{t(`landing.step${n}_sub`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="card grid gap-6 bg-sand p-6 sm:p-10 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <p className="eyebrow">{t("landing.biz_eyebrow")}</p>
            <h2 className="mt-2 text-3xl font-bold">{t("landing.biz_title")}</h2>
            <p className="mt-3 text-ink-2">{t("landing.biz_sub")}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/auth?as=business" className="btn-primary">{t("landing.cta_business")}</Link>
            <p className="text-center text-sm text-ink-3">{t("landing.biz_note")}</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-ink-3">
          <Logo />
          <span>{t("landing.tagline")}</span>
        </div>
      </footer>
    </div>
  );
}

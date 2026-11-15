import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { LandingHero } from "@/components/scene/LandingHero";
import { Reveal, GrowSteps } from "@/components/scene/Motion";
import { VoiceDemo } from "@/components/scene/VoiceDemo";
import { LogoMark } from "@/components/Logo";

export const metadata = { title: "For businesses and NGOs", description: "Tell Kadam a problem in your own language. College students will solve it for free." };

const HELP = [
  { key: "marketing", icon: <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1ZM16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14" /> },
  { key: "accounts", icon: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0" /></> },
  { key: "stock", icon: <><path d="M3 7l9-4 9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7" /></> },
  { key: "website", icon: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 8h18M8 21h8" /></> },
  { key: "data", icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /> },
  { key: "stories", icon: <path d="M4 5h11a3 3 0 0 1 3 3v12H7a3 3 0 0 1-3-3V5Zm14 3h2v12" /> },
];

export default async function BusinessesHome() {
  const t = await getT();
  return (
    <div className="bg-paper">
      <LandingHero
        focus="business"
        eyebrow={t("bl.eyebrow")}
        h1={t("bl.h1")}
        accent={t("bl.h1_accent")}
        sub={t("bl.sub")}
        cta={t("bl.cta")}
        ctaHref="/auth?as=business"
        secondary={t("bl.secondary")}
        secondaryHref="#how"
        login={t("landing.login")}
        loginHref="/auth?as=business"
        switchLabel={t("bl.switch")}
        switchHref="/start/student"
        showLanguage
      />

      <section className="border-b border-line bg-sand">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 text-sm font-semibold text-ink-2">
          {["bl.trust1", "bl.trust2", "bl.trust3", "bl.trust4"].map((k) => (
            <span key={k} className="inline-flex items-center gap-2"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-leaf text-[11px] text-white">✓</span>{t(k)}</span>
          ))}
        </div>
      </section>

      <section id="how" className="scroll-mt-4">
        <Reveal className="mx-auto max-w-6xl px-4 py-20">
          <p data-reveal className="eyebrow">{t("bl.how_eyebrow")}</p>
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
            <h2 data-reveal className="mt-2 max-w-3xl text-[32px] leading-tight font-bold sm:text-[44px]">{t("bl.how_title")}</h2>
            <div data-reveal className="pt-4"><VoiceDemo label={t("bl.voice_label")} lines={[t("bl.voice_1"), t("bl.voice_2"), t("bl.voice_3")]} done={t("bl.voice_done")} /></div>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <li key={n} data-reveal className="card relative overflow-hidden p-6">
                <span className="absolute -top-6 -right-2 font-display text-[120px] leading-none font-extrabold text-sand" aria-hidden="true">{n}</span>
                <div className="relative">
                  <GrowSteps n={3} active={n} />
                  <h3 className="mt-4 text-xl font-bold">{t(`bl.step${n}`)}</h3>
                  <p className="mt-2 text-ink-2">{t(`bl.step${n}_sub`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="bg-ink text-paper">
        <Reveal className="mx-auto max-w-6xl px-4 py-20">
          <p data-reveal className="eyebrow text-saffron">{t("bl.help_eyebrow")}</p>
          <h2 data-reveal className="mt-2 max-w-3xl text-[32px] leading-tight font-bold sm:text-[44px]">{t("bl.help_title")}</h2>
          <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
            {HELP.map((h) => (
              <li key={h.key} data-reveal className="group rounded-2xl border border-paper/10 bg-paper/[0.04] p-5 transition hover:border-saffron/60 hover:bg-paper/[0.08]">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-saffron transition group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{h.icon}</svg>
                <h3 className="mt-4 font-bold">{t(`bl.help_${h.key}`)}</h3>
                <p className="mt-1 text-sm text-paper/65">{t(`bl.help_${h.key}_sub`)}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <Reveal className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p data-reveal className="eyebrow">{t("bl.story_eyebrow")}</p>
            <h2 data-reveal className="mt-2 text-[30px] leading-tight font-bold sm:text-[40px]">{t("bl.story_title")}</h2>
            <p data-reveal className="mt-4 text-lg text-ink-2">{t("bl.story_body")}</p>
          </div>
          <div data-reveal className="grid gap-3">
            <div className="card border-clay/30 bg-clay-soft/50 p-5">
              <p className="text-xs font-bold tracking-wide text-clay uppercase">{t("bl.before")}</p>
              <p className="mt-1 text-lg font-semibold">{t("bl.before_text")}</p>
            </div>
            <div className="card border-leaf/30 bg-leaf-soft/60 p-5">
              <p className="text-xs font-bold tracking-wide text-leaf uppercase">{t("bl.after")}</p>
              <p className="mt-1 text-lg font-semibold">{t("bl.after_text")}</p>
            </div>
          </div>
        </div>
      </Reveal>

      <section className="bg-[#120f1d] text-paper">
        <Reveal className="mx-auto max-w-6xl px-4 py-20 text-center">
          <div data-reveal className="mx-auto mb-6 w-fit"><LogoMark className="h-12 w-12" /></div>
          <h2 data-reveal className="mx-auto max-w-2xl text-[32px] leading-tight font-bold sm:text-[44px]">{t("bl.final_title")}</h2>
          <p data-reveal className="mx-auto mt-3 max-w-lg text-paper/70">{t("bl.final_sub")}</p>
          <Link data-reveal href="/auth?as=business" className="btn-accent mt-8 px-10 text-base">{t("bl.cta")} →</Link>
        </Reveal>
      </section>

      <footer className="bg-[#0d0b14] text-paper/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm">
          <span>{t("landing.tagline")}</span>
          <Link href="/" className="underline underline-offset-4 hover:text-paper">{t("bl.not_business")}</Link>
        </div>
      </footer>
    </div>
  );
}

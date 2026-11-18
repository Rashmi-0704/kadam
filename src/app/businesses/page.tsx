import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { LandingHero } from "@/components/scene/LandingHero";
import { Reveal, GrowSteps } from "@/components/scene/Motion";
import { VoiceDemo } from "@/components/scene/VoiceDemo";
import { LockUp } from "@/components/Logo";
import { Highlight } from "@/components/motion/Highlight";
import { FaqTabs } from "@/components/home/FaqTabs";
import { faqTabs } from "@/components/home/faq";

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
    <div className="bg-canvas">
      <LandingHero
        focus="business"
        tagline={t("landing.tagline")}
        strip={{ text: t("strip.student"), href: "/students" }}
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
        words={[t("hw.p1"), t("hw.p2"), t("hw.p3"), t("hw.p4")]}
      />

      <section className="border-b border-line bg-mist">
        <Reveal className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 text-sm font-semibold text-ink-2">
          {["bl.trust1", "bl.trust2", "bl.trust3", "bl.trust4"].map((k) => (
            <span key={k} data-reveal className="inline-flex items-center gap-2"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-ink text-[11px] text-white">✓</span>{t(k)}</span>
          ))}
        </Reveal>
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
                <span className="absolute -top-6 -right-2 font-display text-[120px] leading-none font-extrabold text-mist" aria-hidden="true">{n}</span>
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

      <section className="border-y-2 border-line bg-primary-soft">
        <Reveal className="mx-auto max-w-6xl px-4 py-20">
          <p data-reveal className="eyebrow">{t("bl.help_eyebrow")}</p>
          <h2 data-reveal className="mt-2 max-w-3xl text-[32px] leading-tight font-bold sm:text-[44px]">{t("bl.help_title")}</h2>
          <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
            {HELP.map((h) => (
              <li key={h.key} data-reveal className="glow-card group card p-5 transition hover:-translate-y-0.5">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary transition group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{h.icon}</svg>
                <h3 className="mt-4 font-bold">{t(`bl.help_${h.key}`)}</h3>
                <p className="mt-1 text-sm text-ink-2">{t(`bl.help_${h.key}_sub`)}</p>
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
            <div className="card border-alert/30 bg-alert-soft/50 p-5">
              <p className="text-xs font-bold tracking-wide text-alert uppercase">{t("bl.before")}</p>
              <p className="mt-1 text-lg font-semibold">{t("bl.before_text")}</p>
            </div>
            <div className="card border-success/30 bg-success-soft/60 p-5">
              <p className="text-xs font-bold tracking-wide text-success-ink uppercase">{t("bl.after")}</p>
              <p className="mt-1 text-lg font-semibold">{t("bl.after_text")}</p>
            </div>
          </div>
        </div>
      </Reveal>

      <FaqTabs title={t("faq.title")} tabs={faqTabs(t, "businesses")} />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary-soft via-canvas to-highlight-soft">
        <Reveal className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p data-reveal className="font-display text-2xl font-extrabold sm:text-3xl">Kadam. <Highlight>{t("landing.tagline")}</Highlight></p>
          <h2 data-reveal className="mx-auto mt-4 max-w-2xl text-[32px] leading-tight font-bold sm:text-[44px]">{t("bl.final_title")}</h2>
          <p data-reveal className="mx-auto mt-3 max-w-lg text-lg text-ink-2">{t("bl.final_sub")}</p>
          <Link data-reveal href="/auth?as=business" className="btn-primary mt-8 px-10 text-base">{t("bl.cta")} →</Link>
        </Reveal>
      </section>

      <footer className="border-t-2 border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-ink-2">
          <LockUp tagline={t("landing.tagline")} />
          <Link href="/" className="font-semibold underline underline-offset-4 hover:text-primary-deep">{t("bl.not_business")}</Link>
        </div>
      </footer>
    </div>
  );
}

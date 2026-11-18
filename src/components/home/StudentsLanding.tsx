import Link from "next/link";
import { q } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { LandingHero } from "@/components/scene/LandingHero";
import { Reveal, Marquee, CountUp } from "@/components/scene/Motion";
import { Evidence } from "./Evidence";
import { LockUp } from "@/components/Logo";
import { Highlight } from "@/components/motion/Highlight";
import { FaqTabs } from "@/components/home/FaqTabs";
import { faqTabs } from "@/components/home/faq";
import { InterestPaths } from "./InterestPaths";

const HOW = [
  { title: "Upload your CV, see your paths", icon: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5M9 14l2 2 4-4" /></> },
  { title: "Pick a real problem", icon: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></> },
  { title: "Solve it with the business", icon: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /> },
  { title: "Get your impact report", icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /> },
];

/** The one landing page, shown on both / and /students. English only, by design: no language switch for students. */
export async function StudentsLanding() {
  const t = await getT("en");
  const live = await q(`select title from problems where status = 'live' order by sort_rank asc nulls last, live_at desc nulls last limit 12`).catch(() => []);
  const titles = live.length ? live.map((r) => r.title as string) : ["Launch tiffin subscription plans and reach 100 subscribers", "One-page dashboard for our 12 learning centres", "Cost sheet showing the true cost and profit of each of our 12 saris"];

  return (
    <div className="bg-canvas">
      <LandingHero
        focus="student"
        tagline="Take your first step."
        strip={{ text: "Are you a business? Post a real problem →", href: "/businesses" }}
        eyebrow="For college students · every stream"
        h1="You need experience for that entry-level job,"
        accent="but you can't get that experience without that entry-level job."
        h1Class="text-[30px] leading-[1.1] font-extrabold tracking-tight sm:text-[42px] lg:text-[50px]"
        breakAccent
        cta="Start for free"
        ctaHref="/auth?as=student"
        secondary="See how it works"
        secondaryHref="#how"
        login="Log in"
        loginHref="/auth?as=student"
        switchLabel="I run a business or NGO instead →"
        switchHref="/start/business"
        showLanguage={false}
        words={["Real problems", "Real solutions", "Real impact", "Take your first step"]}
      />


      <div className="border-y-2 border-primary-edge bg-primary py-3 font-display text-lg font-bold text-white">
        <Marquee items={titles} />
      </div>

      <Evidence />

      <InterestPaths />

      <section id="how" className="scroll-mt-4 border-y-2 border-line bg-primary-soft">
        <Reveal className="mx-auto max-w-6xl px-4 py-20">
          <h2 data-reveal className="text-[32px] font-bold sm:text-[44px]">How it works</h2>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {HOW.map((s, i) => (
              <li key={s.title} data-reveal className="relative border-t-2 border-line-deep pt-6">
                <span className="absolute -top-[13px] left-0 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 font-display text-xs font-bold text-white">0{i + 1}</span>
                <div className="mb-4 flex items-end justify-between gap-3" aria-hidden="true">
                  <span className="flex items-end gap-1">
                    {[0, 1, 2, 3].map((n) => <span key={n} className={`w-3 rounded-sm ${n <= i ? "bg-primary" : "bg-line-deep"}`} style={{ height: 8 + n * 8 }} />)}
                  </span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                  </span>
                </div>
                <p className="text-xl leading-snug font-bold">{s.title}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <Reveal className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p data-reveal className="eyebrow">Proof, not promises</p>
            <h2 data-reveal className="mt-2 text-[32px] leading-tight font-bold sm:text-[40px]">Your work, measured by the people who use it.</h2>
            <p data-reveal className="mt-4 text-lg text-ink-2">Businesses post updates every two weeks: time saved, sales, customers. Each update makes your impact report stronger, with a share link and a PDF.</p>
            <Link data-reveal href="/auth?as=student" className="btn-primary mt-8 px-8">Build my profile</Link>
          </div>
          <div data-reveal className="space-y-4">
            <div className="relative mx-auto w-full max-w-sm pt-4">
              <div className="absolute -top-4 -left-4 h-full w-full rotate-[-3deg] rounded-3xl bg-glow/60" aria-hidden="true" />
              <div className="glow-card relative rounded-3xl border-2 border-line bg-card p-6 text-ink shadow-[0_30px_60px_-30px_rgba(67,56,202,0.45)]">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Impact report</span>
                  <span className="rounded-full bg-success-ink px-2.5 py-1 text-xs font-bold text-white">In use</span>
                </div>
                <p className="mt-3 font-display text-xl leading-snug font-bold">Grew tiffin subscriptions for a women-run kitchen</p>
                <p className="mt-1 text-sm text-ink-2">Rohan M. · B.Com · Bengaluru</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-mist p-3"><p className="text-xs text-ink-3">Subscribers</p><p className="font-display text-xl font-bold">38 → 81</p></div>
                  <div className="rounded-xl bg-mist p-3"><p className="text-xs text-ink-3">Revenue</p><p className="font-display text-xl font-bold">+₹36k/mo</p></div>
                </div>
                <p className="mt-4 border-t border-dashed border-line pt-3 text-sm">“Grew monthly subscriptions from 38 to 81 in six weeks with a ₹1,800 budget.”</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["38 → 81", "monthly subscribers for a tiffin kitchen"],
                ["58%", "trial-to-subscriber rate"],
                ["+₹36,000", "extra monthly revenue"],
                ["30 min", "saved every day on orders"],
              ].map(([n, l]) => (
                <div key={l} className="card p-5">
                  <p className="font-display text-3xl font-extrabold text-primary-deep">{/^\d/.test(n) && !n.includes("→") ? <CountUp value={n} /> : n}</p>
                  <p className="mt-1 text-sm text-ink-2">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <section className="border-y border-line bg-mist">
        <Reveal className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
          {[
            ["56.35%", "graduate employability in India (India Skills Report 2026)"],
            ["11.2%", "graduate unemployment, against 3.1% overall (PLFS 2025)"],
            ["56%", "of digitally hesitant MSMEs lack technical skills (CMR)"],
          ].map(([n, l]) => (
            <div key={l} data-reveal>
              <p className="font-display text-5xl font-extrabold"><CountUp value={n} /></p>
              <p className="mt-2 text-ink-2">{l}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <FaqTabs title={t("faq.title")} tabs={faqTabs(t, "students")} />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary-soft via-canvas to-highlight-soft">
        <Reveal className="relative mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 data-reveal className="mx-auto max-w-2xl text-[34px] leading-tight font-extrabold sm:text-[52px]">Kadam. <Highlight>Take your first step.</Highlight></h2>
          <p data-reveal className="mx-auto mt-3 max-w-lg text-lg text-ink-2">Free for students. Add your student ID and start in minutes.</p>
          <Link data-reveal href="/auth?as=student" className="btn-primary mt-8 px-10 text-base">Start for free →</Link>
        </Reveal>
      </section>

      <footer className="border-t-2 border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-ink-2">
          <LockUp tagline="Take your first step." />
          <Link href="/businesses" className="font-semibold underline underline-offset-4 hover:text-primary-deep">Run a business or NGO?</Link>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { q } from "@/lib/db";
import { LandingHero } from "@/components/scene/LandingHero";
import { Reveal, Marquee, CountUp, GrowSteps } from "@/components/scene/Motion";
import { LogoMark } from "@/components/Logo";

export const metadata = { title: "For students", description: "Solve real problems for small businesses and NGOs. Turn the results into an impact report for your resume." };

// Student homepage. English only, by design: no language switch for students.
export default async function StudentsHome() {
  const live = await q(`select title from problems where status = 'live' order by live_at desc nulls last limit 12`).catch(() => []);
  const titles = live.length ? live.map((r) => r.title as string) : ["Grow tiffin subscriptions", "Dashboard for 12 village centres", "True cost of each handloom sari"];

  return (
    <div className="bg-paper">
      <LandingHero
        focus="student"
        eyebrow="For college students · every stream"
        h1="Your degree says you studied."
        accent="Kadam proves you can do."
        sub="Solve real problems for kirana stores, startups and NGOs near you. When the business uses your work, Kadam turns the results into an impact report for your resume."
        cta="Start for free"
        ctaHref="/auth?as=student"
        secondary="See how it works"
        secondaryHref="#how"
        login="Log in"
        loginHref="/auth?as=student"
        switchLabel="I run a business or NGO instead →"
        switchHref="/start/business"
        showLanguage={false}
      />

      <div className="border-y border-ink bg-saffron py-3 font-display text-lg font-bold text-ink">
        <Marquee items={titles} />
      </div>

      <Reveal className="mx-auto max-w-6xl px-4 py-20">
        <p data-reveal className="eyebrow">The problem</p>
        <h2 data-reveal className="mt-2 max-w-3xl text-[32px] leading-tight font-bold sm:text-[44px]">Jobs want experience. You can&apos;t get experience without a job.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["No direction", "Which careers fit you, and which could you move into?", "Kadam reads your CV, chats with you, and shows roles you fit now, could pivot to, and could stretch for."],
            ["No real experience", "College projects are never used, and never measured.", "Take up problems from real businesses. If they use your work, it's measured and it counts."],
            ["No roadmap", "What to learn, in what order, and how to prove it.", "Skill maps for every role, with free resources — and real problems to practise on."],
          ].map(([title, pain, fix], i) => (
            <div key={title} data-reveal className="card flex flex-col gap-3 p-6">
              <GrowSteps n={3} active={i + 1} />
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-ink-2">{pain}</p>
              <p className="mt-auto rounded-xl bg-leaf-soft p-3 text-sm font-medium text-leaf">{fix}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <section id="how" className="scroll-mt-4 bg-ink text-paper">
        <Reveal className="mx-auto max-w-6xl px-4 py-20">
          <p data-reveal className="eyebrow text-saffron">How it works</p>
          <h2 data-reveal className="mt-2 text-[32px] font-bold sm:text-[44px]">Four steps from a degree to proof.</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              ["Find your direction", "Upload your CV and chat for two minutes. See your Now, Pivot and Stretch roles."],
              ["Pick a real problem", "“Suggested for you” matches problems to your path, with skills to brush up first."],
              ["Solve it together", "Chat with the owner, share files, submit your solution — code or not."],
              ["Show the impact", "As the business shares results, your report updates with resume-ready lines."],
            ].map(([title, body], i) => (
              <li key={title} data-reveal className="relative border-t-2 border-paper/15 pt-6">
                <span className="absolute -top-[13px] left-0 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-saffron px-2 font-display text-xs font-bold text-ink">0{i + 1}</span>
                <div className="mb-4 flex items-end gap-1" aria-hidden="true">
                  {[0, 1, 2, 3].map((s) => <span key={s} className={`w-3 rounded-sm ${s <= i ? "bg-saffron" : "bg-paper/15"}`} style={{ height: 8 + s * 8 }} />)}
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-2 text-paper/70">{body}</p>
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
            <p data-reveal className="mt-4 text-lg text-ink-2">Businesses post updates every two weeks — time saved, sales, customers. Each update makes your impact report stronger, with a share link and a PDF.</p>
            <Link data-reveal href="/auth?as=student" className="btn-primary mt-8 px-8">Build my profile</Link>
          </div>
          <div data-reveal className="space-y-4">
        <div className="relative mx-auto w-full max-w-sm pt-4">
          <div className="absolute -top-4 -left-4 h-full w-full rotate-[-3deg] rounded-3xl bg-saffron/80" aria-hidden="true" />
          <div className="relative rounded-3xl bg-paper p-6 text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Impact report</span>
              <span className="rounded-full bg-leaf px-2.5 py-1 text-xs font-bold text-white">In use</span>
            </div>
            <p className="mt-3 font-display text-xl leading-snug font-bold">Grew tiffin subscriptions for a women-run kitchen</p>
            <p className="mt-1 text-sm text-ink-2">Rohan M. · B.Com · Bengaluru</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-sand p-3"><p className="text-xs text-ink-3">Subscribers</p><p className="font-display text-xl font-bold">38 → 81</p></div>
              <div className="rounded-xl bg-sand p-3"><p className="text-xs text-ink-3">Revenue</p><p className="font-display text-xl font-bold">+₹36k/mo</p></div>
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
                <p className="font-display text-3xl font-extrabold text-saffron-deep">{/^\d/.test(n) && !n.includes("→") ? <CountUp value={n} /> : n}</p>
                <p className="mt-1 text-sm text-ink-2">{l}</p>
              </div>
            ))}
          </div>
          </div>
        </div>
      </Reveal>

      <section className="border-y border-line bg-sand">
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

      <section className="relative overflow-hidden bg-[#120f1d] text-paper">
        <Reveal className="relative mx-auto max-w-6xl px-4 py-20 text-center">
          <div data-reveal className="mx-auto mb-6 w-fit"><LogoMark className="h-12 w-12" /></div>
          <h2 data-reveal className="mx-auto max-w-2xl text-[32px] leading-tight font-bold sm:text-[44px]">Take your first kadam.</h2>
          <p data-reveal className="mx-auto mt-3 max-w-lg text-paper/70">Free for students. Verify with your college email and start in minutes.</p>
          <Link data-reveal href="/auth?as=student" className="btn-accent mt-8 px-10 text-base">Start for free →</Link>
        </Reveal>
      </section>

      <footer className="bg-[#0d0b14] text-paper/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm">
          <span>Kadam · Real Problems, Real Impact, Real Careers.</span>
          <Link href="/" className="underline underline-offset-4 hover:text-paper">Not a student?</Link>
        </div>
      </footer>
    </div>
  );
}

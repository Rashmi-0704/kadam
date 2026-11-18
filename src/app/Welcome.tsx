"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { KadamScene, type SceneFocus } from "@/components/scene/KadamScene";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LockUp } from "@/components/Logo";
import { RoleTrail } from "@/components/motion/RoleTrail";
import { HeroWords } from "@/components/motion/HeroWords";

type Text = Record<
  "tagline" | "home" | "who" | "whoSub" | "studentTitle" | "studentSub" | "studentGo" | "businessTitle" | "businessSub" | "businessGo" | "login" | "open" | "note",
  string
>;

const STUDENT_ICON = <><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></>;
const BUSINESS_ICON = <><path d="M3 9h18l-1.5-5h-15L3 9Z" /><path d="M4 9v11h16V9" /><path d="M10 20v-6h4v6" /></>;

function Door({ href, title, sub, go, icon, onFocus, tone }: { href: string; title: string; sub: string; go: string; icon: React.ReactNode; onFocus: (on: boolean) => void; tone: "student" | "business" }) {
  const student = tone === "student";
  return (
    <Link
      href={href}
      onPointerEnter={() => onFocus(true)}
      onPointerLeave={() => onFocus(false)}
      onFocus={() => onFocus(true)}
      onBlur={() => onFocus(false)}
      data-trail-block=""
      className={`door group relative flex flex-col items-center gap-4 overflow-hidden rounded-[28px] border-2 p-6 text-center transition duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 sm:min-h-[340px] sm:justify-center sm:gap-5 sm:p-8 ${
        student
          ? "glow-card border-primary-edge bg-primary text-white shadow-[0_6px_0_var(--color-primary-edge)] hover:bg-[#4f46e5]"
          : "glow-card border-line-deep bg-card text-ink shadow-[0_6px_0_var(--color-line-deep)] hover:border-primary"
      }`}
    >
      <span className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl sm:h-24 sm:w-24 ${student ? "bg-white text-primary" : "bg-highlight-soft text-highlight-deep"}`}>
        <svg viewBox="0 0 24 24" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
      </span>
      <span>
        <span className="block font-display text-2xl leading-tight font-extrabold sm:text-3xl">{title}</span>
        <span className={`mx-auto mt-2 block max-w-xs text-base ${student ? "text-white/90" : "text-ink-2"}`}>{sub}</span>
      </span>
      <span className={`mt-1 inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-base font-bold transition group-hover:gap-3 ${student ? "bg-white text-primary-deep" : "bg-primary text-white"}`}>
        {go} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export function Welcome({ text, home, words }: { text: Text; home: string | null; words: [string, string, string, string] }) {
  const [focus, setFocus] = useState<SceneFocus>("both");
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The two cards are the whole point of this screen: they are visible from the first frame and only slide in slightly.
        gsap.from(".door", { y: 24, duration: 0.7, ease: "power3.out", stagger: 0.1, clearProps: "transform" });
        gsap.from(".w-fade", { opacity: 0, y: 12, duration: 0.6, ease: "power3.out", stagger: 0.08 });
        const safety = window.setTimeout(() => gsap.set(".w-fade, .door", { clearProps: "all" }), 1500);
        return () => window.clearTimeout(safety);
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="relative min-h-dvh overflow-hidden bg-canvas text-ink">
      {/* Background scene, kept behind the choice */}
      <div className="absolute inset-0 opacity-60"><KadamScene focus={focus} /></div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-canvas/95 via-canvas/80 to-canvas/40" aria-hidden="true" />
      <HeroWords phrases={words} />
      <RoleTrail />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header data-trail-block="" className="mx-auto flex h-16 w-full max-w-5xl items-center gap-2 px-4">
          <Link href="/" aria-label="Kadam home"><LockUp tagline={text.tagline} /></Link>
          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle compact />
            <Link href={home ?? "/auth"} className="btn-secondary btn-sm whitespace-nowrap">{home ? <><span className="sm:hidden">{text.home}</span><span className="hidden sm:inline">{text.open}</span></> : text.login}</Link>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 pt-4 pb-10">
          <div className="text-center">
            
            <h1 data-trail-block="" className="w-fade mx-auto mt-3 w-fit text-[40px] leading-none font-extrabold tracking-tight sm:text-[64px]">{text.who}</h1>
            <p data-trail-block="" className="w-fade mx-auto mt-3 max-w-md text-lg text-ink-2">{text.whoSub}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6">
            <Door href="/start/student" tone="student" title={text.studentTitle} sub={text.studentSub} go={text.studentGo} icon={STUDENT_ICON} onFocus={(on) => setFocus(on ? "student" : "both")} />
            <Door href="/start/business" tone="business" title={text.businessTitle} sub={text.businessSub} go={text.businessGo} icon={BUSINESS_ICON} onFocus={(on) => setFocus(on ? "business" : "both")} />
          </div>

          <p data-trail-block="" className="w-fade mx-auto mt-8 w-fit text-center text-sm text-ink-3">{text.note}</p>
        </main>
      </div>
    </div>
  );
}

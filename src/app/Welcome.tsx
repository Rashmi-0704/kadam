"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { KadamScene, type SceneFocus } from "@/components/scene/KadamScene";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LogoMark } from "@/components/Logo";

type Text = Record<
  "tagline" | "who" | "whoSub" | "studentTitle" | "studentSub" | "studentGo" | "businessTitle" | "businessSub" | "businessGo" | "login" | "open" | "note",
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
      className={`door group relative flex flex-col items-center gap-4 overflow-hidden rounded-[28px] border-2 p-6 text-center transition duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 sm:min-h-[340px] sm:justify-center sm:gap-5 sm:p-8 ${
        student
          ? "border-saffron bg-saffron text-ink shadow-[0_24px_60px_-24px_rgba(224,122,16,0.8)] hover:bg-[#ec8a1f]"
          : "border-paper bg-paper text-ink shadow-[0_24px_60px_-24px_rgba(251,247,240,0.45)] hover:bg-white"
      }`}
    >
      <span className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl sm:h-24 sm:w-24 ${student ? "bg-ink text-saffron" : "bg-ink text-paper"}`}>
        <svg viewBox="0 0 24 24" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
      </span>
      <span>
        <span className="block font-display text-2xl leading-tight font-extrabold sm:text-3xl">{title}</span>
        <span className="mx-auto mt-2 block max-w-xs text-base text-ink/75">{sub}</span>
      </span>
      <span className="mt-1 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-base font-bold text-paper transition group-hover:gap-3">
        {go} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export function Welcome({ text, home }: { text: Text; home: string | null }) {
  const [focus, setFocus] = useState<SceneFocus>("both");
  // A sign-in link that lands on the homepage (Supabase's default address) is passed on to the sign-in handler.
  useEffect(() => {
    const h = window.location.hash;
    if (/access_token=|error_description=/.test(h)) window.location.replace(`/auth/callback${window.location.search}${h}`);
  }, []);
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
    <div ref={ref} className="relative min-h-dvh overflow-hidden bg-[#120f1d] text-paper">
      {/* Background scene, kept behind the choice */}
      <div className="absolute inset-0 opacity-50"><KadamScene focus={focus} /></div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#120f1d]/95 via-[#120f1d]/75 to-[#120f1d]/60" aria-hidden="true" />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="mx-auto flex h-16 w-full max-w-5xl items-center gap-2 px-4">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Kadam">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-xl font-bold">Kadam</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle compact />
            <Link href={home ?? "/auth"} className="btn btn-sm whitespace-nowrap border border-white/30 text-paper hover:bg-white/10">{home ? text.open : text.login}</Link>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 pt-4 pb-10">
          <div className="text-center">
            <p className="w-fade eyebrow text-saffron">{text.tagline}</p>
            <h1 className="w-fade mt-3 text-[40px] leading-none font-extrabold tracking-tight sm:text-[64px]">{text.who}</h1>
            <p className="w-fade mx-auto mt-3 max-w-md text-lg text-paper/75">{text.whoSub}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6">
            <Door href="/start/student" tone="student" title={text.studentTitle} sub={text.studentSub} go={text.studentGo} icon={STUDENT_ICON} onFocus={(on) => setFocus(on ? "student" : "both")} />
            <Door href="/start/business" tone="business" title={text.businessTitle} sub={text.businessSub} go={text.businessGo} icon={BUSINESS_ICON} onFocus={(on) => setFocus(on ? "business" : "both")} />
          </div>

          <p className="w-fade mt-8 text-center text-sm text-paper/55">{text.note}</p>
        </main>
      </div>
    </div>
  );
}

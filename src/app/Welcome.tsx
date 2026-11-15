"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { KadamScene, type SceneFocus } from "@/components/scene/KadamScene";
import { SplitHeading } from "@/components/scene/Motion";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LogoMark } from "@/components/Logo";

type Text = Record<"tagline" | "h1" | "h1accent" | "sub" | "ask" | "studentTitle" | "studentSub" | "businessTitle" | "businessSub" | "login" | "open" | "note", string>;

function Door({ href, title, sub, icon, onFocus, tone }: { href: string; title: string; sub: string; icon: React.ReactNode; onFocus: (on: boolean) => void; tone: "student" | "business" }) {
  return (
    <Link
      href={href}
      onPointerEnter={() => onFocus(true)}
      onPointerLeave={() => onFocus(false)}
      onFocus={() => onFocus(true)}
      onBlur={() => onFocus(false)}
      className="door group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-5 text-left text-paper backdrop-blur-md transition hover:border-saffron/70 hover:bg-white/[0.12] focus-visible:border-saffron sm:flex-col sm:items-start sm:gap-6 sm:p-7"
    >
      <span className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-saffron/0 blur-2xl transition duration-500 group-hover:bg-saffron/30" aria-hidden="true" />
      <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16 ${tone === "student" ? "bg-saffron text-ink" : "bg-paper text-ink"}`}>{icon}</span>
      <span className="min-w-0 flex-1 sm:pr-14">
        <span className="block font-display text-xl font-bold sm:text-2xl">{title}</span>
        <span className="mt-1 block text-sm text-paper/70 sm:text-base">{sub}</span>
      </span>
      <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-ink transition group-hover:translate-x-1 group-hover:bg-saffron sm:absolute sm:right-6 sm:bottom-6">→</span>
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
        gsap.from(".w-fade", { opacity: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.12, delay: 0.7 });
        gsap.from(".door", { opacity: 0, y: 40, scale: 0.96, duration: 0.9, ease: "back.out(1.4)", stagger: 0.15, delay: 1.1 });
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="relative min-h-dvh overflow-hidden bg-[#120f1d] text-paper">
      <div className="absolute inset-x-0 bottom-0 h-[58%] md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[64%]">
        <KadamScene focus={focus} />
      </div>
      {/* Legibility veil */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#120f1d] via-[#120f1d]/70 to-[#120f1d]/0 md:bg-gradient-to-r md:from-[#120f1d] md:via-[#120f1d]/80 md:to-[#120f1d]/0" aria-hidden="true" />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Kadam">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-xl font-bold">Kadam</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle compact />
            <Link href={home ?? "/auth"} className="btn btn-sm whitespace-nowrap bg-paper text-ink hover:bg-saffron">{home ? text.open : text.login}</Link>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-6 pb-10 sm:pt-12">
          <p className="w-fade eyebrow text-saffron">{text.tagline}</p>
          <SplitHeading text={text.h1} accent={text.h1accent} className="mt-3 max-w-3xl text-[38px] leading-[1.02] font-extrabold tracking-tight sm:text-[64px]" />
          <p className="w-fade mt-4 max-w-xl text-lg text-paper/75">{text.sub}</p>

          <p className="w-fade mt-8 text-sm font-semibold tracking-wide text-paper/60 uppercase sm:mt-10">{text.ask}</p>
          <div className="mt-3 grid gap-3 sm:max-w-3xl sm:grid-cols-2 sm:gap-4">
            <Door
              href="/start/student"
              tone="student"
              title={text.studentTitle}
              sub={text.studentSub}
              onFocus={(on) => setFocus(on ? "student" : "both")}
              icon={<svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></svg>}
            />
            <Door
              href="/start/business"
              tone="business"
              title={text.businessTitle}
              sub={text.businessSub}
              onFocus={(on) => setFocus(on ? "business" : "both")}
              icon={<svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18l-1.5-5h-15L3 9Z" /><path d="M4 9v11h16V9" /><path d="M10 20v-6h4v6" /></svg>}
            />
          </div>
          <p className="w-fade mt-auto pt-10 text-sm text-paper/55">{text.note}</p>
        </main>
      </div>
    </div>
  );
}

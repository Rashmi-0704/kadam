"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { KadamScene, type SceneFocus } from "./KadamScene";
import { SplitHeading } from "./Motion";
import { LogoMark } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";

export function LandingHero({
  focus,
  eyebrow,
  h1,
  accent,
  sub,
  cta,
  ctaHref,
  secondary,
  secondaryHref,
  login,
  loginHref,
  switchLabel,
  switchHref,
  showLanguage,
  children,
}: {
  focus: SceneFocus;
  eyebrow: string;
  h1: string;
  accent: string;
  sub: string;
  cta: string;
  ctaHref: string;
  secondary: string;
  secondaryHref: string;
  login: string;
  loginHref: string;
  switchLabel: string;
  switchHref: string;
  showLanguage: boolean;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".h-fade", { opacity: 0, y: 24, duration: 0.8, ease: "power3.out", stagger: 0.12, delay: 0.6 });
        gsap.from(".h-card", { opacity: 0, y: 60, rotate: 4, duration: 1.1, ease: "power4.out", delay: 1 });
        // Never leave hero text hidden if animations can't run.
        const safety = window.setTimeout(() => gsap.set(".h-fade, .h-card, .sw", { clearProps: "all" }), 2500);
        return () => window.clearTimeout(safety);
      });
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="relative overflow-hidden bg-[#120f1d] text-paper">
      <div className="absolute inset-x-0 bottom-0 h-[58%] md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[64%]"><KadamScene focus={focus} /></div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#120f1d] via-[#120f1d]/70 to-[#120f1d]/0 md:bg-gradient-to-r md:from-[#120f1d] md:via-[#120f1d]/80 md:to-[#120f1d]/0" aria-hidden="true" />
      <div className="relative z-10">
        <header className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Kadam">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-xl font-bold">Kadam</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {showLanguage && <LanguageToggle compact />}
            <Link href={loginHref} className="btn btn-sm whitespace-nowrap bg-paper text-ink hover:bg-saffron">{login}</Link>
          </div>
        </header>
        <div className="mx-auto grid min-h-[calc(92dvh-4rem)] max-w-6xl grid-cols-1 items-start gap-10 px-4 pt-6 pb-[52vh] md:items-center md:pb-16 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="h-fade eyebrow text-saffron">{eyebrow}</p>
            <SplitHeading text={h1} accent={accent} className="mt-3 text-[38px] leading-[1.03] font-extrabold tracking-tight sm:text-[58px]" />
            <p className="h-fade mt-5 max-w-xl text-lg text-paper/75">{sub}</p>
            <div className="h-fade mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={ctaHref} className="btn-accent px-8 text-base">{cta} <span aria-hidden="true">→</span></Link>
              <a href={secondaryHref} className="btn border border-white/25 px-7 text-paper hover:bg-white/10">{secondary}</a>
            </div>
            <Link href={switchHref} className="h-fade mt-6 inline-block text-sm text-paper/60 underline decoration-white/30 underline-offset-4 hover:text-paper">{switchLabel}</Link>
          </div>
          {children && <div className="h-card hidden md:block">{children}</div>}
        </div>
      </div>
    </section>
  );
}

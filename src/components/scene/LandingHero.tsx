"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { KadamScene, type SceneFocus } from "./KadamScene";
import { SplitHeading } from "./Motion";
import { LockUp } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { RoleTrail } from "@/components/motion/RoleTrail";
import { HeroWords } from "@/components/motion/HeroWords";

export function LandingHero({
  focus,
  tagline,
  strip,
  eyebrow,
  h1,
  accent,
  sub,
  h1Class,
  breakAccent = false,
  cta,
  ctaHref,
  secondary,
  secondaryHref,
  login,
  loginHref,
  switchLabel,
  switchHref,
  showLanguage,
  words,
  children,
}: {
  focus: SceneFocus;
  tagline: string;
  strip?: { text: string; href: string };
  eyebrow: string;
  h1: string;
  accent: string;
  /** Optional paragraph under the headline; without it the hero closes up with no gap. */
  sub?: string;
  /** Size classes for a long headline (defaults to the big two-word style). */
  h1Class?: string;
  /** Put the indigo accent on its own line. */
  breakAccent?: boolean;
  cta: string;
  ctaHref: string;
  secondary: string;
  secondaryHref: string;
  login: string;
  loginHref: string;
  switchLabel: string;
  switchHref: string;
  showLanguage: boolean;
  /** Real problems, Real solutions, Real impact, Take your first step (already translated). */
  words: [string, string, string, string];
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".h-fade", { opacity: 0, y: 20, duration: 0.7, ease: "power3.out", stagger: 0.1, delay: 0.4 });
        gsap.from(".h-card", { opacity: 0, y: 40, rotate: 3, duration: 0.9, ease: "power4.out", delay: 0.7 });
        // Never leave hero text hidden if animations can't run.
        const safety = window.setTimeout(() => gsap.set(".h-fade, .h-card, .sw", { clearProps: "all" }), 2000);
        return () => window.clearTimeout(safety);
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref}>
      {strip && (
        <Link href={strip.href} className="block bg-primary-soft px-4 py-2 text-center text-sm font-bold text-primary-deep hover:bg-info-soft">
          {strip.text}
        </Link>
      )}
      <section className="relative overflow-hidden bg-canvas text-ink">
        <div className="absolute inset-x-0 bottom-0 h-[52%] md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[62%]"><KadamScene focus={focus} /></div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-canvas via-canvas/85 to-canvas/0 md:bg-gradient-to-r md:from-canvas md:from-35% md:via-canvas/40 md:via-55% md:to-canvas/0 md:to-80%" aria-hidden="true" />
        <HeroWords phrases={words} />
        <RoleTrail />
        <div className="relative z-10">
          <header data-trail-block="" className="mx-auto flex min-h-16 max-w-6xl items-center gap-2 px-4 py-2">
            <Link href="/" aria-label="Kadam home"><LockUp tagline={tagline} /></Link>
            <div className="ml-auto flex items-center gap-2">
              {showLanguage && <LanguageToggle compact />}
              <Link href={loginHref} className="btn-secondary btn-sm whitespace-nowrap">{login}</Link>
            </div>
          </header>
          <div className="mx-auto grid min-h-[calc(88dvh-4rem)] max-w-6xl grid-cols-1 items-start gap-10 px-4 pt-6 pb-[48vh] md:grid-cols-[1.1fr_1fr] md:items-center md:pb-16">
            <div>
              <p data-trail-block="" className="h-fade eyebrow w-fit">{eyebrow}</p>
              <div data-trail-block=""><SplitHeading text={h1} accent={accent} breakAccent={breakAccent} className={`mt-3 ${h1Class ?? "text-[38px] leading-[1.03] font-extrabold tracking-tight sm:text-[58px]"}`} /></div>
              {sub && <p data-trail-block="" className="h-fade mt-5 max-w-xl text-lg text-ink-2">{sub}</p>}
              <div className="h-fade mt-8 flex flex-col gap-3 sm:flex-row">
                <Link data-trail-block="" href={ctaHref} className="btn-primary px-8 text-base">{cta} <span aria-hidden="true">→</span></Link>
                <a data-trail-block="" href={secondaryHref} className="btn-secondary px-7">{secondary}</a>
              </div>
              <Link data-trail-block="" href={switchHref} className="h-fade mt-6 inline-block text-sm font-semibold text-ink-2 underline decoration-line-deep underline-offset-4 hover:text-primary-deep">{switchLabel}</Link>
            </div>
            {children && <div data-trail-block="" className="h-card hidden md:block">{children}</div>}
          </div>
        </div>
      </section>
    </div>
  );
}

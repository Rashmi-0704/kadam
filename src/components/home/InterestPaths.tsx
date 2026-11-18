"use client";
import { Reveal } from "@/components/motion/Reveal";
import { useState } from "react";
import Link from "next/link";
import { HighlightPill } from "@/components/motion/Highlight";

/*
 * "Pick what you enjoy → see your paths". A fixed local mapping, no AI call.
 * Each interest votes for roles in three tiers; the top roles per tier are shown.
 */

type Tier = "now" | "pivot" | "stretch";
const INTERESTS: { id: string; label: string; emoji: string; roles: Record<Tier, string[]> }[] = [
  { id: "numbers", label: "Numbers & patterns", emoji: "📊", roles: { now: ["Data Analyst"], pivot: ["Financial Analyst", "Business Analyst"], stretch: ["Data Scientist"] } },
  { id: "writing", label: "Writing & stories", emoji: "✍️", roles: { now: ["Content Writer"], pivot: ["Journalist", "Social Media Manager"], stretch: ["Product Manager"] } },
  { id: "design", label: "Drawing & design", emoji: "🎨", roles: { now: ["Graphic Designer"], pivot: ["UX Designer"], stretch: ["Product Manager"] } },
  { id: "building", label: "Building apps", emoji: "💻", roles: { now: ["Frontend Developer"], pivot: ["Backend Developer", "Full-Stack Developer"], stretch: ["AI Engineer"] } },
  { id: "people", label: "Talking to people", emoji: "🗣️", roles: { now: ["Sales & Business Development"], pivot: ["HR / People Operations", "Digital Marketer"], stretch: ["Product Manager"] } },
  { id: "organising", label: "Organising things", emoji: "🗂️", roles: { now: ["Operations Associate"], pivot: ["Business Analyst"], stretch: ["Product Manager"] } },
  { id: "social", label: "Social media", emoji: "📱", roles: { now: ["Social Media Manager"], pivot: ["Digital Marketer", "Content Writer"], stretch: ["Product Manager"] } },
  { id: "impact", label: "Helping my community", emoji: "🤝", roles: { now: ["NGO Programme Coordinator"], pivot: ["Research Analyst", "Operations Associate"], stretch: ["Product Manager"] } },
];

const TIERS: { id: Tier; label: string; chip: string }[] = [
  { id: "now", label: "Now", chip: "bg-success-soft text-success-ink" },
  { id: "pivot", label: "Pivot", chip: "bg-info-soft text-info" },
  { id: "stretch", label: "Stretch", chip: "bg-highlight-soft text-highlight-deep" },
];

function rank(picked: string[], tier: Tier, exclude: Set<string>): string[] {
  const score = new Map<string, number>();
  // The latest pick weighs a little more, so every tap visibly changes the result.
  picked.forEach((id, order) => {
    const it = INTERESTS.find((x) => x.id === id);
    it?.roles[tier].forEach((r, i) => score.set(r, (score.get(r) ?? 0) + 2 - i * 0.5 + order * 0.3));
  });
  return [...score.entries()].filter(([r]) => !exclude.has(r)).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([r]) => r);
}

export function InterestPaths() {
  const [picked, setPicked] = useState<string[]>(["numbers", "writing"]);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const used = new Set<string>();
  const result = TIERS.map((t) => {
    const roles = rank(picked, t.id, used);
    roles.forEach((r) => used.add(r));
    return { ...t, roles };
  });
  return (
    <Reveal as="section" className="mx-auto max-w-6xl px-4 py-20" aria-labelledby="ip-title">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <p className="eyebrow">Try it</p>
          <h2 id="ip-title" className="mt-2 text-[32px] leading-tight font-bold sm:text-[40px]">What do you enjoy?</h2>
          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Things you enjoy">
            {INTERESTS.map((it) => {
              const on = picked.includes(it.id);
              return (
                <button key={it.id} type="button" aria-pressed={on} onClick={() => toggle(it.id)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-sm font-bold transition active:scale-95 ${on ? "border-primary bg-primary text-white shadow-[0_3px_0_var(--color-primary-edge)]" : "border-line bg-card text-ink-2 hover:border-line-deep"}`}>
                  <span aria-hidden="true">{it.emoji}</span>{it.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-3" aria-live="polite">
          {result.map((t, i) => (
            <div key={t.id} className="glow-card card flex min-h-[4.5rem] flex-wrap items-center gap-2 p-4" style={{ "--glow-delay": `${-i * 4}s` } as React.CSSProperties}>
              <span className={`mr-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${t.chip}`}>{t.label}</span>
              {t.roles.map((r, j) => (
                <span key={`${r}-${picked.join()}`} className="ip-in" style={{ animationDelay: `${(i * 2 + j) * 70}ms` }}>
                  {j === 0 && i === 0 ? <HighlightPill>{r}</HighlightPill> : <span className="chip px-3 py-1 text-sm font-bold text-ink">{r}</span>}
                </span>
              ))}
              {!t.roles.length && <span className="text-sm text-ink-3" aria-hidden="true">—</span>}
            </div>
          ))}
          <Link href="/auth?as=student" className="btn-primary w-full sm:w-auto">Find my real paths →</Link>
        </div>
      </div>
    </Reveal>
  );
}

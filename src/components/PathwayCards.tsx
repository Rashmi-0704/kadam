"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { approvePathways, type FormState } from "@/app/actions/student";
import { SubmitButton } from "./SubmitButton";
import { useT } from "@/lib/i18n/client";
import { ROLES } from "@/db/taxonomy";

type Item = { role: string; slug: string; rationale: string };
export type Paths = { now: Item[]; pivot: Item[]; stretch: Item[] };
const TIERS = ["now", "pivot", "stretch"] as const;
const TIER_STYLE: Record<(typeof TIERS)[number], { bar: string; dot: string; h: number }> = {
  now: { bar: "bg-leaf", dot: "bg-leaf-soft text-leaf", h: 1 },
  pivot: { bar: "bg-indigo", dot: "bg-indigo-soft text-indigo", h: 2 },
  stretch: { bar: "bg-saffron", dot: "bg-saffron-soft text-saffron-deep", h: 3 },
};

function TierHead({ tier, t }: { tier: (typeof TIERS)[number]; t: (k: string) => string }) {
  const s = TIER_STYLE[tier];
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((n) => <span key={n} className={`w-2 rounded-sm ${n <= s.h ? s.bar : "bg-sand"}`} style={{ height: 6 + n * 5 }} />)}
      </span>
      <div>
        <h3 className="text-lg font-bold">{t(`path.${tier}`)}</h3>
        <p className="text-sm text-ink-2">{t(`path.${tier}_sub`)}</p>
      </div>
    </div>
  );
}

export function PathwayView({ paths }: { paths: Paths }) {
  const t = useT();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TIERS.map((tier) => (
        <div key={tier} className="card space-y-4 p-5">
          <TierHead tier={tier} t={t} />
          <ul className="space-y-3">
            {paths[tier].map((p) => (
              <li key={p.role} className="rounded-xl bg-paper p-3">
                <Link href={`/student/roadmaps/${p.slug}`} className="font-bold underline decoration-line decoration-2 underline-offset-4 hover:decoration-saffron">{p.role}</Link>
                <p className="mt-1 text-sm text-ink-2">{p.rationale}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function PathwayEditor({ initial }: { initial: Paths }) {
  const t = useT();
  const [paths, setPaths] = useState<Paths>(initial);
  const [state, action] = useActionState<FormState, FormData>(approvePathways, {});
  const update = (tier: keyof Paths, i: number, patch: Partial<Item>) =>
    setPaths((p) => ({ ...p, [tier]: p[tier].map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
  const remove = (tier: keyof Paths, i: number) => setPaths((p) => ({ ...p, [tier]: p[tier].filter((_, j) => j !== i) }));
  const add = (tier: keyof Paths, slug: string) => {
    const r = ROLES.find((x) => x.slug === slug);
    if (!r) return;
    setPaths((p) => ({ ...p, [tier]: [...p[tier], { role: r.title, slug: r.slug, rationale: "" }] }));
  };
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="pathways" value={JSON.stringify(paths)} />
      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((tier) => (
          <div key={tier} className="card space-y-4 p-5">
            <TierHead tier={tier} t={t} />
            {paths[tier].map((p, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-line bg-paper p-3">
                <div className="flex items-center gap-2">
                  <input aria-label={t("path.role")} className="input min-h-10 py-2 font-bold" value={p.role} onChange={(e) => update(tier, i, { role: e.target.value, slug: "" })} />
                  <button type="button" onClick={() => remove(tier, i)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-clay-soft hover:text-clay" aria-label={t("path.remove", { role: p.role })}>✕</button>
                </div>
                <textarea aria-label={t("path.why")} rows={2} className="input min-h-0 py-2 text-sm" value={p.rationale} onChange={(e) => update(tier, i, { rationale: e.target.value })} placeholder={t("path.why_ph")} />
              </div>
            ))}
            <select className="input min-h-10 py-2 text-sm text-ink-2" value="" onChange={(e) => add(tier, e.target.value)} aria-label={t("path.add")}>
              <option value="">+ {t("path.add")}</option>
              {ROLES.filter((r) => !paths[tier].some((x) => x.slug === r.slug)).map((r) => <option key={r.slug} value={r.slug}>{r.title}</option>)}
            </select>
          </div>
        ))}
      </div>
      {state.error && <p className="text-sm font-semibold text-clay" role="alert">{t(state.error)}</p>}
      <div className="flex flex-col items-center gap-2">
        <SubmitButton className="btn-accent w-full sm:w-auto sm:px-10" pendingLabel={t("common.saving")}>{t("path.approve")}</SubmitButton>
        <p className="text-sm text-ink-3">{t("path.approve_help")}</p>
      </div>
    </form>
  );
}

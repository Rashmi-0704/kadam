"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";
import { addTargetRole } from "@/app/actions/student";
import { SubmitButton } from "./SubmitButton";

export type BrowserItem = { slug: string; title: string; kind: "role" | "skill"; group: string; blurb: string; pct: number | null; tier?: string };

function Tile({ it }: { it: BrowserItem }) {
  const t = useT();
  return (
    <Link href={`/student/roadmaps/${it.slug}`} className="glow-card group relative flex min-h-[3.25rem] items-center justify-between gap-2 rounded-xl border-2 border-line-deep bg-card px-4 py-3 font-semibold transition hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_5px_0_-1px_var(--color-primary-edge)]">
      {it.pct !== null && it.pct > 0 && <span className="absolute inset-y-0 left-0 -z-[1] bg-primary-soft transition-all" style={{ width: `${it.pct}%` }} aria-hidden="true" />}
      <span className="relative min-w-0">
        <span className="block truncate">{it.title}</span>
        {it.tier && <span className="block text-[11px] font-bold tracking-wide text-primary-deep uppercase">{t(`path.${it.tier}`)}</span>}
      </span>
      <span className="relative shrink-0 text-xs font-bold text-ink-3 group-hover:text-ink">{it.pct ? `${it.pct}%` : "→"}</span>
    </Link>
  );
}

export function RoadmapBrowser({ items, mine, roleGroups, skillGroups }: { items: BrowserItem[]; mine: BrowserItem[]; roleGroups: readonly string[]; skillGroups: readonly string[] }) {
  const t = useT();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const match = useMemo(() => (it: BrowserItem) => !query || `${it.title} ${it.blurb} ${it.group}`.toLowerCase().includes(query), [query]);
  const roles = items.filter((i) => i.kind === "role" && match(i));
  const skills = items.filter((i) => i.kind === "skill" && match(i));
  const exact = items.some((i) => i.title.toLowerCase() === query);

  const grid = (list: BrowserItem[]) => <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{list.map((it) => <li key={it.slug}><Tile it={it} /></li>)}</ul>;

  return (
    <div>
      <div className="relative mb-8">
        <label htmlFor="rm-search" className="sr-only">{t("rm.search")}</label>
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-ink-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input id="rm-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("rm.search_ph")} className="input min-h-14 rounded-2xl border-2 border-ink pl-13 text-lg" />
      </div>

      {!query && mine.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold">{t("rm.for_you")}</h2>
          {grid(mine)}
        </section>
      )}

      {roles.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-1 font-display text-2xl font-bold">{t("rm.role_based")}</h2>
          <p className="mb-4 text-ink-2">{t("rm.role_based_sub")}</p>
          {roleGroups.map((g) => {
            const list = roles.filter((r) => r.group === g);
            return list.length ? (
              <div key={g} className="mb-6">
                <h3 className="mb-2 text-sm font-bold tracking-wide text-ink-3 uppercase">{g}</h3>
                {grid(list)}
              </div>
            ) : null;
          })}
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-1 font-display text-2xl font-bold">{t("rm.skill_based")}</h2>
          <p className="mb-4 text-ink-2">{t("rm.skill_based_sub")}</p>
          {skillGroups.map((g) => {
            const list = skills.filter((r) => r.group === g);
            return list.length ? (
              <div key={g} className="mb-6">
                <h3 className="mb-2 text-sm font-bold tracking-wide text-ink-3 uppercase">{g}</h3>
                {grid(list)}
              </div>
            ) : null;
          })}
        </section>
      )}

      {query && !exact && (
        <form action={addTargetRole} className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <input type="hidden" name="role" value={q.trim()} />
          <p className="text-ink-2">{roles.length + skills.length === 0 ? t("rm.no_match", { q: q.trim() }) : t("rm.make_own", { q: q.trim() })}</p>
          <SubmitButton className="btn-primary shrink-0" pendingLabel={t("rm.creating")}>{t("rm.create_for", { q: q.trim() })}</SubmitButton>
        </form>
      )}
    </div>
  );
}

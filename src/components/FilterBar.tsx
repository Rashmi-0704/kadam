"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { useT } from "@/lib/i18n/client";
import { SECTORS, PROBLEM_TYPES, DIFFICULTIES, TIME_NEEDED, WORK_MODES } from "@/db/taxonomy";

const FILTERS = [
  { key: "type", values: PROBLEM_TYPES, prefix: "ptype", label: "cat.problem_type" },
  { key: "sector", values: SECTORS, prefix: "sector", label: "cat.sector" },
  { key: "difficulty", values: DIFFICULTIES, prefix: "diff", label: "cat.difficulty" },
  { key: "time", values: TIME_NEEDED, prefix: "time", label: "cat.time_needed" },
  { key: "mode", values: WORK_MODES, prefix: "mode", label: "cat.work_mode" },
] as const;

export function FilterBar() {
  const t = useT();
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const active = FILTERS.filter((f) => sp.get(f.key)).length;
  const set = (key: string, value: string) => {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    p.delete("approved");
    start(() => router.replace(`${path}?${p}`, { scroll: false }));
  };
  return (
    <div className={`mb-5 ${pending ? "opacity-70" : ""}`}>
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">{t("filter.search")}</span>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input defaultValue={sp.get("q") ?? ""} onKeyDown={(e) => e.key === "Enter" && set("q", e.currentTarget.value.trim())} onBlur={(e) => e.currentTarget.value.trim() !== (sp.get("q") ?? "") && set("q", e.currentTarget.value.trim())} placeholder={t("filter.search_ph")} className="input pl-10" type="search" />
        </label>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`btn-secondary shrink-0 ${active ? "border-ink" : ""}`}>
          {t("filter.filters")}{active > 0 && <span className="rounded-full bg-saffron px-1.5 text-xs font-bold">{active}</span>}
        </button>
      </div>
      {open && (
        <div className="card mt-2 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          {FILTERS.map((f) => (
            <div key={f.key}>
              <label className="label" htmlFor={`f-${f.key}`}>{t(f.label)}</label>
              <select id={`f-${f.key}`} className="input min-h-11 py-2" value={sp.get(f.key) ?? ""} onChange={(e) => set(f.key, e.target.value)}>
                <option value="">{t("filter.any")}</option>
                {f.values.map((v) => <option key={v} value={v}>{t(`${f.prefix}.${v}`)}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
      {active > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FILTERS.filter((f) => sp.get(f.key)).map((f) => (
            <button key={f.key} type="button" onClick={() => set(f.key, "")} className="chip min-h-8 border-ink bg-ink text-paper">
              {t(`${f.prefix}.${sp.get(f.key)}`)} <span aria-hidden="true">✕</span><span className="sr-only">{t("filter.remove")}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

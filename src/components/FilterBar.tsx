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

/**
 * Round 4: the five filters are always visible as thin dropdowns (their first option is the label), with a short search box
 * on the right that widens on focus (laptop/tablet). Phones: search on top, filters in a two-column grid below.
 * Filters write to the URL; search commits on Enter or blur.
 */
export function FilterBar() {
  const t = useT();
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [query, setQuery] = useState(sp.get("q") ?? "");
  const active = FILTERS.filter((f) => sp.get(f.key)).length;
  const push = (p: URLSearchParams) => {
    p.delete("approved");
    start(() => router.replace(`${path}?${p}`, { scroll: false }));
  };
  const set = (key: string, value: string) => {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    push(p);
  };
  const clear = () => {
    const p = new URLSearchParams(sp.toString());
    FILTERS.forEach((f) => p.delete(f.key));
    push(p);
  };
  const commit = (v: string) => v.trim() !== (sp.get("q") ?? "") && set("q", v.trim());
  return (
    <div className={`fb-row mb-5 flex flex-col gap-2 transition-opacity md:flex-row-reverse md:items-center ${pending ? "opacity-60" : ""}`}>
      <label className="fb-search relative block min-w-0 max-md:!basis-auto" data-filled={query ? "1" : "0"}>
        <span className="sr-only">{t("filter.search")}</span>
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit(e.currentTarget.value)}
          onBlur={(e) => commit(e.currentTarget.value)}
          placeholder={t("filter.search_ph")}
          className="input min-h-11 w-full py-2 pl-10 text-sm md:min-h-10"
          type="search"
        />
      </label>
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 md:flex md:items-center">
        {FILTERS.map((f) => {
          const v = sp.get(f.key) ?? "";
          return (
            <select
              key={f.key}
              aria-label={t(f.label)}
              value={v}
              onChange={(e) => set(f.key, e.target.value)}
              className={`input min-h-11 min-w-0 truncate py-1.5 pr-7 pl-2.5 text-sm md:min-h-10 md:flex-1 ${v ? "border-primary bg-primary-soft font-semibold text-primary-deep" : "text-ink-2"}`}
            >
              <option value="">{t(f.label)}</option>
              {f.values.map((x) => <option key={x} value={x}>{t(`${f.prefix}.${x}`)}</option>)}
            </select>
          );
        })}
        {active > 0 && (
          <button type="button" onClick={clear} className="min-h-11 shrink-0 px-2 text-sm font-semibold text-ink-2 underline underline-offset-4 hover:text-primary-deep md:min-h-10">
            {t("filter.clear")}
          </button>
        )}
      </div>
    </div>
  );
}

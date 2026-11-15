"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LANGS } from "@/lib/i18n/config";
import { useLang, useT } from "@/lib/i18n/client";
import { setLanguage } from "@/app/actions/common";

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const lang = useLang();
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t("common.language")}</span>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 h-4 w-4 text-ink-2" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
      </svg>
      <select
        value={lang}
        disabled={pending}
        onChange={(e) => start(async () => { await setLanguage(e.target.value); router.refresh(); })}
        className={`min-h-10 appearance-none rounded-full border border-line bg-card pl-9 text-sm font-semibold text-ink ${compact ? "pr-3 w-[7.5rem]" : "pr-8"}`}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </label>
  );
}

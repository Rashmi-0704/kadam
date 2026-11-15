"use client";
import { useState } from "react";
import { useT } from "@/lib/i18n/client";

export function ReportActions({ mode, bullets }: { mode: "page" | "bullets"; bullets?: string }) {
  const t = useT();
  const [copied, setCopied] = useState("");
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };
  if (mode === "bullets")
    return (
      <button type="button" className="btn-secondary btn-sm" onClick={() => copy(bullets ?? "", "bullets")}>
        {copied === "bullets" ? t("report.copied") : t("report.copy_bullets")}
      </button>
    );
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
      <button type="button" className="btn-primary" onClick={() => window.print()}>{t("report.pdf")}</button>
      <button type="button" className="btn-secondary" onClick={() => copy(window.location.href, "link")}>{copied === "link" ? t("report.copied") : t("report.copy_link")}</button>
    </div>
  );
}

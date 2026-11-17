"use client";
import { useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";

const MAX = 4 * 1024 * 1024;

export function FileUploader({ name, accept, label, multiple = false, compact = false, required = false }: { name: string; accept?: string; label: string; multiple?: boolean; compact?: boolean; required?: boolean }) {
  const t = useT();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const onChange = (list: FileList | null) => {
    const arr = Array.from(list ?? []);
    if (arr.some((f) => f.size > MAX)) {
      setError(t("err.file_too_large"));
      if (input.current) input.current.value = "";
      setFiles([]);
      return;
    }
    setError("");
    setFiles(arr);
  };
  return (
    <div>
      <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-canvas transition hover:border-ink-3 ${compact ? "min-h-12 px-3 py-2" : "min-h-24 px-4 py-4"}`}>
        <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-deep ${compact ? "h-8 w-8" : "h-11 w-11"}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{files.length ? files.map((f) => f.name).join(", ") : label}</span>
          {!compact && <span className="block text-xs text-ink-3">{files.length ? t("upload.change") : t("upload.hint")}</span>}
        </span>
        <input ref={input} type="file" name={name} accept={accept} multiple={multiple} required={required} className="sr-only" onChange={(e) => onChange(e.target.files)} />
      </label>
      {error && <p className="mt-2 text-sm font-semibold text-alert" role="alert">{error}</p>}
    </div>
  );
}

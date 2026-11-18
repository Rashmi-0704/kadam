"use client";
import { useEffect, useRef, useState } from "react";

const MAX = 4 * 1024 * 1024;

/**
 * Round 5 sign-up: the "Student ID" field. A plain field (never marked as required or anything else): tap to pick a photo
 * or PDF (phones offer the camera), or drop a file on a laptop. Shows the file's name, a small thumbnail and "Remove".
 * Student-only screen, so English only (decision 32).
 */
export function StudentIdField() {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; url: string | null } | null>(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);

  const clear = () => {
    if (input.current) input.current.value = "";
    setFile((f) => { if (f?.url) URL.revokeObjectURL(f.url); return null; });
  };

  // React resets the form after a submit that comes back with an error; keep the preview in step with the empty input.
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const onReset = () => setFile((f) => { if (f?.url) URL.revokeObjectURL(f.url); return null; });
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  const pick = (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return clear();
    if (!/^(image\/|application\/pdf)/.test(f.type)) { clear(); return setError("Please choose a photo or a PDF."); }
    if (f.size > MAX) { clear(); return setError("That file is over 4 MB. Try a smaller photo."); }
    setError("");
    setFile((old) => { if (old?.url) URL.revokeObjectURL(old.url); return { name: f.name, url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null }; });
  };

  return (
    <div>
      <span className="label" id="student-id-label">Student ID</span>
      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (input.current && e.dataTransfer.files.length) { input.current.files = e.dataTransfer.files; pick(e.dataTransfer.files); }
        }}
        className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-[14px] border-2 border-dashed px-4 py-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 ${drag ? "border-primary bg-primary-soft" : "border-line bg-canvas hover:border-ink-3"} ${file ? "hidden" : ""}`}
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M14 10h4M14 13h3" /></svg>
        </span>
        <span className="text-sm text-ink-2">Tap to add a photo or PDF</span>
        <input ref={input} type="file" name="student_id" accept="image/*,application/pdf" aria-labelledby="student-id-label" className="sr-only" onChange={(e) => pick(e.target.files)} />
      </label>
      {file && (
        <div className="flex items-center gap-3 rounded-[14px] border-2 border-line bg-card px-3 py-2">
          {file.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.url} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="inline-flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-mist text-xs font-bold text-ink-2" aria-hidden="true">PDF</span>
          )}
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{file.name}</span>
          <button type="button" onClick={clear} className="min-h-11 shrink-0 px-2 text-sm font-semibold text-ink-2 underline underline-offset-2 hover:text-primary-deep">Remove</button>
        </div>
      )}
      {error && <p className="mt-2 text-sm font-semibold text-alert" role="alert">{error}</p>}
    </div>
  );
}

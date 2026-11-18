"use client";
import { useActionState, useRef, useState, useTransition } from "react";
import { uploadAndReadId, finishOnboarding, type FormState } from "@/app/actions/student";
import { SubmitButton } from "@/components/SubmitButton";

const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "5th year", "Postgraduate"];
const MAX = 4 * 1024 * 1024;
type Fields = { college: string; course: string; year: string };

/**
 * A: upload area (the only action) → B: "Reading your ID…" → C: three editable fields and one Continue button.
 * The upload starts as soon as a file is chosen or dropped. Student-only screen, so English only (decision 32).
 */
export function IdOnboarding({ next, intent, problemTitle, rejectedNote, initial }: { next: string; intent: string; problemTitle: string | null; rejectedNote: string | null; initial: Fields | null }) {
  const [step, setStep] = useState<"upload" | "reading" | "confirm">(initial ? "confirm" : "upload");
  const [fields, setFields] = useState<Fields>(initial ?? { college: "", course: "", year: "" });
  const [unread, setUnread] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const [state, action] = useActionState<FormState, FormData>(finishOnboarding, {});

  const send = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX) return setError("That file is over 4 MB. Try a smaller photo.");
    if (!/^(image\/|application\/pdf)/.test(file.type)) return setError("Please upload a photo or a PDF.");
    setError("");
    setStep("reading");
    const fd = new FormData();
    fd.set("id_file", file);
    start(async () => {
      const r = await uploadAndReadId(fd).catch(() => ({ error: "Something went wrong. Please try again." }) as { error: string; ok?: undefined });
      if (!r.ok) {
        setError(r.error ?? "Something went wrong. Please try again.");
        setStep("upload");
        return;
      }
      const got = r as Fields & { read?: boolean };
      setFields({ college: got.college ?? "", course: got.course ?? "", year: got.year ?? "" });
      setUnread(!got.read);
      setStep("confirm");
    });
  };

  const reset = () => {
    setStep("upload");
    setUnread(false);
    if (input.current) input.current.value = "";
  };

  const valid = fields.college.trim().length >= 3 && fields.course.trim().length >= 2 && YEARS.includes(fields.year);

  return (
    <section className="card p-6 sm:p-8" aria-live="polite">
      {problemTitle && <p className="mb-3 rounded-xl bg-primary-soft px-3 py-2 text-sm font-semibold text-primary-deep">One quick step before you take up <em className="not-italic underline decoration-primary/40 underline-offset-2">{problemTitle}</em>.</p>}
      <h1 className="text-[28px] leading-tight font-bold">{step === "confirm" ? "Check your details" : "Add your student ID"}</h1>
      <p className="mt-2 text-ink-2">{step === "confirm" ? "Fix anything we got wrong." : "We'll read your college and course from it."}</p>
      {rejectedNote && step === "upload" && <p className="mt-4 rounded-xl border border-alert/25 bg-alert-soft px-3 py-2 text-sm font-medium" role="alert">We couldn&apos;t accept your last ID. {rejectedNote}</p>}

      {step === "upload" && (
        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); send(e.dataTransfer.files?.[0]); }}
          className={`mt-6 flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-8 text-center transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 ${drag ? "border-primary bg-primary-soft" : "border-line-deep bg-canvas hover:border-primary"}`}
        >
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_4px_0_var(--color-primary-edge)]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M14 10h4M14 13h3M6.5 16c.6-1.2 1.5-1.8 2.5-1.8s1.9.6 2.5 1.8" /></svg>
          </span>
          <span className="text-lg font-bold">Upload your student ID</span>
          <span className="text-sm text-ink-3">Drop it here, or tap to take a photo or pick a file. Photo or PDF, up to 4 MB.</span>
          <input ref={input} type="file" name="id_file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => send(e.target.files?.[0])} />
        </label>
      )}
      {step === "upload" && error && <p className="mt-3 text-sm font-semibold text-alert" role="alert">{error}</p>}
      {step === "upload" && <p className="mt-4 text-xs text-ink-3">Only the Kadam team can see your ID. Businesses never do.</p>}

      {step === "reading" && (
        <div className="mt-6 space-y-4" role="status">
          <p className="font-semibold text-primary-deep">Reading your ID…</p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-line" />
              <div className="h-12 animate-pulse rounded-xl bg-mist" />
            </div>
          ))}
        </div>
      )}

      {step === "confirm" && (
        <form action={action} className="mt-6 space-y-4">
          {unread && <p className="rounded-xl bg-info-soft px-3 py-2 text-sm font-medium text-info" role="status">We couldn&apos;t read your ID automatically. Please fill these in.</p>}
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="intent" value={intent} />
          <div>
            <label className="label" htmlFor="college">College</label>
            <input id="college" name="college" className="input" required minLength={3} value={fields.college} onChange={(e) => setFields({ ...fields, college: e.target.value })} placeholder="e.g. Utkal University, Bhubaneswar" />
          </div>
          <div className="grid grid-cols-[1fr_9rem] gap-3">
            <div>
              <label className="label" htmlFor="course">Course</label>
              <input id="course" name="course" className="input" required minLength={2} value={fields.course} onChange={(e) => setFields({ ...fields, course: e.target.value })} placeholder="e.g. B.Com" />
            </div>
            <div>
              <label className="label" htmlFor="year">Year</label>
              <select id="year" name="year" className="input" required value={fields.year} onChange={(e) => setFields({ ...fields, year: e.target.value })}>
                <option value="" disabled>Choose</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          {state.error && <p className="text-sm font-semibold text-alert" role="alert">{state.error}</p>}
          <SubmitButton className="btn-primary w-full" disabled={!valid} pendingLabel="Saving…">Continue</SubmitButton>
          <p className="text-center">
            <a href="#" role="link" onClick={(e) => { e.preventDefault(); reset(); }} className="text-sm font-semibold text-ink-2 underline decoration-line-deep underline-offset-4 hover:text-primary-deep">Use a different photo</a>
          </p>
        </form>
      )}
    </section>
  );
}

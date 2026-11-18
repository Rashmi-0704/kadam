"use client";
import { useActionState, useRef } from "react";
import { uploadIdFromProfile, saveStudentDetails, type FormState } from "@/app/actions/student";
import { SubmitButton, Spinner } from "@/components/SubmitButton";

const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "5th year", "Postgraduate"];

/**
 * Round 5: the profile's "Student ID" card. The upload area (no ID yet, or the last one was rejected) or "ID added ✓",
 * plus College, Course and Year with Save. Choosing a file sends it straight away. English only (student screen).
 */
export function StudentIdCard({ hasId, rejectedNote, details }: { hasId: boolean; rejectedNote: string | null; details: { college: string; course: string; year: string } }) {
  const [up, upload, uploading] = useActionState<FormState, FormData>(uploadIdFromProfile, {});
  const [saved, save] = useActionState<FormState, FormData>(saveStudentDetails, {});
  const form = useRef<HTMLFormElement>(null);
  return (
    <section className="card p-5" aria-labelledby="sid-title">
      <h2 id="sid-title" className="font-bold">Student ID</h2>
      {hasId ? (
        <p className="mt-2 text-sm font-semibold text-success-ink">ID added ✓</p>
      ) : (
        <form ref={form} action={upload} className="mt-3">
          {rejectedNote && <p className="mb-3 rounded-xl border border-alert/25 bg-alert-soft px-3 py-2 text-sm" role="status">We couldn&apos;t accept your last ID. {rejectedNote}</p>}
          <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-[14px] border-2 border-dashed border-line bg-canvas px-4 py-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 hover:border-ink-3">
            {uploading ? <Spinner className="h-5 w-5 text-primary" /> : (
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-primary-deep" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M14 10h4M14 13h3" /></svg>
            )}
            <span className="text-sm text-ink-2">{uploading ? "Adding your ID…" : "Tap to add a photo or PDF"}</span>
            <input type="file" name="student_id" accept="image/*,application/pdf" aria-label="Student ID" className="sr-only" disabled={uploading} onChange={(e) => e.target.files?.length && form.current?.requestSubmit()} />
          </label>
          {up.error && <p className="mt-2 text-sm font-semibold text-alert" role="alert">{up.error}</p>}
        </form>
      )}
      <form action={save} className="mt-4 space-y-3">
        <div>
          <label className="label" htmlFor="sid-college">College</label>
          <input id="sid-college" name="college" className="input" defaultValue={details.college} maxLength={160} />
        </div>
        <div className="grid grid-cols-[1fr_9rem] gap-3">
          <div>
            <label className="label" htmlFor="sid-course">Course</label>
            <input id="sid-course" name="course" className="input" defaultValue={details.course} maxLength={120} />
          </div>
          <div>
            <label className="label" htmlFor="sid-year">Year</label>
            <select id="sid-year" name="year" className="input" defaultValue={details.year}>
              <option value="">—</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {saved.error && <p className="text-sm font-semibold text-alert" role="alert">{saved.error}</p>}
        {saved.ok && <p className="text-sm font-semibold text-success-ink" role="status">Saved.</p>}
        <SubmitButton className="btn-secondary w-full" pendingLabel="Saving…">Save</SubmitButton>
      </form>
    </section>
  );
}

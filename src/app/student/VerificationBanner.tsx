"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** "Add your student ID to take up problems." Hidden on the onboarding screen itself, where the upload is the only action. */
export function VerificationBanner({ rejected }: { rejected: boolean }) {
  if (usePathname().startsWith("/student/onboarding")) return null;
  return (
    <div className={`no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${rejected ? "border-alert/25 bg-alert-soft" : "border-info/15 bg-info-soft"}`}>
      <p className="text-sm font-medium">
        {rejected && <strong className="font-bold">We couldn&apos;t accept your student ID. </strong>}
        Add your student ID to take up problems.
      </p>
      <Link href="/student/onboarding" className="btn-primary btn-sm">Add student ID</Link>
    </div>
  );
}

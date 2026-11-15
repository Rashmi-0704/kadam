"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { finishCollegeLink } from "@/app/actions/student";
import { Logo } from "@/components/Logo";
import { useT } from "@/lib/i18n/client";

// Opened from the college-email verification link. The student must be signed in on this same device.
export default function CollegeLinkPage() {
  const t = useT();
  const [state, setState] = useState<"working" | "done" | string>("working");
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("access_token");
    window.history.replaceState(null, "", window.location.pathname);
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("err.link");
      return;
    }
    finishCollegeLink(token)
      .then((r) => ("ok" in r ? (setState("done"), setTimeout(() => window.location.replace("/student/onboarding#verify"), 1200)) : setState(r.error)))
      .catch(() => setState("err.link"));
  }, []);
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      {state === "working" ? (
        <p className="flex items-center gap-3 text-lg font-semibold" role="status">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-saffron border-r-transparent" />
          {t("verify.checking")}
        </p>
      ) : state === "done" ? (
        <div className="card w-full p-6">
          <p className="text-4xl" aria-hidden="true">✅</p>
          <h1 className="mt-2 text-xl font-bold">{t("so.verified")}</h1>
        </div>
      ) : (
        <div className="card w-full p-6">
          <h1 className="text-xl font-bold">{t("auth.link_failed")}</h1>
          <p className="mt-2 text-ink-2">{t(state)}</p>
          <Link href="/student/onboarding#verify" className="btn-primary mt-5 w-full">{t("common.retry")}</Link>
        </div>
      )}
    </main>
  );
}

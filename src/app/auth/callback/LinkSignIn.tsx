"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { finishLinkSignIn } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";

/** Handles the sign-in link from the email: the token arrives in the URL fragment (never sent to servers by the browser). */
export function LinkSignIn() {
  const t = useT();
  const [error, setError] = useState("");
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    const token = hash.get("access_token");
    const failed = hash.get("error_description") || query.get("error_description");
    // Remove the token from the address bar straight away.
    window.history.replaceState(null, "", window.location.pathname);
    if (failed || !token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("err.link");
      return;
    }
    finishLinkSignIn(token, query.get("as") ?? "")
      .then((r) => ("next" in r ? window.location.replace(r.next) : setError(r.error)))
      .catch(() => setError("err.link"));
  }, []);
  if (error)
    return (
      <div className="card w-full p-6">
        <h1 className="text-xl font-bold">{t("auth.link_failed")}</h1>
        <p className="mt-2 text-ink-2">{t(error)}</p>
        <Link href="/auth" className="btn-primary mt-5 w-full">{t("auth.try_again")}</Link>
      </div>
    );
  return (
    <p className="flex items-center gap-3 text-lg font-semibold" role="status">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-saffron border-r-transparent" />
      {t("auth.signing_in")}
    </p>
  );
}

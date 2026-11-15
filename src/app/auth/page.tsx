import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, homeFor } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { AuthFlow } from "./AuthFlow";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Sign in" };

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ step?: string; as?: string }> }) {
  const sp = await searchParams;
  const u = await currentUser();
  if (u?.role) redirect(homeFor(u.role));
  const t = await getT();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/"><Logo /></Link>
        <LanguageToggle compact />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        <div className="card p-6 sm:p-8">
          <AuthFlow initialStep={u && !u.role ? "role" : "email"} defaultRole={sp.as === "business" ? "business" : sp.as === "student" ? "student" : undefined} />
        </div>
        <p className="mt-6 text-center text-sm text-ink-3">{t("auth.footer")}</p>
      </main>
    </div>
  );
}

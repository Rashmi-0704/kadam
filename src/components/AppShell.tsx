import Link from "next/link";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { NavLinks, type NavItem } from "./NavLinks";
import { getT } from "@/lib/i18n/server";
import { unreadCount } from "@/lib/notify";
import { homeFor, type User } from "@/lib/session";

export async function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const t = await getT();
  const unread = await unreadCount(user.id);
  const items: NavItem[] =
    user.role === "student"
      ? [
          { href: "/student/dashboard", label: t("nav.home"), icon: "home" },
          { href: "/student/problems", label: t("nav.problems"), icon: "search" },
          { href: "/student/roadmaps", label: t("nav.roadmaps"), icon: "map" },
          { href: "/student/profile", label: t("nav.profile"), icon: "user" },
        ]
      : user.role === "business"
        ? [
            { href: "/business/dashboard", label: t("nav.home"), icon: "home" },
            { href: "/business/problems/new", label: t("nav.new_problem"), icon: "plus" },
            { href: "/settings", label: t("nav.settings"), icon: "user" },
          ]
        : [{ href: "/admin/verifications", label: t("nav.verifications"), icon: "check" }];
  const initials = (user.name ?? user.email).split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="no-print sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
          <Link href={homeFor(user.role)} className="shrink-0" aria-label="Kadam">
            <Logo />
          </Link>
          <nav className="ml-6 hidden md:block" aria-label={t("nav.main")}>
            <NavLinks items={items} variant="top" />
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle compact />
            <Link href="/notifications" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card" aria-label={t("nav.notifications", { n: unread })}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
              {unread > 0 && <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-saffron px-1 text-center text-[11px] leading-5 font-bold text-ink">{unread > 9 ? "9+" : unread}</span>}
            </Link>
            <Link href="/settings" className="hidden h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper sm:inline-flex" aria-label={t("nav.settings")}>
              {initials}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 md:pb-12">{children}</main>
      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label={t("nav.main")}>
        <NavLinks items={items} variant="bottom" />
      </nav>
    </div>
  );
}

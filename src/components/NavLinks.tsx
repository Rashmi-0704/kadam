"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: "home" | "search" | "map" | "user" | "plus" | "check" };

const ICONS: Record<NavItem["icon"], React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  map: <><path d="M4 19V5M4 19h4M8 19v-5h4M12 14V9h4M16 9V5h4v14H4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  plus: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
};

export function NavLinks({ items, variant }: { items: NavItem[]; variant: "top" | "bottom" }) {
  const path = usePathname();
  const active = (href: string) => path === href || (href !== "/" && path.startsWith(href + "/") && !items.some((i) => i.href !== href && i.href.startsWith(href) && path.startsWith(i.href)));
  if (variant === "top")
    return (
      <ul className="flex items-center gap-1">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className={`rounded-full px-4 py-2 text-sm font-semibold ${active(i.href) ? "bg-ink text-paper" : "text-ink-2 hover:bg-sand"}`}>{i.label}</Link>
          </li>
        ))}
      </ul>
    );
  return (
    <ul className="mx-auto flex max-w-md">
      {items.map((i) => (
        <li key={i.href} className="flex-1">
          <Link href={i.href} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active(i.href) ? "text-ink" : "text-ink-3"}`}>
            <span className={`flex h-7 w-12 items-center justify-center rounded-full ${active(i.href) ? "bg-saffron-soft" : ""}`}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">{ICONS[i.icon]}</svg>
            </span>
            {i.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

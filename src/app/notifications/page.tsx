import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/session";
import { q } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { EmptyState, PageTitle, timeAgo } from "@/components/ui";
import { markAllRead } from "@/app/actions/common";
import { SubmitButton } from "@/components/SubmitButton";
import type { T } from "@/lib/i18n/config";

export const metadata = { title: "Notifications" };

function linkFor(role: string | null, type: string, p: Record<string, string>) {
  if (type === "verification_requested") return "/admin/verifications";
  if (type.startsWith("verification_")) return "/student/onboarding#verify";
  if (type === "report_regenerated" && role === "student" && p.engagementId) return `/student/engagements/${p.engagementId}`;
  if (p.engagementId) return role === "business" ? `/business/engagements/${p.engagementId}` : `/student/engagements/${p.engagementId}`;
  return "#";
}

function text(t: T, type: string, p: Record<string, string>) {
  const vars = { title: p.title ?? "", student: p.student ?? "", status: p.status ? t(`status.${p.status}`) : "" };
  return t(`notif.${type}`, vars);
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const t = await getT();
  const rows = await q(`select id, type, payload, read, created_at from notifications where user_id = $1 order by created_at desc limit 60`, [user.id]);
  const unread = rows.some((r) => !r.read);
  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-2xl">
        <PageTitle
          title={t("notif.title")}
          action={unread ? <form action={markAllRead}><SubmitButton className="btn-secondary btn-sm">{t("notif.mark_all")}</SubmitButton></form> : undefined}
        />
        {rows.length === 0 ? (
          <EmptyState title={t("notif.empty")} />
        ) : (
          <ul className="card divide-y divide-line overflow-hidden">
            {rows.map((n) => (
              <li key={n.id}>
                <Link href={linkFor(user.role, n.type, n.payload)} className={`flex gap-3 px-4 py-4 hover:bg-paper ${n.read ? "" : "bg-saffron-soft/30"}`}>
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-saffron"}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className={`block ${n.read ? "text-ink-2" : "font-semibold"}`}>{text(t, n.type, n.payload)}</span>
                    {n.payload?.preview && <span className="block truncate text-sm text-ink-3">“{n.payload.preview}”</span>}
                    <span className="block text-xs text-ink-3">{timeAgo(n.created_at, t)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/session";
import { q, type Row } from "@/lib/db";
import { getT, getLang } from "@/lib/i18n/server";
import { fileUrl, type StoredFile } from "@/lib/storage";
import { EmptyState, PageTitle, Section, StatusBadge, fmtDate, timeAgo } from "@/components/ui";
import { reviewVerification } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

export const metadata = { title: "ID checks" };

export default async function AdminVerifications() {
  const user = await requireUser("admin");
  const t = await getT();
  const lang = await getLang();
  const pending = await q(
    `select v.id, v.id_file, v.submitted_at, u.name, u.email, sp.college, sp.course, sp.year
       from verification_requests v join users u on u.id = v.student_id left join student_profiles sp on sp.user_id = v.student_id
      where v.status = 'pending' and v.method = 'id_upload' order by v.submitted_at asc`,
  );
  const withUrls = await Promise.all(pending.map(async (p): Promise<Row> => ({ ...p, url: p.id_file ? await fileUrl(p.id_file as StoredFile, "admin") : null })));
  const recent = await q(
    `select v.id, v.status, v.reviewed_at, u.name from verification_requests v join users u on u.id = v.student_id
      where v.method = 'id_upload' and v.status <> 'pending' order by v.reviewed_at desc nulls last limit 10`,
  );
  return (
    <AppShell user={user}>
      <PageTitle eyebrow={t("admin.eyebrow")} title={t("admin.title")} sub={t("admin.sub")} />
      <Section title={t("admin.waiting", { n: pending.length })}>
        {withUrls.length === 0 ? (
          <EmptyState title={t("admin.empty")} />
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {withUrls.map((p) => {
              const hoursLeft = Math.max(0, 72 - Math.floor((Date.now() - new Date(p.submitted_at).getTime()) / 36e5));
              return (
                <li key={p.id} className="card overflow-hidden">
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="block bg-sand">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {(p.id_file as StoredFile).type.startsWith("image/") ? <img src={p.url} alt={t("admin.id_alt", { name: p.name })} className="h-56 w-full object-contain" /> : <span className="flex h-24 items-center justify-center font-semibold">📄 {(p.id_file as StoredFile).name}</span>}
                    </a>
                  )}
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-lg font-bold">{p.name}</p>
                        <p className="text-sm text-ink-2">{[p.course, p.year, p.college].filter(Boolean).join(" · ")}</p>
                        <p className="text-xs text-ink-3">{p.email}</p>
                      </div>
                      <span className={`chip shrink-0 ${hoursLeft < 12 ? "border-clay/30 bg-clay-soft text-clay" : ""}`}>{t("admin.hours_left", { n: hoursLeft })}</span>
                    </div>
                    <p className="text-xs text-ink-3">{t("admin.submitted", { ago: timeAgo(p.submitted_at, t) })}</p>
                    <form action={reviewVerification} className="space-y-2">
                      <input type="hidden" name="id" value={p.id} />
                      <input name="note" className="input min-h-11 py-2 text-sm" placeholder={t("admin.note_ph")} aria-label={t("admin.note_ph")} />
                      <div className="flex gap-2">
                        <SubmitButton className="btn-primary flex-1" name="decision" value="verified">{t("admin.approve")}</SubmitButton>
                        <SubmitButton className="btn-danger flex-1" name="decision" value="rejected">{t("admin.reject")}</SubmitButton>
                      </div>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
      {recent.length > 0 && (
        <Section title={t("admin.recent")}>
          <ul className="card divide-y divide-line">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="font-semibold">{r.name}</span>
                <span className="flex items-center gap-2 text-sm text-ink-3">{r.reviewed_at && fmtDate(r.reviewed_at, lang)} <StatusBadge status={r.status} t={t} /></span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </AppShell>
  );
}

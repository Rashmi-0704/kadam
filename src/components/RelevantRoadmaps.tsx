import Link from "next/link";
import type { T } from "@/lib/i18n/config";
import { relevantRoadmaps } from "@/db/roadmap-catalog";

/** Roadmaps related to a problem: its career roles, then the skills it needs. */
export function RelevantRoadmaps({ roles, skills, t, linkable = true }: { roles: string[]; skills: string[]; t: T; linkable?: boolean }) {
  const list = relevantRoadmaps(roles, skills, 4);
  if (!list.length) return null;
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{t("rm.relevant")}</h2>
          <p className="text-sm text-ink-2">{t("rm.relevant_sub")}</p>
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((c) => {
          const body = (
            <>
              <span className="flex items-end gap-0.5" aria-hidden="true">
                {[0, 1, 2].map((i) => <span key={i} className="w-2 rounded-sm bg-saffron" style={{ height: 6 + i * 5, opacity: 0.5 + i * 0.25 }} />)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{c.title}</span>
                <span className="block text-sm text-ink-2">{c.blurb}</span>
                <span className="mt-1 block text-xs font-semibold text-ink-3">{c.kind === "role" ? t("rm.kind_role") : t("rm.kind_skill")} · {t("rm.topics_count", { n: c.topics.length + 2 })}</span>
              </span>
              {linkable && <span aria-hidden="true" className="text-ink-3 transition group-hover:translate-x-1 group-hover:text-ink">→</span>}
            </>
          );
          return (
            <li key={c.slug}>
              {linkable ? (
                <Link href={`/student/roadmaps/${c.slug}`} className="group card flex items-center gap-3 p-4 hover:border-ink">{body}</Link>
              ) : (
                <div className="card flex items-center gap-3 p-4">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

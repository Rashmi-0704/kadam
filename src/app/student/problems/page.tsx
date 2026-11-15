import Link from "next/link";
import { requireStudent } from "@/lib/guards";
import { getT } from "@/lib/i18n/server";
import { liveProblems, suggestions, reasonText } from "@/lib/matching";
import { ProblemCard } from "@/components/ProblemBits";
import { FilterBar } from "@/components/FilterBar";
import { EmptyState, Notice, PageTitle } from "@/components/ui";

// AI calls can take several seconds.
export const maxDuration = 60;

export const metadata = { title: "Problems" };

type SP = { tab?: string; sector?: string; type?: string; difficulty?: string; time?: string; mode?: string; q?: string; approved?: string };

export default async function ProblemsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { user, profile } = await requireStudent();
  const t = await getT();
  const all = await liveProblems();
  const approved = Boolean(profile.approved_at && profile.pathways);
  const tab = sp.tab === "suggested" || (!sp.tab && approved) ? "suggested" : "all";
  const matches = approved ? await suggestions(user.id, profile, all) : new Map();

  let list = all.filter((p) => {
    const c = p.categories ?? {};
    if (sp.sector && c.sector !== sp.sector) return false;
    if (sp.type && c.problem_type !== sp.type) return false;
    if (sp.difficulty && c.difficulty !== sp.difficulty) return false;
    if (sp.time && c.time_needed !== sp.time) return false;
    if (sp.mode && c.work_mode !== sp.mode) return false;
    if (sp.q) {
      const hay = `${p.title} ${p.business_name} ${(c.skills ?? []).join(" ")}`.toLowerCase();
      if (!hay.includes(sp.q.toLowerCase())) return false;
    }
    return true;
  });
  if (tab === "suggested") list = [...list].filter((p) => matches.has(p.id)).sort((a, b) => (matches.get(b.id)?.score ?? 0) - (matches.get(a.id)?.score ?? 0));

  const tabLink = (id: "suggested" | "all") => {
    const params = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "tab" && k !== "approved") as [string, string][]);
    params.set("tab", id);
    return `/student/problems?${params}`;
  };

  return (
    <div>
      <PageTitle eyebrow={t("problems.eyebrow")} title={t("problems.title")} sub={t("problems.sub")} />
      {sp.approved && <Notice kind="success" className="mb-5">{t("problems.approved")}</Notice>}
      <div className="mb-4 inline-flex rounded-full border border-line bg-card p-1" role="tablist">
        {(["suggested", "all"] as const).map((id) => (
          <Link key={id} href={tabLink(id)} role="tab" aria-selected={tab === id} className={`inline-flex min-h-10 items-center rounded-full px-5 text-sm font-semibold ${tab === id ? "bg-ink text-paper" : "text-ink-2"}`}>
            {id === "suggested" ? <><span aria-hidden="true" className="mr-1.5 text-saffron">✦</span>{t("problems.suggested")}</> : t("problems.all", { n: all.length })}
          </Link>
        ))}
      </div>
      <FilterBar />
      {tab === "suggested" && !approved ? (
        <EmptyState title={t("problems.need_profile")} body={t("problems.need_profile_body")} action={<Link href="/student/profile" className="btn-primary">{t("problems.build_profile")}</Link>} />
      ) : list.length === 0 ? (
        <EmptyState title={t("problems.none")} body={t("problems.none_body")} />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map((p) => (
            <li key={p.id}>
              <ProblemCard p={p} t={t} href={`/student/problems/${p.id}`} fit={tab === "suggested" ? reasonText(matches.get(p.id)?.reason ?? "", t) : null} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

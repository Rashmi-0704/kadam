import "server-only";
import { createHash } from "node:crypto";
import { q, one, J, type Row } from "./db";
import { matchProblems, heuristicMatch, skillGaps, type Match, type Pathways, type Gap } from "./ai/services";
import type { T } from "./i18n/config";
import { SEEDED_ROADMAPS } from "@/db/roadmaps-data";

const hash = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 16);
const NEW_DAYS = 3;

export async function liveProblems() {
  return q(
    `select p.id, p.title, p.categories, p.status, p.live_at, p.created_at, b.business_name, b.city,
            (select count(*)::int from engagements e where e.problem_id = p.id and e.status <> 'withdrawn') as takers
       from problems p join business_profiles b on b.user_id = p.business_id
      where p.status = 'live' order by p.live_at desc nulls last`,
  );
}

/** AI-3. Cached per student; recomputed only when the approved profile or the set of live problems changes. */
export async function suggestions(userId: string, profile: Row, problems: Row[]): Promise<Map<string, Match>> {
  if (!profile.approved_at || !profile.pathways) return new Map();
  const sig = hash(`${new Date(profile.approved_at).toISOString()}|${problems.map((p) => p.id).sort().join(",")}`);
  const key = `match:${userId}:${sig}`;
  const cached = await one(`select value from ai_cache where key = $1`, [key]);
  let ranked: Match[];
  const input = {
    pathways: profile.pathways as Pathways,
    skills: profile.cv_parsed?.skills ?? [],
    interests: profile.intake_summary?.interests ?? [],
    problems: problems.map((p) => ({ id: p.id, title: p.title, categories: p.categories, business: p.business_name })),
  };
  if (cached) ranked = cached.value as Match[];
  else {
    ranked = await matchProblems(input).catch(() => heuristicMatch(input));
    await q(`delete from ai_cache where key like $1`, [`match:${userId}:%`]);
    await q(`insert into ai_cache (key, value) values ($1,$2::jsonb) on conflict (key) do update set value = excluded.value`, [key, J(ranked)]);
  }
  // Fresh problems get a small boost so they find their first takers.
  const fresh = new Set(problems.filter((p) => p.live_at && Date.now() - new Date(p.live_at).getTime() < NEW_DAYS * 864e5).map((p) => p.id));
  return new Map(ranked.map((m) => [m.id, { ...m, score: m.score + (fresh.has(m.id) ? 15 : 0) }]));
}

export function reasonText(reason: string, t: T): string {
  if (!reason.includes("|")) return reason;
  const [kind, a, skills] = reason.split("|");
  const base = kind === "skills" ? t("match.skills", { skills: a }) : kind === "new" ? t("match.new", { business: a }) : t(`match.${kind}`, { role: a });
  return skills && kind !== "skills" ? `${base} · ${t("match.uses", { skills })}` : base;
}

/** AI-2b with links into roadmap steps. */
export async function gapsFor(userId: string, profile: Row, problem: Row): Promise<(Gap & { href: string })[]> {
  const key = `gap:${userId}:${problem.id}:${hash(JSON.stringify(profile.cv_parsed?.skills ?? []) + JSON.stringify(problem.categories?.skills ?? []))}`;
  const cached = await one(`select value from ai_cache where key = $1`, [key]);
  let gaps: Gap[];
  if (cached) gaps = cached.value as Gap[];
  else {
    gaps = await skillGaps({
      studentSkills: profile.cv_parsed?.skills ?? [],
      problem: { title: problem.title, problem: problem.problem, desired_outcome: problem.desired_outcome, skills: problem.categories?.skills ?? [] },
    });
    await q(`insert into ai_cache (key, value) values ($1,$2::jsonb) on conflict (key) do update set value = excluded.value`, [key, J(gaps)]);
  }
  const roles: string[] = problem.categories?.related_roles ?? [];
  return gaps.map((g) => {
    const s = g.skill.toLowerCase();
    for (const r of SEEDED_ROADMAPS) {
      const step = r.steps.find((st) => st.skills.some((k) => s.includes(k) || k.includes(s)) || st.title.toLowerCase().includes(s));
      if (step) return { ...g, href: `/student/roadmaps/${r.role}#${step.id}` };
    }
    return { ...g, href: roles[0] ? `/student/roadmaps/${roles[0]}` : "/student/roadmaps" };
  });
}

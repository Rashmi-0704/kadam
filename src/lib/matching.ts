import "server-only";
import { createHash } from "node:crypto";
import { q, one, J, type Row } from "./db";
import { matchProblemsEx, heuristicMatch, skillGapsEx, type Match, type Pathways, type Gap } from "./ai/services";
import { hasGemini } from "./ai/gemini";
import type { T } from "./i18n/config";
import { SEEDED_ROADMAPS, flattenTopics } from "@/db/roadmaps-data";

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

const HOUR = 36e5;
const BUSY_RETRY_MS = 2 * 60e3;
type MatchCache = { approvedAt: string; ids: string[]; at: number; ai: boolean; ranked: Match[] };

/**
 * AI-3 (decision 14 + Gemini budget). One cached ranking per student (`match:<user>:v4`).
 * Recomputed with Gemini when the approved profile changes, or when the set of live problems changed AND the last
 * AI ranking is at least an hour old. In between, problems that went live since are scored by rules and merged in,
 * so new problems still show up immediately. A rule-based ranking caused by a busy AI is retried after 2 minutes.
 */
export async function suggestions(userId: string, profile: Row, problems: Row[]): Promise<Map<string, Match>> {
  if (!profile.approved_at || !profile.pathways) return new Map();
  const approvedAt = new Date(profile.approved_at).toISOString();
  const ids = problems.map((p) => p.id as string).sort();
  const key = `match:${userId}:v4`;
  const input = {
    pathways: profile.pathways as Pathways,
    skills: profile.cv_parsed?.skills ?? [],
    interests: profile.intake_summary?.interests ?? [],
    problems: problems.map((p) => ({ id: p.id, title: p.title, categories: p.categories, business: p.business_name })),
  };
  const cached = (await one(`select value from ai_cache where key = $1`, [key]))?.value as MatchCache | undefined;
  const age = cached ? Date.now() - cached.at : Infinity;
  const sameProfile = cached?.approvedAt === approvedAt;
  const sameSet = sameProfile && cached!.ids.join(",") === ids.join(",");
  const fresh = sameProfile && (cached!.ai || !hasGemini() ? sameSet || age < HOUR : age < BUSY_RETRY_MS);
  let ranked: Match[];
  if (cached && fresh) {
    const live = new Set(ids);
    const known = new Set(cached.ranked.map((m) => m.id));
    const added = input.problems.filter((p) => !known.has(p.id));
    ranked = [...cached.ranked.filter((m) => live.has(m.id)), ...(added.length ? heuristicMatch({ ...input, problems: added }) : [])];
  } else {
    const r = await matchProblemsEx(input).catch(() => ({ ranked: heuristicMatch(input), ai: false, busy: false }));
    ranked = r.ranked;
    const value: MatchCache = { approvedAt, ids, at: Date.now(), ai: r.ai, ranked };
    await q(`insert into ai_cache (key, value) values ($1,$2::jsonb) on conflict (key) do update set value = excluded.value, created_at = now()`, [key, J(value)]);
  }
  // Fresh problems get a small boost so they find their first takers.
  const freshIds = new Set(problems.filter((p) => p.live_at && Date.now() - new Date(p.live_at).getTime() < NEW_DAYS * 864e5).map((p) => p.id));
  return new Map(ranked.map((m) => [m.id, { ...m, score: m.score + (freshIds.has(m.id) ? 15 : 0) }]));
}

export function reasonText(reason: string, t: T): string {
  if (!reason.includes("|")) return reason;
  if (reason.startsWith("ai|")) return reason.split("|").slice(3).join("|");
  const [kind, a, skills] = reason.split("|");
  const base = kind === "skills" ? t("match.skills", { skills: a }) : kind === "new" ? t("match.new", { business: a }) : t(`match.${kind}`, { role: a });
  return skills && kind !== "skills" ? `${base} · ${t("match.uses", { skills })}` : base;
}

type GapCache = { sig: string; ai: boolean; gaps: Gap[] };
export const gapKey = (userId: string, problemId: string) => `gap:${userId}:${problemId}`;

/**
 * AI-2b with links into roadmap steps. Cached per student–problem pair and reused on every later visit;
 * recomputed only if the student's CV skills or the problem's skills change. A rule-based list shown because the AI
 * was busy is marked `busy` (the page offers "Try again") and is retried on a visit after 2 minutes.
 */
export async function gapsFor(userId: string, profile: Row, problem: Row): Promise<(Gap & { href: string })[] & { busy?: boolean }> {
  const key = gapKey(userId, problem.id);
  const sig = hash(JSON.stringify(profile.cv_parsed?.skills ?? []) + JSON.stringify(problem.categories?.skills ?? []));
  const row = await one(`select value, created_at from ai_cache where key = $1`, [key]);
  const cached = row?.value as GapCache | undefined;
  const usable = cached && !Array.isArray(cached) && cached.sig === sig && (cached.ai || !hasGemini() || Date.now() - new Date(row!.created_at).getTime() < 2 * 60e3);
  let gaps: Gap[];
  let busy = false;
  if (usable) {
    gaps = cached.gaps;
    busy = !cached.ai && hasGemini();
  } else {
    const r = await skillGapsEx({
      studentSkills: profile.cv_parsed?.skills ?? [],
      problem: { title: problem.title, problem: problem.problem, desired_outcome: problem.desired_outcome, skills: problem.categories?.skills ?? [] },
    });
    gaps = r.gaps;
    busy = !r.ai && hasGemini();
    await q(`insert into ai_cache (key, value) values ($1,$2::jsonb) on conflict (key) do update set value = excluded.value, created_at = now()`, [key, J({ sig, ai: r.ai, gaps } satisfies GapCache)]);
  }
  const roles: string[] = problem.categories?.related_roles ?? [];
  const out = gaps.map((g) => {
    const s = g.skill.toLowerCase();
    for (const r of SEEDED_ROADMAPS) {
      const step = flattenTopics(r.sections).find((st) => st.skills.some((k) => s.includes(k) || k.includes(s)) || st.title.toLowerCase().includes(s));
      if (step) return { ...g, href: `/student/roadmaps/${r.role}#${step.id}` };
    }
    return { ...g, href: roles[0] ? `/student/roadmaps/${roles[0]}` : "/student/roadmaps" };
  });
  return Object.assign(out, { busy });
}

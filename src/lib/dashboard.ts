import "server-only";
import { one, type Row } from "./db";
import { liveProblems } from "./matching";
import { sectionsFor, type TopicStatus } from "./roadmaps";
import { flattenTopics } from "@/db/roadmaps-data";

/*
 * Dashboard data (round 3). Reads only what already exists: database rows and cached AI results.
 * Nothing here calls Gemini.
 */

type CachedMatch = { id: string; score: number; reason: string };

/**
 * Up to `n` suggested problems from the student's cached ranking (decision 14, `match:<user>:v4`),
 * skipping problems they already took. No cache yet: null (the caller shows the newest problems instead).
 */
export async function cachedSuggestions(userId: string, takenIds: Set<string>, n = 3): Promise<{ problems: Row[]; reasons: Map<string, string> } | null> {
  const cached = (await one(`select value from ai_cache where key = $1`, [`match:${userId}:v4`]))?.value as { ranked?: CachedMatch[] } | undefined;
  const live = await liveProblems();
  const byId = new Map(live.map((p) => [p.id as string, p]));
  if (!cached?.ranked?.length) return null;
  const ranked = [...cached.ranked].sort((a, b) => b.score - a.score).filter((m) => byId.has(m.id) && !takenIds.has(m.id)).slice(0, n);
  if (!ranked.length) return null;
  return { problems: ranked.map((m) => byId.get(m.id)!), reasons: new Map(ranked.map((m) => [m.id, m.reason])) };
}

export async function newestProblems(takenIds: Set<string>, n = 3) {
  return (await liveProblems()).filter((p) => !takenIds.has(p.id)).slice(0, n);
}

/** The report's headline number, e.g. "38 → 81 subscribers", or null. */
export function headlineOf(outcomes: unknown): string | null {
  if (!Array.isArray(outcomes)) return null;
  const o = outcomes.find((x) => x && typeof x === "object" && /\d/.test(String((x as Row).value ?? "")) && String((x as Row).label ?? "").toLowerCase() !== "status") as Row | undefined;
  if (!o) return null;
  const label = String(o.label ?? "").trim();
  return label ? `${String(o.value).trim()} ${label.toLowerCase()}` : String(o.value).trim();
}

/** First topic still to do in a roadmap ("learning" ones first). */
export function nextTopic(role: string, steps: unknown, statuses: Record<string, TopicStatus> | null | undefined): string | null {
  const topics = flattenTopics(sectionsFor(role, steps));
  const st = statuses ?? {};
  const learning = topics.find((t) => st[t.id] === "learning");
  const todo = learning ?? topics.find((t) => !st[t.id]);
  return todo?.title ?? null;
}

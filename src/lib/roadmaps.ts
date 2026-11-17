import "server-only";
import { q, one, J } from "./db";
import { generateRoadmap } from "./ai/services";
import { slugify } from "@/db/taxonomy";
import { CONFIRMED_RSH, flattenTopics, normalizeSections, seededRoadmap, type RoadmapIntro, type Section } from "@/db/roadmaps-data";
import { catalogItem } from "@/db/roadmap-catalog";

export type Roadmap = { role: string; title: string; summary: string; sections: Section[]; source: string; intro?: RoadmapIntro; rsh: string[] };
export type TopicStatus = "done" | "learning" | "skipped";

/** roadmap.sh credit links: the roadmap's own, else the catalogue's, kept only when confirmed to exist. */
function creditSlugs(role: string, own?: unknown): string[] {
  const list = Array.isArray(own) && own.length ? own : catalogItem(role)?.rsh ? [catalogItem(role)!.rsh] : [];
  return [...new Set(list.filter((s): s is string => typeof s === "string" && CONFIRMED_RSH.has(s)))];
}

/** Reads optional intro/rsh that newer AI roadmaps may carry; old cached rows simply don't have them. */
function extrasOf(raw: unknown): { intro?: RoadmapIntro; rsh?: unknown } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const r = raw as { intro?: unknown; rsh?: unknown };
  const intro = r.intro && typeof r.intro === "object" && typeof (r.intro as RoadmapIntro).does === "string" ? (r.intro as RoadmapIntro) : undefined;
  return { intro, rsh: r.rsh };
}

/**
 * AI-2a. Hand-written roadmaps are read from code and never call AI.
 * Any other role is generated once on first open and cached in `roadmaps` permanently: a cached row is never
 * regenerated or overwritten (old flat-list rows are upgraded on read by normalizeSections).
 */
export async function getRoadmap(roleParam: string): Promise<Roadmap | null> {
  const role = slugify(decodeURIComponent(roleParam));
  if (!role) return null;
  const seeded = seededRoadmap(role);
  if (seeded) return { role, title: seeded.title, summary: seeded.summary, sections: seeded.sections, source: "seed", intro: seeded.intro, rsh: creditSlugs(role, seeded.rsh) };

  const row = await one(`select role, title, summary, steps, source from roadmaps where role = $1`, [role]);
  if (row && row.source !== "template") {
    const x = extrasOf(row.steps);
    return { role: row.role, title: row.title, summary: row.summary ?? "", sections: normalizeSections(row.steps), source: row.source, intro: x.intro, rsh: creditSlugs(role, x.rsh) };
  }
  const c = catalogItem(role);
  const gen = await generateRoadmap(role, c ? { title: c.title, blurb: c.blurb, topics: c.topics, kind: c.kind, group: c.group } : undefined);
  const x = extrasOf(gen);
  const out: Roadmap = { role, title: gen.title, summary: gen.summary, sections: gen.sections, source: gen.source, intro: x.intro, rsh: creditSlugs(role, x.rsh) };
  // Template roadmaps are built locally (no AI call) when AI is unavailable; they are not stored, so a later open can get the AI version.
  if (gen.source === "template") return out;
  // First writer wins; an existing cached roadmap is never replaced.
  await q(
    `insert into roadmaps (role, title, summary, steps, source) values ($1,$2,$3,$4::jsonb,$5) on conflict (role) do nothing`,
    [role, gen.title, gen.summary, J({ sections: gen.sections, ...(x.intro ? { intro: x.intro } : {}), ...(Array.isArray(x.rsh) ? { rsh: x.rsh } : {}) }), gen.source],
  );
  return out;
}

/** Topic sections for progress: hand-written roadmaps from code, others from the stored row. */
export function sectionsFor(role: string, storedSteps: unknown): Section[] {
  return seededRoadmap(role)?.sections ?? normalizeSections(storedSteps);
}

export function progressOf(steps: unknown, statuses: Record<string, TopicStatus> | null | undefined, role?: string) {
  const ids = flattenTopics(role ? sectionsFor(role, steps) : normalizeSections(steps)).map((t) => t.id);
  const st = statuses ?? {};
  const count = (s: TopicStatus) => ids.filter((id) => st[id] === s).length;
  const done = count("done");
  const skipped = count("skipped");
  return { total: ids.length, done, learning: count("learning"), skipped, pct: ids.length ? Math.round(((done + skipped) / ids.length) * 100) : 0 };
}

export async function statusesFor(studentId: string, role: string): Promise<Record<string, TopicStatus>> {
  const r = await one(`select statuses, completed_step_ids from roadmap_progress where student_id = $1 and role = $2`, [studentId, role]);
  if (!r) return {};
  const st = { ...(r.statuses ?? {}) } as Record<string, TopicStatus>;
  for (const id of (r.completed_step_ids ?? []) as string[]) if (!st[id]) st[id] = "done";
  return st;
}

import "server-only";
import { q, one, J } from "./db";
import { generateRoadmap } from "./ai/services";
import { slugify } from "@/db/taxonomy";
import { flattenTopics, normalizeSections, type Section } from "@/db/roadmaps-data";
import { catalogItem } from "@/db/roadmap-catalog";

export type Roadmap = { role: string; title: string; summary: string; sections: Section[]; source: string };
export type TopicStatus = "done" | "learning" | "skipped";

/** AI-2a: seeded roadmaps are read as-is; other roles are generated once on first open and cached. */
export async function getRoadmap(roleParam: string): Promise<Roadmap | null> {
  const role = slugify(decodeURIComponent(roleParam));
  if (!role) return null;
  const row = await one(`select role, title, summary, steps, source from roadmaps where role = $1`, [role]);
  const fromRow = (r: typeof row): Roadmap => ({ role: r!.role, title: r!.title, summary: r!.summary ?? "", sections: normalizeSections(r!.steps), source: r!.source });
  // Upgrade older AI/template roadmaps that were stored as a flat list.
  if (row && row.source !== "template" && !Array.isArray(row.steps)) return fromRow(row);
  if (row && row.source === "seed") return fromRow(row);
  const c = catalogItem(role);
  const gen = await generateRoadmap(role, c ? { title: c.title, blurb: c.blurb, topics: c.topics, kind: c.kind, group: c.group } : undefined);
  // Template roadmaps are built locally (no AI call) and never stored, so the next open can try the AI again.
  if (gen.source === "template") return { role, ...gen };
  await q(
    `insert into roadmaps (role, title, summary, steps, source) values ($1,$2,$3,$4::jsonb,$5)
     on conflict (role) do update set title = excluded.title, summary = excluded.summary, steps = excluded.steps, source = excluded.source, created_at = now()`,
    [role, gen.title, gen.summary, J({ sections: gen.sections }), gen.source],
  );
  return { role, ...gen };
}

export function progressOf(steps: unknown, statuses: Record<string, TopicStatus> | null | undefined) {
  const ids = flattenTopics(normalizeSections(steps)).map((t) => t.id);
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

import "server-only";
import { q, one, J } from "./db";
import { generateRoadmap } from "./ai/services";
import { slugify } from "@/db/taxonomy";
import type { RoadmapStep } from "@/db/roadmaps-data";

export type Roadmap = { role: string; title: string; summary: string; steps: RoadmapStep[]; source: string };

/** AI-2a: seeded roadmaps are read as-is; other roles are generated once on first open and cached. */
export async function getRoadmap(roleParam: string): Promise<Roadmap | null> {
  const role = slugify(decodeURIComponent(roleParam));
  if (!role) return null;
  const row = await one<Roadmap>(`select role, title, summary, steps, source from roadmaps where role = $1`, [role]);
  if (row && row.source !== "template") return row;
  const gen = await generateRoadmap(role);
  // Keep template roadmaps replaceable: next open will try the AI again.
  if (row && gen.source === "template") return row;
  await q(
    `insert into roadmaps (role, title, summary, steps, source) values ($1,$2,$3,$4::jsonb,$5)
     on conflict (role) do update set title = excluded.title, summary = excluded.summary, steps = excluded.steps, source = excluded.source, created_at = now()`,
    [role, gen.title, gen.summary, J(gen.steps), gen.source],
  );
  return { role, ...gen };
}

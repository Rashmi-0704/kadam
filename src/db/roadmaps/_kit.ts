// Small helpers for the hand-written roadmaps in this folder.
// Imports only *types* from ../roadmaps-data.ts so there is no circular import at load time.
import type { Resource, Topic, TopicLevel } from "../roadmaps-data.ts";

export const art = (title: string, url: string): Resource => ({ title, url, type: "article" });
/** Shown as "Guide" in the UI. */
export const guide = (title: string, url: string): Resource => ({ title, url, type: "docs" });
export const course = (title: string, url: string): Resource => ({ title, url, type: "course" });
export const tool = (title: string, url: string): Resource => ({ title, url, type: "tool" });
/** YouTube search results, never a guessed video link. */
export const vid = (query: string, title?: string): Resource => ({
  title: title ?? `Video lessons: ${query}`,
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
  type: "video",
  search: query,
});
/** Google search results, for when no single well-known page fits. */
export const find = (query: string, title?: string): Resource => ({
  title: title ?? `Search: ${query}`,
  url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
  type: "article",
  search: query,
});

type TopicOpts = {
  why: string;
  time: string;
  level?: TopicLevel;
  practice?: string;
  problemTypes?: string[];
  skills?: string[];
  resources: Resource[];
  children?: Topic[];
};

/** A main topic on the spine. Non-recommended topics also set the older `optional` flag. */
export function topic(id: string, title: string, description: string, o: TopicOpts): Topic {
  const level = o.level ?? "recommended";
  return {
    id,
    title,
    description,
    skills: o.skills ?? [],
    resources: o.resources,
    level,
    why: o.why,
    time: o.time,
    ...(o.practice ? { practice: o.practice } : {}),
    ...(o.problemTypes ? { problemTypes: o.problemTypes } : {}),
    ...(level !== "recommended" ? { optional: true } : {}),
    ...(o.children ? { children: o.children } : {}),
  };
}

/** A lighter sub-topic: explainer, time and level at minimum. */
export function sub(id: string, title: string, description: string, time: string, level: TopicLevel = "recommended", resources: Resource[] = [], skills: string[] = []): Topic {
  return { id, title, description, skills, resources, level, time, ...(level !== "recommended" ? { optional: true } : {}) };
}

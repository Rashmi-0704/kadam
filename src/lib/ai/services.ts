import "server-only";
import { z } from "zod";
import { geminiJson, geminiCanRead, toBase64, type Part } from "./gemini";
import { ROLES, roleTitle, slugify, SECTORS, PROBLEM_TYPES, DIFFICULTIES, TIME_NEEDED, WORK_MODES, type Categories } from "@/db/taxonomy";
import type { Section, Topic, Resource } from "@/db/roadmaps-data";
import { pickTitle, heuristicCategories } from "./heuristics";

const LANG_NAME: Record<string, string> = { en: "English", hi: "Hindi", kn: "Kannada", ta: "Tamil", or: "Odia", bn: "Bengali", gu: "Gujarati" };
const STYLE = "Use short, plain sentences. Never call Kadam an internship platform or job board. Never describe business owners as uneducated.";
const ROLE_LIST = ROLES.map((r) => `${r.slug} (${r.title})`).join(", ");

const str = { type: "string" };
const strArr = { type: "array", items: str };
const obj = (properties: Record<string, unknown>, required = Object.keys(properties)) => ({ type: "object", properties, required });

const lc = (s: string) => s.toLowerCase();
const uniq = <T,>(a: T[]) => Array.from(new Set(a));
const hits = (text: string, words: string[]) => words.filter((w) => lc(text).includes(lc(w))).length;

/* ============================== AI-1a  CV parser ============================== */
export const CvSchema = z.object({
  name: z.string().default(""),
  education: z.array(z.object({ degree: z.string(), institution: z.string().default(""), year: z.string().default("") })).default([]),
  skills: z.array(z.string()).default([]),
  experience: z.array(z.object({ title: z.string(), org: z.string().default(""), summary: z.string().default("") })).default([]),
  interests: z.array(z.string()).default([]),
});
export type ParsedCv = z.infer<typeof CvSchema>;

const SKILL_LEXICON = [
  "Python", "Java", "C++", "JavaScript", "React", "HTML", "CSS", "SQL", "Excel", "Google Sheets", "Power BI", "Tableau", "Tally", "GST",
  "Canva", "Figma", "Photoshop", "Illustrator", "SEO", "Instagram", "Social media", "Content writing", "Copywriting", "Public speaking",
  "Research", "Interviewing", "Statistics", "Machine learning", "Data analysis", "Accounting", "Costing", "Marketing", "Video editing",
  "Photography", "Git", "Android", "Node.js", "MS Office", "Project management", "Leadership", "Journalism", "Editing",
];

export async function parseCv(input: { bytes?: Uint8Array; mime?: string; text?: string }): Promise<ParsedCv> {
  const parts: Part[] = [{ text: "Extract the student's CV into JSON. Keep wording short. If something is missing, leave it empty." }];
  // Readable text (most PDFs) is much faster for the model than the file itself; send the file only for photos and scans.
  const hasText = (input.text ?? "").replace(/\s+/g, " ").trim().length > 300;
  if (!hasText && input.bytes && input.mime && geminiCanRead(input.mime)) parts.push({ inline_data: { mime_type: input.mime, data: toBase64(input.bytes) } });
  if (input.text) parts.push({ text: `CV text:\n${input.text.slice(0, 12000)}` });
  const ai = await geminiJson({
    system: `You read student CVs for Kadam, a platform where college students solve real problems for small businesses and NGOs. ${STYLE}`,
    parts,
    zod: CvSchema,
    jsonSchema: obj({
      name: str,
      education: { type: "array", items: obj({ degree: str, institution: str, year: str }) },
      skills: strArr,
      experience: { type: "array", items: obj({ title: str, org: str, summary: str }) },
      interests: strArr,
    }),
    temperature: 0.1,
  });
  if (ai) return ai;
  const text = input.text ?? "";
  return {
    name: "",
    education: [],
    skills: SKILL_LEXICON.filter((s) => new RegExp(`(^|[^a-z])${s.toLowerCase().replace(/[.+]/g, (c) => "[" + c + "]")}($|[^a-z])`).test(lc(text))),
    experience: [],
    interests: ROLES.filter((r) => hits(text, r.keywords) > 0).slice(0, 4).map((r) => r.title),
  };
}

/* ============================== AI-1b  Intake chat ============================== */
export type ChatTurn = { role: "assistant" | "user"; text: string };
export const IntakeSummarySchema = z.object({
  interests: z.array(z.string()).default([]),
  current: z.string().default(""),
  goal: z.string().default(""),
  target_roles: z.array(z.string()).default([]),
});
export type IntakeSummary = z.infer<typeof IntakeSummarySchema>;
const IntakeStepSchema = z.object({ done: z.boolean(), question: z.string().default(""), summary: IntakeSummarySchema.optional().nullable() });

export const INTAKE_FALLBACK_QUESTIONS = ["intake.q1", "intake.q2", "intake.q3", "intake.q4"];

export async function intakeNext(input: {
  cv: ParsedCv | null;
  transcript: ChatTurn[];
  jobTexts: string[];
  targetRoles: string[];
}): Promise<{ done: boolean; question?: string; questionKey?: string; summary?: IntakeSummary }> {
  const userTurns = input.transcript.filter((t) => t.role === "user").length;
  const ai = await geminiJson({
    system:
      `You are Kadam's career intake guide for Indian college students from every stream. Ask ONE short, friendly question at a time to fill gaps in the CV ` +
      `and learn the student's interests, intent, where they are now and where they want to go. Students may paste job links or name target roles. ` +
      `After 4 to 6 student answers, or when you have enough, set done=true and give a summary. Write in simple English. ${STYLE}`,
    parts: [
      { text: `Parsed CV: ${JSON.stringify(input.cv ?? {})}` },
      { text: `Target roles named so far: ${input.targetRoles.join(", ") || "none"}` },
      { text: `Job pages the student shared (trimmed): ${input.jobTexts.map((t) => t.slice(0, 1500)).join("\n---\n") || "none"}` },
      { text: `Chat so far: ${JSON.stringify(input.transcript)}\nStudent answers so far: ${userTurns}. Max 6.` },
    ],
    zod: IntakeStepSchema,
    jsonSchema: obj({ done: { type: "boolean" }, question: str, summary: obj({ interests: strArr, current: str, goal: str, target_roles: strArr }) }, ["done", "question"]),
    temperature: 0.6,
  });
  if (ai && (ai.done ? ai.summary : ai.question) && !(userTurns >= 6 && !ai.done)) {
    return ai.done ? { done: true, summary: ai.summary! } : { done: false, question: ai.question };
  }
  if (userTurns < INTAKE_FALLBACK_QUESTIONS.length) return { done: false, questionKey: INTAKE_FALLBACK_QUESTIONS[userTurns] };
  const answers = input.transcript.filter((t) => t.role === "user").map((t) => t.text);
  const all = answers.join(" ") + " " + input.jobTexts.join(" ");
  const named = ROLES.filter((r) => lc(all).includes(lc(r.title))).map((r) => r.title);
  return {
    done: true,
    summary: {
      interests: uniq([...(input.cv?.interests ?? []), ...ROLES.filter((r) => hits(answers[0] ?? "", r.keywords) > 0).map((r) => r.title)]).slice(0, 5),
      current: answers[0] ?? "",
      goal: answers[3] ?? answers[answers.length - 1] ?? "",
      target_roles: uniq([...input.targetRoles, ...named]).slice(0, 4),
    },
  };
}

/* ============================== AI-1c  Pathway builder ============================== */
const PathwayItem = z.object({ role: z.string(), slug: z.string().default(""), rationale: z.string() });
export const PathwaysSchema = z.object({ now: z.array(PathwayItem), pivot: z.array(PathwayItem), stretch: z.array(PathwayItem) });
export type Pathways = z.infer<typeof PathwaysSchema>;

export async function buildPathways(input: { cv: ParsedCv | null; summary: IntakeSummary | null; transcript: ChatTurn[] }): Promise<Pathways> {
  const item = obj({ role: str, slug: str, rationale: str });
  const ai = await geminiJson({
    system:
      `You build a career pathway profile for an Indian college student. Return 2 'now' roles they fit today, 2 'pivot' adjacent roles they could move into, ` +
      `and 1-2 'stretch' aspirational roles. Each rationale is one short sentence that points to evidence from the student. ` +
      `Prefer these role slugs when they fit: ${ROLE_LIST}. If none fit, make a new short slug. ${STYLE}`,
    parts: [{ text: `CV: ${JSON.stringify(input.cv ?? {})}\nIntake summary: ${JSON.stringify(input.summary ?? {})}\nChat: ${JSON.stringify(input.transcript).slice(0, 6000)}` }],
    zod: PathwaysSchema,
    jsonSchema: obj({ now: { type: "array", items: item }, pivot: { type: "array", items: item }, stretch: { type: "array", items: item } }),
  });
  if (ai) {
    const fix = (a: Pathways["now"]) => a.map((p) => ({ ...p, slug: p.slug ? slugify(p.slug) : slugify(p.role) }));
    return { now: fix(ai.now), pivot: fix(ai.pivot), stretch: fix(ai.stretch) };
  }
  const skillsText = (input.cv?.skills ?? []).join(" ") + " " + (input.cv?.experience ?? []).map((e) => `${e.title} ${e.summary}`).join(" ");
  const interestText = [...(input.summary?.interests ?? []), ...(input.cv?.interests ?? []), input.transcript.filter((t) => t.role === "user").map((t) => t.text).join(" ")].join(" ");
  const targets = input.summary?.target_roles ?? [];
  const scored = ROLES.map((r) => ({ r, skill: hits(skillsText, r.keywords), interest: hits(interestText, r.keywords) }));
  const nowR = [...scored].sort((a, b) => b.skill - a.skill || b.interest - a.interest).slice(0, 2);
  const pivotR = [...scored].filter((s) => !nowR.includes(s)).sort((a, b) => b.interest - a.interest || b.skill - a.skill).slice(0, 2);
  const stretchSlug = targets.map((t) => ROLES.find((r) => lc(r.title) === lc(t) || r.slug === slugify(t))).find((r) => r && !nowR.some((n) => n.r === r) && !pivotR.some((p) => p.r === r));
  const stretch = stretchSlug ?? ROLES.find((r) => r.slug === "product-manager")!;
  const matched = (r: (typeof ROLES)[number], text: string) => {
    const cvSkills = (input.cv?.skills ?? []).filter((s) => r.keywords.some((k) => lc(s).includes(k) || k.includes(lc(s))));
    if (cvSkills.length) return cvSkills.slice(0, 3);
    return r.keywords.filter((k) => /^[a-z]/.test(k) && lc(text).includes(k)).slice(0, 2);
  };
  const list = (a: string[]) => (a.length > 1 ? `${a.slice(0, -1).join(", ")} and ${a.at(-1)}` : a[0] ?? "");
  const top = (input.cv?.skills ?? []).slice(0, 2);
  return {
    now: nowR.map(({ r }) => {
      const m = matched(r, skillsText);
      return { role: r.title, slug: r.slug, rationale: m.length ? `Your ${list(m)} already match everyday ${r.title} work.` : top.length ? `Your ${list(top)} give you a head start here.` : "Your studies and projects match the basics of this role." };
    }),
    pivot: pivotR.map(({ r }) => {
      const m = r.keywords.filter((k) => /^[a-z]/.test(k) && lc(interestText).includes(k)).slice(0, 2);
      return { role: r.title, slug: r.slug, rationale: m.length ? `You talked about ${list(m)} — this role builds on that with a few new skills.` : "It builds on what you enjoy and needs only a few new skills." };
    }),
    stretch: [{ role: stretch.title, slug: stretch.slug, rationale: targets.some((x) => lc(x) === lc(stretch.title)) ? `You named ${stretch.title} as a goal. Real projects will build the experience it needs.` : "An ambitious goal your strengths can grow into with real project experience." }],
  };
}

/* ============================== AI-2a  Roadmap generator ============================== */
const ResSchema = z.object({ title: z.string(), url: z.string(), type: z.enum(["article", "video", "course", "docs", "tool"]).catch("article") });
const SubSchema = z.object({ title: z.string(), description: z.string(), optional: z.boolean().default(false) });
const TopicSchema = z.object({
  title: z.string(),
  description: z.string(),
  skills: z.array(z.string()).default([]),
  resources: z.array(ResSchema).default([]),
  optional: z.boolean().default(false),
  subtopics: z.array(SubSchema).default([]),
});
const RoadmapGen = z.object({ summary: z.string(), sections: z.array(z.object({ title: z.string(), topics: z.array(TopicSchema).min(1).max(6) })).min(2).max(4) });

export type RoadmapHint = { title: string; blurb: string; topics: string[]; kind: "role" | "skill"; group: string };

export async function generateRoadmap(role: string, hint?: RoadmapHint): Promise<{ title: string; summary: string; sections: Section[]; source: string }> {
  const title = hint?.title ?? roleTitle(role);
  const res = obj({ title: str, url: str, type: { type: "string", enum: ["article", "video", "course", "docs", "tool"] } });
  const ai = await geminiJson({
    system:
      `You write roadmap.sh-style skill roadmaps for Indian college students. Return 3 sections in learning order. Each section has 2-4 topics; ` +
      `each topic has a one-to-two sentence explainer, skill keywords, 1-3 free, well-known resources with real URLs and a type, ` +
      `an 'optional' flag for nice-to-have topics, and 0-4 subtopics (title, one-sentence description, optional flag). ` +
      `End the last section with a topic about solving a real problem for a small business on Kadam. ${STYLE}`,
    parts: [{ text: `${hint?.kind === "skill" ? "Skill" : "Role"}: ${title}${hint ? `
Key areas to cover, in order: ${hint.topics.join(", ")}` : ""}` }],
    zod: RoadmapGen,
    jsonSchema: obj({
      summary: str,
      sections: {
        type: "array",
        items: obj({
          title: str,
          topics: { type: "array", items: obj({ title: str, description: str, skills: strArr, resources: { type: "array", items: res }, optional: { type: "boolean" }, subtopics: { type: "array", items: obj({ title: str, description: str, optional: { type: "boolean" } }) } }) },
        }),
      },
    }),
  });
  const prefix = role.slice(0, 12);
  const toTopic = (tp: z.infer<typeof TopicSchema>, si: number, ti: number): Topic => {
    const id = `${prefix}-${si + 1}-${ti + 1}`;
    return {
      id,
      title: tp.title,
      description: tp.description,
      skills: tp.skills,
      resources: tp.resources.filter((r) => /^https:\/\//.test(r.url)).slice(0, 4),
      ...(tp.optional ? { optional: true } : {}),
      children: tp.subtopics.map((c, ci) => ({ id: `${id}-${ci + 1}`, title: c.title, description: c.description, skills: [], resources: [], ...(c.optional ? { optional: true } : {}) })),
    };
  };
  if (ai) return { title, summary: ai.summary, sections: ai.sections.map((sec, si) => ({ title: sec.title, topics: sec.topics.map((tp, ti) => toTopic(tp, si, ti)) })), source: "ai" };
  const v = (q: string): Resource => ({ title: `Video lessons: ${q}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, type: "video" });
  const tech = hint ? /tech|coding|tools/i.test(hint.group) : false;
  const read = (q: string): Resource => tech
    ? { title: `freeCodeCamp: ${q}`, url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(q)}`, type: "article" }
    : { title: `Khan Academy: ${q}`, url: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(q)}`, type: "course" };
  if (hint && hint.topics.length >= 3) {
    const half = Math.ceil(hint.topics.length / 2);
    const mk = (name: string, si: number, ti: number): Topic => ({
      id: `${prefix}-${si + 1}-${ti + 1}`,
      title: name,
      description: `Learn ${name.toLowerCase()} for ${title} work: the core ideas first, then practise on a small example of your own.`,
      skills: [name.toLowerCase()],
      resources: [v(`${name} ${hint.kind === "skill" ? title : ""} for beginners`.replace(/\s+/g, " ")), read(name)],
    });
    return {
      title,
      summary: hint.blurb,
      source: "template",
      sections: [
        { title: "Foundations", topics: hint.topics.slice(0, half).map((n, i) => mk(n, 0, i)) },
        { title: "Core skills", topics: hint.topics.slice(half).map((n, i) => mk(n, 1, i)) },
        { title: "Prove it", topics: [
          { id: `${prefix}-3-1`, title: "Solve a real problem", description: `Take up a Kadam problem that needs ${title} and deliver it for a real business or NGO.`, skills: [], resources: [] },
          { id: `${prefix}-3-2`, title: "Show your impact", description: "Share your impact report and resume bullets with recruiters.", skills: [], resources: [] },
        ] },
      ],
    };
  }
  return {
    title,
    summary: `A step-by-step path into ${title} work.`,
    source: "template",
    sections: [
      { title: "Understand the role", topics: [
        { id: `${prefix}-1-1`, title: `What a ${title} does`, description: "Read three job descriptions and talk to one person who does this work.", skills: [], resources: [v(`what does a ${title} do`)] },
        { id: `${prefix}-1-2`, title: "Core concepts", description: "Learn the basic ideas and words used in this field.", skills: [], resources: [{ title: "Free courses on Khan Academy", url: "https://www.khanacademy.org/", type: "course" }] },
      ] },
      { title: "Build skills", topics: [
        { id: `${prefix}-2-1`, title: "Main tools", description: "Get comfortable with the two or three tools people in this role use every day.", skills: [], resources: [v(`${title} tools for beginners`)] },
        { id: `${prefix}-2-2`, title: "Practice project", description: "Do one small project on your own from start to finish.", skills: [], resources: [] },
      ] },
      { title: "Prove it", topics: [
        { id: `${prefix}-3-1`, title: "Solve a real problem", description: "Take up a Kadam problem in this area and deliver it.", skills: [], resources: [] },
        { id: `${prefix}-3-2`, title: "Show your impact", description: "Share your impact report and resume bullets.", skills: [], resources: [] },
      ] },
    ],
  };
}

/* ============================== AI-2b  Skill-gap finder ============================== */
const GapSchema = z.object({ gaps: z.array(z.object({ skill: z.string(), why: z.string() })).max(6) });
export type Gap = { skill: string; why: string };

export async function skillGaps(input: { studentSkills: string[]; problem: { title: string; problem: string; desired_outcome: string; skills: string[] } }): Promise<Gap[]> {
  const ai = await geminiJson({
    system: `List up to 5 skills this student should brush up before working on the problem. Only list skills they do not clearly have. 'why' is one short sentence tied to the problem. ${STYLE}`,
    parts: [{ text: `Student skills: ${input.studentSkills.join(", ") || "unknown"}\nProblem: ${JSON.stringify(input.problem)}` }],
    zod: GapSchema,
    jsonSchema: obj({ gaps: { type: "array", items: obj({ skill: str, why: str }) } }),
  });
  if (ai) return ai.gaps;
  const have = input.studentSkills.map(lc);
  return input.problem.skills
    .filter((s) => !have.some((h) => h.includes(lc(s)) || lc(s).includes(h)))
    .slice(0, 5)
    .map((s) => ({ skill: s, why: `This problem needs ${s}.` }));
}

/* ============================== AI-3  Matcher ============================== */
const MatchSchema = z.object({ ranked: z.array(z.object({ id: z.string(), score: z.number(), reason: z.string() })) });
export type Match = { id: string; score: number; reason: string };
type MatchProblem = { id: string; title: string; categories: Categories; business: string };

export async function matchProblems(input: { pathways: Pathways; skills: string[]; interests: string[]; problems: MatchProblem[] }): Promise<Match[]> {
  const ai = await geminiJson({
    system: `Rank live problems by fit with the student's approved career pathways and skills. Return every problem id with a 0-100 score and a one-line reason addressed to the student ("Builds on your..."). ${STYLE}`,
    parts: [
      { text: `Pathways: ${JSON.stringify(input.pathways)}\nSkills: ${input.skills.join(", ")}\nInterests: ${input.interests.join(", ")}` },
      { text: `Problems: ${JSON.stringify(input.problems.map((p) => ({ id: p.id, title: p.title, ...p.categories })))}` },
    ],
    zod: MatchSchema,
    jsonSchema: obj({ ranked: { type: "array", items: obj({ id: str, score: { type: "number" }, reason: str }) } }),
    temperature: 0.2,
  });
  const valid = new Set(input.problems.map((p) => p.id));
  if (ai) {
    const r = ai.ranked.filter((m) => valid.has(m.id));
    if (r.length) return r.sort((a, b) => b.score - a.score);
  }
  return heuristicMatch(input);
}

export function heuristicMatch(input: { pathways: Pathways; skills: string[]; problems: MatchProblem[] }): Match[] {
  const tiers: [keyof Pathways, number, string][] = [["now", 50, "match.now"], ["pivot", 40, "match.pivot"], ["stretch", 30, "match.stretch"]];
  const skills = input.skills.map(lc);
  return input.problems
    .map((p) => {
      let score = 10;
      let reason = "";
      for (const [tier, pts] of tiers) {
        const hit = input.pathways[tier].find((x) => p.categories.related_roles?.includes(x.slug));
        if (hit && pts + 10 > score) {
          score = pts + 10;
          reason = `${tier}|${hit.role}`;
        }
      }
      const overlap = (p.categories.skills ?? []).filter((s) => skills.some((h) => h.includes(lc(s)) || lc(s).includes(h)));
      score += overlap.length * 8;
      if (!reason && overlap.length) reason = `skills|${overlap.slice(0, 2).join(", ")}`;
      if (!reason) reason = `new|${p.business}`;
      else if (overlap.length) reason += `|${overlap.slice(0, 2).join(", ")}`;
      return { id: p.id, score: Math.min(99, score), reason };
    })
    .sort((a, b) => b.score - a.score);
}

/* ============================== AI-4a  Problem intake agent ============================== */
export const PROBLEM_FIELDS = ["problem", "background", "current_process", "desired_outcome", "constraints", "expected_timeline", "resources_provided"] as const;
export type ProblemField = (typeof PROBLEM_FIELDS)[number];
const IntakeQ = z.object({ done: z.boolean(), question: z.string().default(""), missing: z.array(z.string()).default([]) });

export async function problemIntakeNext(input: { transcript: ChatTurn[]; lang: string; business: { name: string; sector: string; city: string }; fileParts: Part[] }) {
  const userTurns = input.transcript.filter((t) => t.role === "user").length;
  const ai = await geminiJson({
    system:
      `You help a small business owner in India describe a problem so that a college student can solve it. The owner may be a first-time digital user. ` +
      `Ask ONE short, warm question at a time, in ${LANG_NAME[input.lang] ?? "English"}, until you know: the problem, about the business, how it works today, ` +
      `what a good result looks like, constraints, the expected timeline, and what resources they can share. Do not ask about things already answered. ` +
      `When everything is known (or after 7 answers), set done=true. ${STYLE}`,
    parts: [{ text: `Business: ${JSON.stringify(input.business)}\nConversation: ${JSON.stringify(input.transcript)}` }, ...input.fileParts],
    zod: IntakeQ,
    jsonSchema: obj({ done: { type: "boolean" }, question: str, missing: strArr }, ["done", "question"]),
    temperature: 0.5,
  });
  if (ai && (ai.done || ai.question) && userTurns < 8) return ai.done ? { done: true as const } : { done: false as const, question: ai.question };
  // Rule-based: ask for each field in turn. The first user turn is the problem itself.
  const next = PROBLEM_FIELDS[userTurns];
  if (!next) return { done: true as const };
  return { done: false as const, questionKey: `pintake.${next}` };
}

/* ============================== AI-4b  Drafter + categoriser ============================== */
const DraftSchema = z.object({
  title: z.string(),
  background: z.string(),
  current_process: z.string(),
  problem: z.string(),
  desired_outcome: z.string(),
  constraints: z.string(),
  expected_timeline: z.string(),
  resources_provided: z.string(),
  categories: z.object({
    sector: z.string(),
    problem_type: z.string(),
    skills: z.array(z.string()),
    difficulty: z.string(),
    time_needed: z.string(),
    work_mode: z.string(),
    city: z.string().default(""),
    related_roles: z.array(z.string()),
  }),
});
export type Draft = z.infer<typeof DraftSchema>;

export async function draftProblem(input: { transcript: ChatTurn[]; business: { name: string; sector: string; city: string }; fileParts: Part[] }): Promise<Draft> {
  const ai = await geminiJson({
    system:
      `Turn this conversation with a small business owner into a clear problem statement for college students. Write every field in simple English ` +
      `(translate if the owner wrote in another Indian language). Keep each field to 1-3 sentences. Title under 70 characters, action-oriented. ` +
      `Then categorise. sector one of: ${SECTORS.join(", ")}. problem_type one of: ${PROBLEM_TYPES.join(", ")}. difficulty one of: ${DIFFICULTIES.join(", ")}. ` +
      `time_needed one of: lt1w (under 1 week), w1_4 (1-4 weeks), m1_2 (1-2 months). ` +
      `work_mode one of: ${WORK_MODES.join(", ")}. skills: 3-5 short free tags. related_roles: 2-3 slugs from: ${ROLE_LIST}. ${STYLE}`,
    parts: [{ text: `Business: ${JSON.stringify(input.business)}\nConversation: ${JSON.stringify(input.transcript)}` }, ...input.fileParts],
    zod: DraftSchema,
    jsonSchema: obj({
      title: str, background: str, current_process: str, problem: str, desired_outcome: str, constraints: str, expected_timeline: str, resources_provided: str,
      categories: obj({ sector: str, problem_type: str, skills: strArr, difficulty: str, time_needed: str, work_mode: str, city: str, related_roles: strArr }),
    }),
    temperature: 0.3,
  });
  if (ai) return { ...ai, categories: cleanCategories(ai.categories, input.business) };
  // Fallback: map the owner's answers to fields in the order they were asked.
  const answers = input.transcript.filter((t) => t.role === "user").map((t) => t.text.trim());
  const f = (i: number) => answers[i] ?? "";
  const problem = f(0);
  const title = pickTitle(problem);
  const draft = {
    title,
    problem,
    background: f(1) || `${input.business.name}, ${input.business.city}.`,
    current_process: f(2),
    desired_outcome: f(3),
    constraints: f(4),
    expected_timeline: f(5),
    resources_provided: f(6),
  };
  // The problem and the desired outcome say what kind of help is needed; the other answers add context.
  const focus = `${f(0)} ${f(3)}`;
  const context = answers.filter((_, i) => i !== 0 && i !== 3).join(" ");
  return { ...draft, categories: heuristicCategories(focus, context, draft.expected_timeline, input.business) };
}

function cleanCategories(c: Draft["categories"], business: { sector: string; city: string }): Categories {
  const inSet = (v: string, set: readonly string[], d: string) => (set.includes(v) ? v : d);
  return {
    sector: inSet(c.sector, SECTORS, business.sector || "other"),
    problem_type: inSet(c.problem_type, PROBLEM_TYPES, "operations"),
    skills: c.skills.slice(0, 6),
    difficulty: inSet(c.difficulty, DIFFICULTIES, "beginner"),
    time_needed: inSet(c.time_needed, TIME_NEEDED, "w1_4"),
    work_mode: inSet(c.work_mode, WORK_MODES, "hybrid"),
    city: c.city || business.city,
    related_roles: c.related_roles.map(slugify).slice(0, 3),
  };
}

/* ============================== AI-5  Impact reporter ============================== */
export const ReportSchema = z.object({
  summary: z.string(),
  outcomes: z.array(z.object({ label: z.string(), value: z.string() })),
  skills_demonstrated: z.array(z.string()),
  timeline: z.array(z.object({ date: z.string(), event: z.string() })),
  resume_bullets: z.array(z.string()).min(1).max(6),
});
export type Report = z.infer<typeof ReportSchema>;

export type ReportInput = {
  student: string;
  business: { name: string; sector: string; city: string };
  problem: { title: string; problem: string; desired_outcome: string; skills: string[] };
  submission: { description: string; submitted_at: string } | null;
  statuses: { status: string; reason: string | null; created_at: string }[];
  updates: { what_changed: string; metrics: Record<string, string>; comments: string | null; created_at: string }[];
  feedback: { text: string; created_at: string }[];
  startedAt: string;
};

const STATUS_EVENT: Record<string, string> = {
  taken_up: "Took up the problem", in_progress: "Started work with the business", submitted: "Submitted a solution", received: "Business confirmed receipt",
  accepted: "Solution accepted", in_use: "Solution put into daily use", needs_changes: "Business asked for changes", rejected: "Solution not taken forward", withdrawn: "Withdrew",
};

export async function impactReport(input: ReportInput): Promise<Report> {
  const ai = await geminiJson({
    system:
      `Write an impact report for a college student's real-world project with an Indian small business or NGO. Be factual: use only the evidence given, ` +
      `never invent numbers. summary: 2-3 sentences. outcomes: measurable results as label/value pairs (use the business's numbers). ` +
      `timeline: dated events (YYYY-MM-DD). resume_bullets: 3-4 strong bullets starting with a verb, with numbers where available. ${STYLE}`,
    parts: [{ text: JSON.stringify(input) }],
    zod: ReportSchema,
    jsonSchema: obj({
      summary: str,
      outcomes: { type: "array", items: obj({ label: str, value: str }) },
      skills_demonstrated: strArr,
      timeline: { type: "array", items: obj({ date: str, event: str }) },
      resume_bullets: strArr,
    }),
    temperature: 0.3,
  });
  if (ai) return ai;
  return { ...templateReport(input), __template: true } as Report;
}

function templateReport(i: ReportInput): Report {
  const latest = i.statuses.filter((s) => s.status !== "feedback").at(-1)?.status ?? "taken_up";
  const inUse = i.statuses.some((s) => s.status === "in_use");
  const metrics = i.updates.at(-1)?.metrics ?? {};
  const LABEL: Record<string, string> = { time_saved: "Time saved", sales: "Sales", costs: "Costs", users: "Users / customers", other: "Other" };
  const outcomes = Object.entries(metrics).filter(([, v]) => v).map(([k, v]) => ({ label: LABEL[k] ?? k, value: String(v) }));
  outcomes.unshift({ label: "Status", value: STATUS_EVENT[latest] ?? latest });
  const timeline = [
    ...i.statuses.map((s) => ({ date: s.created_at.slice(0, 10), event: STATUS_EVENT[s.status] ?? s.status })),
    ...i.updates.map((u) => ({ date: u.created_at.slice(0, 10), event: u.what_changed })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const where = `${i.business.name}${i.business.city ? `, ${i.business.city}` : ""}`;
  const bullets = [`Solved a real problem for ${where}: ${i.problem.title.replace(/\.$/, "")}`];
  if (inUse) bullets.push(`Delivered a solution now in daily use by the business`);
  for (const o of outcomes.slice(1, 3)) bullets.push(`Helped achieve ${o.label.toLowerCase()}: ${o.value}`);
  if (i.problem.skills.length) bullets.push(`Applied ${i.problem.skills.slice(0, 3).join(", ")} with a real business owner as the client`);
  return {
    summary: `${i.student} worked with ${where} on "${i.problem.title}". ${i.submission ? "They delivered a solution" : "The work is in progress"}${inUse ? " that is now used in daily operations" : ""}.${i.feedback.at(-1) ? ` The business said: "${i.feedback.at(-1)!.text}"` : ""}`,
    outcomes,
    skills_demonstrated: i.problem.skills,
    timeline,
    resume_bullets: bullets.slice(0, 4),
  };
}

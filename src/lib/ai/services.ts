import "server-only";
import { z } from "zod";
import { geminiCall, geminiCanRead, hasGemini, toBase64, type Part } from "./gemini";
import { ROLES, roleTitle, slugify, SECTORS, PROBLEM_TYPES, DIFFICULTIES, TIME_NEEDED, WORK_MODES, type Categories } from "@/db/taxonomy";
import type { Section, Topic, Resource, RoadmapIntro } from "@/db/roadmaps-data";
import { pickTitle, heuristicCategories } from "./heuristics";
import { catalogItem } from "@/db/roadmap-catalog";
import { normaliseYear } from "@/lib/year";
export { YEAR_OPTIONS } from "@/lib/year";

const LANG_NAME: Record<string, string> = { en: "English", hi: "Hindi", kn: "Kannada", ta: "Tamil", or: "Odia", bn: "Bengali", gu: "Gujarati" };
const STYLE = "Use short, plain sentences. Never call Kadam an internship platform or job board. Never describe business owners as uneducated.";
const ROLE_LIST = ROLES.map((r) => `${r.slug} (${r.title})`).join(", ");

const str = { type: "string" };
const strArr = { type: "array", items: str };
const obj = (properties: Record<string, unknown>, required = Object.keys(properties)) => ({ type: "object", properties, required });

const lc = (s: string) => s.toLowerCase();
const uniq = <T,>(a: T[]) => Array.from(new Set(a));
const hits = (text: string, words: string[]) => words.filter((w) => lc(text).includes(lc(w))).length;
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n) + "…" : s);

/** Keeps prompts small: the first turn (it states the need) plus the most recent turns, each trimmed. */
export function trimTurns(turns: ChatTurn[], keepLast = 8, maxChars = 900): ChatTurn[] {
  const kept = turns.length > keepLast + 1 ? [turns[0], ...turns.slice(-keepLast)] : turns;
  return kept.map((t) => ({ role: t.role, text: clip(t.text, maxChars) }));
}

/** Only the CV fields a prompt needs (no contact details, no long summaries). */
function cvBrief(cv: ParsedCv | null) {
  if (!cv) return {};
  return {
    education: cv.education.slice(0, 3).map((e) => e.degree),
    skills: cv.skills.slice(0, 25),
    experience: cv.experience.slice(0, 5).map((e) => clip(`${e.title}${e.org ? ` at ${e.org}` : ""}: ${e.summary}`, 160)),
    interests: cv.interests.slice(0, 8),
  };
}

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

const CvWithQuestion = CvSchema.extend({ first_question: z.string().default("") });

/**
 * AI-1a + the first intake question in ONE call. Text is extracted locally first (decision 44); the file itself is
 * sent only for photos and scans with no readable text.
 */
export async function readCv(input: { bytes?: Uint8Array; mime?: string; text?: string }): Promise<{ cv: ParsedCv; firstQuestion?: string; busy: boolean }> {
  const parts: Part[] = [];
  const hasText = (input.text ?? "").replace(/\s+/g, " ").trim().length > 300;
  if (!hasText && input.bytes && input.mime && geminiCanRead(input.mime)) parts.push({ inline_data: { mime_type: input.mime, data: toBase64(input.bytes) } });
  if (input.text) parts.push({ text: `CV text:\n${input.text.slice(0, 12000)}` });
  if (!parts.length) parts.push({ text: "CV text: (empty)" });
  const { data: ai, busy } = await geminiCall({
    feature: "cv",
    system:
      `You read student CVs for Kadam, where college students solve real problems for small businesses and NGOs. Extract the CV into JSON; keep wording short; leave missing things empty. ` +
      `Also write first_question: the opening question of a short career chat (at most 4 questions in total) — friendly, under 30 words, about the biggest gap in the CV (interests, what they enjoy, or where they want to go). ` +
      `It may ask two closely related things at once. Simple English. ${STYLE}`,
    parts,
    zod: CvWithQuestion,
    jsonSchema: obj({
      name: str,
      education: { type: "array", items: obj({ degree: str, institution: str, year: str }) },
      skills: strArr,
      experience: { type: "array", items: obj({ title: str, org: str, summary: str }) },
      interests: strArr,
      first_question: str,
    }),
    temperature: 0.2,
  });
  if (ai) {
    const { first_question, ...cv } = ai;
    return { cv, firstQuestion: first_question.trim() || undefined, busy: false };
  }
  const text = input.text ?? "";
  return {
    cv: {
      name: "",
      education: [],
      skills: SKILL_LEXICON.filter((s) => new RegExp(`(^|[^a-z])${s.toLowerCase().replace(/[.+]/g, (c) => "[" + c + "]")}($|[^a-z])`).test(lc(text))),
      experience: [],
      interests: ROLES.filter((r) => hits(text, r.keywords) > 0).slice(0, 4).map((r) => r.title),
    },
    busy,
  };
}

export async function parseCv(input: { bytes?: Uint8Array; mime?: string; text?: string }): Promise<ParsedCv> {
  return (await readCv(input)).cv;
}

/* ============================== AI-1c  Student ID reader ============================== */
const StudentIdSchema = z.object({
  college: z.string().default(""),
  course: z.string().default(""),
  year: z.string().default(""),
  looks_like_student_id: z.boolean().default(false),
});
export type StudentIdRead = { college: string; course: string; year: string; looks_like_student_id: boolean };

/**
 * Round 4: reads college, course and year from a student ID photo or PDF, the same way readCv sends files.
 * Never asks for (or returns) the name, ID number, date of birth, address or photo. Returns null on any failure,
 * rate limit or unreadable file; the caller then shows empty fields to fill in.
 */
export async function readStudentId(input: { bytes: Uint8Array; mime: string }): Promise<StudentIdRead | null> {
  if (!geminiCanRead(input.mime)) return null;
  const { data } = await geminiCall({
    feature: "read_id",
    system:
      `You read Indian college student ID cards for Kadam. Return only: college (full institution name with city if printed), ` +
      `course (degree and subject as printed, e.g. "B.Com", "BA English", "B.Tech CSE"), year (study year as printed, e.g. "2nd year", "III Sem", "2023-27"), ` +
      `and looks_like_student_id (true only if this is a student identity card or college document). ` +
      `Ignore and never output the person's name, ID or roll number, date of birth, address, phone, blood group or anything about the photo. ` +
      `Use an empty string for anything you can't read clearly.`,
    parts: [{ inline_data: { mime_type: input.mime, data: toBase64(input.bytes) } }, { text: "Read this card." }],
    zod: StudentIdSchema,
    jsonSchema: obj({ college: str, course: str, year: str, looks_like_student_id: { type: "boolean" } }),
    temperature: 0,
    maxOutputTokens: 1024,
  });
  if (!data) return null;
  return {
    college: data.college.trim().slice(0, 160),
    course: data.course.trim().slice(0, 120),
    year: normaliseYear(data.year),
    looks_like_student_id: data.looks_like_student_id,
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
const IntakeStepSchema = z.object({ done: z.boolean(), question: z.string().default(""), final: z.boolean().default(false), summary: IntakeSummarySchema.optional().nullable() });

export const INTAKE_FALLBACK_QUESTIONS = ["intake.q1", "intake.q2", "intake.q3", "intake.q4"];
/** At most this many intake questions in total (the first comes with the CV reading); after the last answer the profile is built. */
export const MAX_INTAKE_QUESTIONS = 4;

/** Rule-based summary from the chat (used when the AI is unavailable). */
export function heuristicSummary(input: { cv: ParsedCv | null; transcript: ChatTurn[]; jobTexts?: string[]; targetRoles: string[] }): IntakeSummary {
  const answers = input.transcript.filter((t) => t.role === "user").map((t) => t.text);
  const all = answers.join(" ") + " " + (input.jobTexts ?? []).join(" ");
  const named = ROLES.filter((r) => lc(all).includes(lc(r.title))).map((r) => r.title);
  return {
    interests: uniq([...(input.cv?.interests ?? []), ...ROLES.filter((r) => hits(answers[0] ?? "", r.keywords) > 0).map((r) => r.title)]).slice(0, 5),
    current: answers[0] ?? "",
    goal: answers[3] ?? answers[answers.length - 1] ?? "",
    target_roles: uniq([...input.targetRoles, ...named]).slice(0, 4),
  };
}

/**
 * AI-1b: the next intake question. Callers stop calling this once MAX_INTAKE_QUESTIONS answers are in
 * (then finishIntake builds the summary and pathways in one call).
 */
export async function intakeNext(input: {
  cv: ParsedCv | null;
  transcript: ChatTurn[];
  jobTexts: string[];
  targetRoles: string[];
}): Promise<{ done: boolean; question?: string; questionKey?: string; summary?: IntakeSummary; busy?: boolean; final?: boolean }> {
  const userTurns = input.transcript.filter((t) => t.role === "user").length;
  if (userTurns >= MAX_INTAKE_QUESTIONS) return { done: true, summary: heuristicSummary(input) };
  const left = MAX_INTAKE_QUESTIONS - userTurns;
  const { data: ai, busy } = await geminiCall({
    feature: "intake",
    system:
      `You are Kadam's career intake guide for Indian college students from every stream. The whole chat has at most ${MAX_INTAKE_QUESTIONS} questions, so make each count: ` +
      `ask about the biggest remaining gap (interests, what they enjoy, where they are now, where they want to go), and ask two closely related things in one message where natural. ` +
      `Keep it under 35 words. Students may paste job links or name target roles. Never repeat or rephrase a question already asked; if one was skipped, move on. ` +
      `If you already know enough, set done=true and give a summary instead. Set final=true when this question is the last one you need. Simple English. ${STYLE}`,
    parts: [
      {
        text:
          `CV: ${JSON.stringify(cvBrief(input.cv))}\nTarget roles named: ${input.targetRoles.join(", ") || "none"}\n` +
          `Job pages shared (trimmed): ${input.jobTexts.map((t) => t.slice(0, 800)).join("\n---\n") || "none"}\n` +
          `Chat so far: ${JSON.stringify(trimTurns(input.transcript))}\nQuestions left: ${left}.`,
      },
    ],
    zod: IntakeStepSchema,
    jsonSchema: obj({ done: { type: "boolean" }, question: str, final: { type: "boolean" }, summary: obj({ interests: strArr, current: str, goal: str, target_roles: strArr }) }, ["done", "question"]),
    temperature: 0.6,
    maxOutputTokens: 1024,
  });
  if (ai && (ai.done ? ai.summary : ai.question)) {
    return ai.done ? { done: true, summary: ai.summary! } : { done: false, question: ai.question, final: ai.final || left <= 1 };
  }
  if (userTurns < INTAKE_FALLBACK_QUESTIONS.length) return { done: false, questionKey: INTAKE_FALLBACK_QUESTIONS[userTurns], busy };
  return { done: true, summary: heuristicSummary(input), busy };
}

/* ============================== AI-1c  Pathway builder ============================== */
const PathwayItem = z.object({ role: z.string(), slug: z.string().default(""), rationale: z.string() });
export const PathwaysSchema = z.object({ now: z.array(PathwayItem), pivot: z.array(PathwayItem), stretch: z.array(PathwayItem) });
export type Pathways = z.infer<typeof PathwaysSchema>;
const PathwaysWithSummary = PathwaysSchema.extend({ summary: IntakeSummarySchema.optional().nullable() });

/**
 * AI-1c. When `summary` is null (the question limit was reached, or the student pressed "Build my profile now"),
 * the same call also writes the intake summary, so finishing an intake is always exactly one Gemini call.
 */
export async function finishIntake(input: { cv: ParsedCv | null; summary: IntakeSummary | null; transcript: ChatTurn[]; targetRoles: string[] }): Promise<{ summary: IntakeSummary; pathways: Pathways; busy: boolean }> {
  const item = obj({ role: str, slug: str, rationale: str });
  const needSummary = !input.summary;
  const answers = input.transcript.filter((t) => t.role === "user").map((t) => clip(t.text, 600));
  const { data: ai, busy } = await geminiCall({
    feature: "pathways",
    system:
      `You build a career pathway profile for an Indian college student. Return 2 'now' roles they fit today, 2 'pivot' adjacent roles they could move into, ` +
      `and 1-2 'stretch' aspirational roles. Each rationale is one short sentence that points to evidence from the student, written to the student as "you" (e.g. "Your fest sales analysis in pandas shows..."). ` +
      `Prefer these role slugs when they fit: ${ROLE_LIST}. If none fit, make a new short slug.` +
      (needSummary ? ` Also return summary: interests, current (where they are now), goal, target_roles.` : "") +
      ` ${STYLE}`,
    parts: [
      {
        text:
          `CV: ${JSON.stringify(cvBrief(input.cv))}\nTarget roles named: ${input.targetRoles.join(", ") || "none"}\n` +
          (needSummary ? `Questions and answers: ${JSON.stringify(trimTurns(input.transcript, 10, 600))}` : `Intake summary: ${JSON.stringify(input.summary)}\nStudent's answers: ${JSON.stringify(answers)}`),
      },
    ],
    zod: PathwaysWithSummary,
    jsonSchema: obj(
      {
        now: { type: "array", items: item },
        pivot: { type: "array", items: item },
        stretch: { type: "array", items: item },
        ...(needSummary ? { summary: obj({ interests: strArr, current: str, goal: str, target_roles: strArr }) } : {}),
      },
      ["now", "pivot", "stretch", ...(needSummary ? ["summary"] : [])],
    ),
    maxOutputTokens: 2048,
  });
  const fallbackSummary = () => input.summary ?? heuristicSummary({ cv: input.cv, transcript: input.transcript, targetRoles: input.targetRoles });
  if (ai) {
    const fix = (a: Pathways["now"]) => a.map((p) => ({ ...p, slug: p.slug ? slugify(p.slug) : slugify(p.role) }));
    const summary = input.summary ?? (ai.summary ? { ...ai.summary, target_roles: uniq([...input.targetRoles, ...ai.summary.target_roles]).slice(0, 6) } : fallbackSummary());
    return { summary, pathways: { now: fix(ai.now), pivot: fix(ai.pivot), stretch: fix(ai.stretch) }, busy: false };
  }
  const summary = fallbackSummary();
  return { summary, pathways: heuristicPathways({ cv: input.cv, summary, transcript: input.transcript }), busy };
}

export async function buildPathways(input: { cv: ParsedCv | null; summary: IntakeSummary | null; transcript: ChatTurn[] }): Promise<Pathways> {
  return (await finishIntake({ ...input, targetRoles: input.summary?.target_roles ?? [] })).pathways;
}

function heuristicPathways(input: { cv: ParsedCv | null; summary: IntakeSummary | null; transcript: ChatTurn[] }): Pathways {
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
// Only for roles/skills without a hand-written roadmap; src/lib/roadmaps.ts stores the result permanently.
const ResSchema = z.object({ title: z.string(), url: z.string(), type: z.enum(["article", "video", "course", "docs", "tool"]).catch("article") });
const LEVELS = ["recommended", "optional", "alternative"] as const;
const SubSchema = z.object({ title: z.string(), description: z.string(), level: z.enum(LEVELS).catch("recommended").default("recommended") });
const TopicSchema = z.object({
  title: z.string(),
  description: z.string(),
  skills: z.array(z.string()).default([]),
  resources: z.array(ResSchema).default([]),
  level: z.enum(LEVELS).catch("recommended").default("recommended"),
  why: z.string().default(""),
  time: z.string().default(""),
  practice: z.string().default(""),
  problemTypes: z.array(z.string()).default([]),
  subtopics: z.array(SubSchema).default([]),
});
const IntroSchema = z.object({ does: z.string(), firstJobs: z.array(z.string()).default([]), kadam: z.string() });
const RoadmapGen = z.object({
  summary: z.string(),
  intro: IntroSchema.optional().nullable(),
  sections: z.array(z.object({ title: z.string(), topics: z.array(TopicSchema).min(1).max(6) })).min(2).max(5),
});

/** Catalogue stub for a role/skill. `sections` (key topics already grouped) and `optional` (nice-to-have topic names) are used when present. */
export type RoadmapHint = {
  title: string;
  blurb: string;
  topics: string[];
  kind: "role" | "skill";
  group: string;
  sections?: { title: string; topics: string[] }[];
  optional?: string[];
  level?: string;
};

/** Richer catalogue fields (sections / optional / level), read defensively so the stub shape can grow without breaking this. */
function catalogExtras(role: string): Pick<RoadmapHint, "sections" | "optional" | "level"> {
  const c = catalogItem(role) as unknown as Record<string, unknown> | undefined;
  if (!c) return {};
  const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
  const sections = Array.isArray(c.sections)
    ? (c.sections as unknown[]).flatMap((s) => {
        const o = s as { title?: unknown; topics?: unknown };
        const topics = isStrArr(o?.topics) ? o.topics : Array.isArray(o?.topics) ? (o.topics as { title?: unknown }[]).map((x) => (typeof x?.title === "string" ? x.title : "")).filter(Boolean) : [];
        return typeof o?.title === "string" && topics.length ? [{ title: o.title, topics }] : [];
      })
    : undefined;
  return { sections: sections?.length ? sections : undefined, optional: isStrArr(c.optional) ? c.optional : undefined, level: typeof c.level === "string" ? c.level : undefined };
}

export async function generateRoadmap(role: string, baseHint?: RoadmapHint): Promise<{ title: string; summary: string; sections: Section[]; intro?: RoadmapIntro; source: string; busy?: boolean }> {
  const extras = catalogExtras(role);
  const hint: RoadmapHint | undefined = baseHint && { ...baseHint, sections: baseHint.sections ?? extras.sections, optional: baseHint.optional ?? extras.optional, level: baseHint.level ?? extras.level };
  const title = hint?.title ?? roleTitle(role);
  const res = obj({ title: str, url: str, type: { type: "string", enum: ["article", "video", "course", "docs", "tool"] } });
  const level = { type: "string", enum: [...LEVELS] };
  const outline = hint?.sections?.length
    ? `Use these sections and topics, in order: ${hint.sections.map((s) => `${s.title}: ${s.topics.join(", ")}`).join(" | ")}`
    : hint?.topics.length ? `Key areas to cover, in order: ${hint.topics.join(", ")}` : "";
  const { data: ai, busy } = await geminiCall({
    feature: "roadmap",
    system:
      `You write roadmap.sh-style learning roadmaps for Indian college students (original content). 3-4 sections in learning order, 2-5 topics each. ` +
      `Per topic: description (1-2 sentences), skills (keywords), resources (1-2 free, well-known pages with real https URLs, else omit), level (recommended|optional|alternative), ` +
      `why (one sentence on why it matters for the role), time (e.g. "1 week"), practice (one small task), problemTypes (from: ${PROBLEM_TYPES.join(", ")}), subtopics (0-3: title, one sentence, level). ` +
      `intro: does (2 sentences on what the work is), firstJobs (2-4 typical first jobs in India), kadam (one sentence on how solving real problems for small businesses on Kadam helps). ` +
      `The last section ends with a topic about solving a real problem for a small business on Kadam. ${STYLE}`,
    parts: [{ text: `${hint?.kind === "skill" ? "Skill" : "Role"}: ${title}${hint?.blurb ? `\nAbout: ${hint.blurb}` : ""}${outline ? `\n${outline}` : ""}${hint?.optional?.length ? `\nMark as optional: ${hint.optional.join(", ")}` : ""}` }],
    zod: RoadmapGen,
    jsonSchema: obj(
      {
        summary: str,
        intro: obj({ does: str, firstJobs: strArr, kadam: str }),
        sections: {
          type: "array",
          items: obj({
            title: str,
            topics: {
              type: "array",
              items: obj(
                { title: str, description: str, skills: strArr, resources: { type: "array", items: res }, level, why: str, time: str, practice: str, problemTypes: strArr, subtopics: { type: "array", items: obj({ title: str, description: str, level }) } },
                ["title", "description", "skills", "level"],
              ),
            },
          }),
        },
      },
      ["summary", "sections"],
    ),
  });
  const prefix = role.slice(0, 12);
  const types = new Set<string>(PROBLEM_TYPES);
  const toTopic = (tp: z.infer<typeof TopicSchema>, si: number, ti: number): Topic => {
    const id = `${prefix}-${si + 1}-${ti + 1}`;
    return {
      id,
      title: tp.title,
      description: tp.description,
      skills: tp.skills,
      resources: tp.resources.filter((r) => /^https:\/\//.test(r.url)).slice(0, 4),
      ...(tp.level !== "recommended" ? { level: tp.level, ...(tp.level === "optional" ? { optional: true } : {}) } : {}),
      ...(tp.why ? { why: tp.why } : {}),
      ...(tp.time ? { time: tp.time } : {}),
      ...(tp.practice ? { practice: tp.practice } : {}),
      ...(tp.problemTypes.some((x) => types.has(x)) ? { problemTypes: tp.problemTypes.filter((x) => types.has(x)) } : {}),
      children: tp.subtopics.map((c, ci) => ({
        id: `${id}-${ci + 1}`, title: c.title, description: c.description, skills: [], resources: [],
        ...(c.level !== "recommended" ? { level: c.level, ...(c.level === "optional" ? { optional: true } : {}) } : {}),
      })),
    };
  };
  if (ai) {
    const intro: RoadmapIntro | undefined = ai.intro ? { does: ai.intro.does, firstJobs: ai.intro.firstJobs.slice(0, 4), kadam: ai.intro.kadam } : undefined;
    return { title, summary: ai.summary, ...(intro ? { intro } : {}), sections: ai.sections.map((sec, si) => ({ title: sec.title, topics: sec.topics.map((tp, ti) => toTopic(tp, si, ti)) })), source: "ai" };
  }
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
      ...(hint.optional?.includes(name) ? { optional: true, level: "optional" as const } : {}),
    });
    const prove = (si: number): Section => ({ title: "Prove it", topics: [
      { id: `${prefix}-${si + 1}-1`, title: "Solve a real problem", description: `Take up a Kadam problem that needs ${title} and deliver it for a real business or NGO.`, skills: [], resources: [] },
      { id: `${prefix}-${si + 1}-2`, title: "Show your impact", description: "Share your impact report and resume bullets with recruiters.", skills: [], resources: [] },
    ] });
    // The catalogue already groups the topics: keep its sections.
    if (hint.sections?.length) {
      const secs = hint.sections.slice(0, 5).map((s, si) => ({ title: s.title, topics: s.topics.map((n, ti) => mk(n, si, ti)) }));
      return { title, summary: hint.blurb, source: "template", busy, sections: [...secs, prove(secs.length)] };
    }
    return {
      title,
      summary: hint.blurb,
      source: "template",
      busy,
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
    busy,
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

/** `ai` = the answer came from Gemini (cache it for good); otherwise it is the rule-based list (busy = because of a rate limit). */
export async function skillGapsEx(input: { studentSkills: string[]; problem: { title: string; problem: string; desired_outcome: string; skills: string[] } }): Promise<{ gaps: Gap[]; ai: boolean; busy: boolean }> {
  const { data: ai, busy } = await geminiCall({
    feature: "gaps",
    system: `List up to 5 skills this student should brush up before working on the problem. Only list skills they do not clearly have. 'why' is one short sentence tied to the problem. ${STYLE}`,
    parts: [{ text: `Student skills: ${input.studentSkills.slice(0, 30).join(", ") || "unknown"}\nProblem: ${JSON.stringify({ title: input.problem.title, problem: clip(input.problem.problem ?? "", 700), desired_outcome: clip(input.problem.desired_outcome ?? "", 400), skills: input.problem.skills })}` }],
    zod: GapSchema,
    jsonSchema: obj({ gaps: { type: "array", items: obj({ skill: str, why: str }) } }),
    maxOutputTokens: 1024,
  });
  if (ai) return { gaps: ai.gaps, ai: true, busy: false };
  const have = input.studentSkills.map(lc);
  const gaps = input.problem.skills
    .filter((s) => !have.some((h) => h.includes(lc(s)) || lc(s).includes(h)))
    .slice(0, 5)
    .map((s) => ({ skill: s, why: `This problem needs ${s}.` }));
  return { gaps, ai: false, busy };
}

export async function skillGaps(input: Parameters<typeof skillGapsEx>[0]): Promise<Gap[]> {
  return (await skillGapsEx(input)).gaps;
}

/* ============================== AI-3  Matcher ============================== */
const MatchSchema = z.object({ ranked: z.array(z.object({ id: z.string(), score: z.number(), reason: z.string(), tier: z.string().optional(), role: z.string().optional() })) });
export type Match = { id: string; score: number; reason: string };
type MatchProblem = { id: string; title: string; categories: Categories; business: string };

export async function matchProblemsEx(input: { pathways: Pathways; skills: string[]; interests: string[]; problems: MatchProblem[] }): Promise<{ ranked: Match[]; ai: boolean; busy: boolean }> {
  const roles = (k: keyof Pathways) => input.pathways[k].map((p) => p.slug || p.role).join(", ");
  const { data: ai, busy } = await geminiCall({
    feature: "match",
    system: `Rank live problems by fit with the student's approved career pathways and skills. Return every problem id with a 0-100 score, a one-line reason addressed to the student ("Builds on your..."), the pathway tier it fits best ("now", "pivot", "stretch" or "none") and that pathway's role title (e.g. "Data Analyst"). ${STYLE}`,
    parts: [
      { text: `Pathways — now: ${roles("now")}; pivot: ${roles("pivot")}; stretch: ${roles("stretch")}\nSkills: ${input.skills.slice(0, 30).join(", ")}\nInterests: ${input.interests.slice(0, 8).join(", ")}` },
      { text: `Problems: ${JSON.stringify(input.problems.slice(0, 60).map((p) => ({ id: p.id, title: p.title, type: p.categories?.problem_type, skills: p.categories?.skills, roles: p.categories?.related_roles })))}` },
    ],
    zod: MatchSchema,
    jsonSchema: obj({ ranked: { type: "array", items: obj({ id: str, score: { type: "number" }, reason: str, tier: { type: "string", enum: ["now", "pivot", "stretch", "none"] }, role: str }) } }),
    temperature: 0.2,
  });
  const valid = new Set(input.problems.map((p) => p.id));
  if (ai) {
    // "ai|tier|role|sentence" lets the UI show the path chip and the role as a highlighted pill (see lib/reason.ts).
    const r = ai.ranked.filter((m) => valid.has(m.id)).map((m) => ({
      id: m.id,
      score: m.score,
      reason: m.tier && m.tier !== "none" && m.role ? `ai|${m.tier}|${m.role.replaceAll("|", "/")}|${m.reason.replaceAll("|", "/")}` : m.reason,
    }));
    if (r.length) {
      // Problems the model left out still appear, ranked by rules.
      const seen = new Set(r.map((m) => m.id));
      const rest = heuristicMatch({ ...input, problems: input.problems.filter((p) => !seen.has(p.id)) });
      return { ranked: [...r, ...rest].sort((a, b) => b.score - a.score), ai: true, busy: false };
    }
  }
  return { ranked: heuristicMatch(input), ai: false, busy };
}

export async function matchProblems(input: Parameters<typeof matchProblemsEx>[0]): Promise<Match[]> {
  return (await matchProblemsEx(input)).ranked;
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
// Words that show the owner has given a timeline (English and the six Indian UI languages).
const TIMELINE_HINT = /(d+s*(day|days|week|weeks|month|months)|this week|next week|this month|next month|asap|urgent|by w+)|हफ़्त|हफ्त|सप्ताह|महीने में|महीने तक|दिन में|दिनों में|तक चाहिए|जल्दी|ವಾರ|ತಿಂಗಳ|ದಿನಗಳಲ್ಲಿ|வாரத்|மாதத்|நாட்களில்|ସପ୍ତାହ|ମାସ ଭିତରେ|ଦିନ ଭିତରେ|সপ্তাহ|মাসের মধ্যে|দিনের মধ্যে|અઠવાડિય|મહિનામાં|દિવસમાં/i;

export const PROBLEM_FIELDS = ["problem", "background", "current_process", "desired_outcome", "constraints", "expected_timeline", "resources_provided"] as const;
export type ProblemField = (typeof PROBLEM_FIELDS)[number];
const IntakeQ = z.object({ done: z.boolean(), question: z.string().default(""), final: z.boolean().default(false), missing: z.array(z.string()).default([]) });
/** At most this many AI follow-up questions; after that the draft is written from what is known. */
export const MAX_PROBLEM_FOLLOWUPS = 4;

/**
 * AI-4a. `fileParts` should be passed only on the first call (the model reads the file once and its question shows it understood);
 * later turns say a file was attached. The draft call gets the file again.
 */
export async function problemIntakeNext(input: { transcript: ChatTurn[]; lang: string; business: { name: string; sector: string; city: string }; fileParts: Part[]; hasFile?: boolean; ruleBasedTurns?: number; lastQuestionFinal?: boolean; timelineAsked?: boolean }) {
  const userTurns = input.transcript.filter((t) => t.role === "user").length;
  const asked = userTurns - 1;
  // The timeline is required before drafting. If it hasn't come up in the follow-up answers (the first message
  // describes the problem, so it is not counted), Kadam asks it itself as the last question: no extra AI call.
  const followUps = input.transcript.filter((t) => t.role === "user").slice(1).map((t) => t.text).join(" ");
  const timelineKnown = input.timelineAsked || TIMELINE_HINT.test(followUps);
  const askTimeline = { done: false as const, question: undefined, questionKey: "pintake.expected_timeline", final: true, busy: false };
  if (input.lastQuestionFinal && !timelineKnown && hasGemini()) return askTimeline;
  // Hard stop: the first message + MAX follow-up answers is enough to draft (the owner can edit everything on the review page).
  if ((asked >= MAX_PROBLEM_FOLLOWUPS || input.lastQuestionFinal) && !input.ruleBasedTurns && hasGemini()) return { done: true as const };
  const ask = () =>
    geminiCall({
      feature: "pintake",
      system:
        `You help a small business owner in India describe a problem so that a college student can solve it. The owner may be a first-time digital user. ` +
        `FIRST read everything they have written (and any attached file) and work out what they actually want built or fixed. ` +
        `Each reply must be ONE short, warm message in ${LANG_NAME[input.lang] ?? "English"} that (a) briefly shows you understood their latest message in a few words, ` +
        `and (b) asks the most useful next question about THEIR specific request — where natural, ask two closely related things together (e.g. how it is done today and what a good result looks like). ` +
        `Never ask a generic question unrelated to what they said, never repeat a question, and never assume details they did not give (the business profile is only background). ` +
        `If they are annoyed or repeat themselves, apologise in a few words and act on what they said. ` +
        `Required before done: what the problem or product is, how it is handled today, what a good result looks like, and the timeline. Nice to have: constraints (budget, phone/language) and what they can share. ` +
        `Set done=true AS SOON AS every required item is known (it is fine to stop before the limit). You have at most ${MAX_PROBLEM_FOLLOWUPS - asked} question(s) left. Set final=true when the answer to this question will complete every required item. ${STYLE}`,
      parts: [
        { text: `Business profile (background only): ${JSON.stringify(input.business)}${input.hasFile && !input.fileParts.length ? "\nThe owner attached a file earlier (already read)." : ""}\nConversation so far: ${JSON.stringify(trimTurns(input.transcript, 10, 1200))}` },
        ...input.fileParts,
      ],
      zod: IntakeQ,
      jsonSchema: obj({ done: { type: "boolean" }, question: str, final: { type: "boolean" }, missing: strArr }, ["done", "question"]),
      temperature: 0.5,
      maxOutputTokens: 1024,
    });
  // One retry so a single bad answer does not drop the owner into the fixed question list
  // (not after a rate limit: geminiCall has already waited and retried once).
  let r = await ask();
  if (!r.data && !r.busy && hasGemini()) r = await ask();
  const ai = r.data;
  if (ai?.done && !timelineKnown) return askTimeline;
  if (ai && (ai.done || ai.question)) return ai.done ? { done: true as const } : { done: false as const, question: ai.question, final: ai.final || asked + 1 >= MAX_PROBLEM_FOLLOWUPS };
  // Rule-based: ask for each field in turn. The first user turn is the problem itself.
  const next = PROBLEM_FIELDS[userTurns];
  if (!next) return { done: true as const, busy: r.busy };
  return { done: false as const, questionKey: `pintake.${next}`, busy: r.busy };
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
  const { data: ai } = await geminiCall({
    feature: "draft",
    system:
      `Turn this conversation with a small business owner into a clear problem statement for college students. Write every field in simple English ` +
      `(translate if the owner wrote in another Indian language). Keep each field to 1-3 sentences. Title under 70 characters, action-oriented. ` +
      `Then categorise. sector one of: ${SECTORS.join(", ")}. problem_type one of: ${PROBLEM_TYPES.join(", ")}. difficulty one of: ${DIFFICULTIES.join(", ")}. ` +
      `time_needed one of: lt1w (under 1 week), w1_4 (1-4 weeks), m1_2 (1-2 months). ` +
      `work_mode one of: ${WORK_MODES.join(", ")}. skills: 3-5 short free tags. related_roles: 2-3 slugs from: ${ROLE_LIST}. ${STYLE}`,
    parts: [{ text: `Business: ${JSON.stringify(input.business)}\nConversation: ${JSON.stringify(trimTurns(input.transcript, 12, 1500))}` }, ...input.fileParts],
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
  return (await impactReportEx(input)).report;
}

/** `ai` = written by Gemini; otherwise the template report built from the real data (busy = because of a rate limit). */
export async function impactReportEx(input: ReportInput): Promise<{ report: Report; ai: boolean; busy: boolean }> {
  // Only what the report needs, trimmed; dates as YYYY-MM-DD.
  const brief = {
    student: input.student,
    business: input.business,
    problem: { ...input.problem, problem: clip(input.problem.problem ?? "", 600), desired_outcome: clip(input.problem.desired_outcome ?? "", 300) },
    submission: input.submission ? { description: clip(input.submission.description, 1200), date: input.submission.submitted_at.slice(0, 10) } : null,
    statuses: input.statuses.map((x) => ({ status: x.status, reason: x.reason ? clip(x.reason, 200) : null, date: x.created_at.slice(0, 10) })),
    updates: input.updates.slice(-8).map((u) => ({ what_changed: clip(u.what_changed, 400), metrics: u.metrics, comments: u.comments ? clip(u.comments, 300) : null, date: u.created_at.slice(0, 10) })),
    feedback: input.feedback.slice(-5).map((f) => ({ text: clip(f.text, 300), date: f.created_at.slice(0, 10) })),
    started: input.startedAt.slice(0, 10),
  };
  const { data: ai, busy } = await geminiCall({
    feature: "report",
    system:
      `Write an impact report for a college student's real-world project with an Indian small business or NGO. Be factual: use only the evidence given, ` +
      `never invent numbers. summary: 2-3 sentences. outcomes: measurable results as label/value pairs (use the business's numbers). ` +
      `skills_demonstrated: 3-6 skills the student actually used, judged from the submission and results (not the problem's wish list). ` +
      `timeline: dated events (YYYY-MM-DD). resume_bullets: 3-4 strong bullets starting with a verb, with numbers where available. ${STYLE}`,
    parts: [{ text: JSON.stringify(brief) }],
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
  if (ai) return { report: ai, ai: true, busy: false };
  return { report: templateReport(input), ai: false, busy };
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

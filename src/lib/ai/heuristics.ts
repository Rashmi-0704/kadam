// Rule-based problem drafting used when Gemini is not available. Pure functions (no server imports) so they can be tested directly.
import { SECTORS, type Categories } from "../../db/taxonomy.ts";

const lc = (s: string) => s.toLowerCase();
const uniq = <T,>(a: T[]) => Array.from(new Set(a));
const hits = (text: string, words: string[]) => words.filter((w) => lc(text).includes(lc(w))).length;

/** Title from the sentence that states the need, not the one that describes the business. */
export function pickTitle(problem: string) {
  const sentences = problem.split(/(?<=[.!?।])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
  const need = /\b(want|need|wish|trying|unable|can't|cannot|don't know|do not know|struggle|problem|help|how to)\b|चाहते|चाहिए|नहीं|गड़बड़|समस्या|परेशानी|मुश्किल/i;
  let s = sentences.find((x) => need.test(x)) ?? sentences[0] ?? problem;
  s = s.replace(/^(but|and|so|however)\s+/i, "").replace(/^(we|i)\s+(want|need|would like)\s+to\s+/i, "").replace(/[.।]+$/, "").trim();
  // "Start selling online but do not know how to take photos" → keep the goal, drop the "but …" tail when it makes the title long.
  if (s.length > 60) s = s.replace(/,?\s+(but|and|though|because)\s+.*$/i, "").trim() || s;
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return s.length > 72 ? s.slice(0, 69).replace(/\s+\S*$/, "") + "…" : s;
}

const TYPE_RULES: [string, string[], string[], string[]][] = [
  // Keywords are stems ("stor" = story/stories, "sell" = sell/selling) so each idea counts once.
  ["tech_build", ["app", "software", "website", "web site", "system", "automat", "notebook", "register", "record", "digital", "form", "ऐप", "वेबसाइट", "सॉफ्टवेयर", "कॉपी", "रिकॉर्ड", "फोन पर", "याद दिला"], ["Google Sheets", "App design", "WhatsApp"], ["software-developer", "data-analyst", "frontend-developer"]],
  ["marketing", ["customer", "sales", "sell", "marketing", "instagram", "facebook", "whatsapp", "online", "promot", "grow", "reach", "order", "brand", "ग्राहक", "बिक्री", "बेच", "प्रचार", "ऑनलाइन", "ऑर्डर"], ["Instagram", "Canva", "WhatsApp Business"], ["digital-marketer", "social-media-manager", "sales-executive"]],
  ["data", ["data", "report", "forecast", "dashboard", "track", "analys", "analyz", "numbers", "डेटा", "रिपोर्ट", "आंकड़े"], ["Excel", "Google Sheets", "Data analysis"], ["data-analyst", "operations-analyst"]],
  ["finance", ["cost", "price", "pricing", "profit", "loss", "account", "gst", "loan", "credit", "udhaar", "budget", "fee", "payment", "खर्च", "दाम", "कीमत", "मुनाफ", "पैस", "उधार", "हिसाब", "फीस"], ["Excel", "Costing", "Accounting"], ["financial-analyst", "accountant"]],
  ["operations", ["stock", "inventory", "deliver", "process", "staff", "supplier", "wast", "स्टॉक", "सामान", "डिलीवरी", "माल"], ["Process mapping", "Google Sheets", "Inventory planning"], ["operations-analyst", "supply-chain-analyst", "business-analyst"]],
  ["design_ux", ["design", "photo", "logo", "poster", "label", "packag", "डिज़ाइन", "फोटो", "पैकिंग"], ["Canva", "Photography", "Figma"], ["graphic-designer", "ux-designer"]],
  ["content", ["writ", "stor", "content", "video", "newsletter", "email", "blog", "लिख", "कहानी", "वीडियो"], ["Writing", "Storytelling", "Video editing"], ["content-writer", "video-editor", "journalist"]],
  ["research", ["research", "survey", "why", "study", "understand", "interview", "सर्वे", "क्यों", "पता करना"], ["Research design", "Interviewing", "Report writing"], ["research-analyst", "business-analyst"]],
];

export function heuristicCategories(focus: string, context: string, timeline: string, business: { sector: string; city: string }): Categories {
  const scored = TYPE_RULES.map(([type, words, skills, roles]) => ({ type, skills, roles, n: hits(focus, words) * 2 + hits(context, words) }))
    .sort((a, b) => b.n - a.n);
  const best = scored[0].n > 0 ? scored[0] : scored.find((s) => s.type === "operations")!;
  // A second strong area (e.g. marketing + design) adds its roles and skills too.
  const second = scored.find((s) => s !== best && s.n >= Math.max(2, best.n / 3));
  const roles = uniq([best.roles[0], second?.roles[0], best.roles[1], second?.roles[1], best.roles[2]].filter(Boolean) as string[]).slice(0, 3);
  const skills = uniq([...best.skills, ...(second?.skills ?? [])]).slice(0, 5);
  const words = (focus + " " + context).split(/\s+/).length;
  return {
    sector: (SECTORS as readonly string[]).includes(business.sector) ? business.sector : "other",
    problem_type: best.type,
    skills,
    difficulty: second || words > 160 ? "intermediate" : "beginner",
    time_needed: timeNeeded(timeline),
    work_mode: /visit|on-site|onsite|come to|shop|दुकान पर|आकर/i.test(context) ? "hybrid" : "remote",
    city: business.city,
    related_roles: roles,
  };
}

function timeNeeded(t: string): string {
  const s = lc(t);
  const n = parseInt(s.replace(/[^\d]/g, "").slice(0, 2)) || 0;
  if (/day|दिन|दिवस/.test(s)) return "lt1w";
  if (/month|महीने|महीना|मास/.test(s)) return n >= 1 && n <= 2 ? "m1_2" : "m1_2";
  if (/week|हफ्त|सप्ताह/.test(s)) return n <= 1 ? "lt1w" : n <= 4 ? "w1_4" : "m1_2";
  return "w1_4";
}


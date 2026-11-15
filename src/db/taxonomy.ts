// Category values are stable slugs. Labels live in the i18n dictionaries.
export const SECTORS = ["retail", "food", "education", "healthcare", "ngo", "manufacturing", "services", "tech", "other"] as const;
export const PROBLEM_TYPES = ["tech_build", "design_ux", "marketing", "content", "data", "operations", "finance", "research"] as const;
export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export const TIME_NEEDED = ["lt1w", "w1_4", "m1_2"] as const;
export const WORK_MODES = ["remote", "onsite", "hybrid"] as const;
export const BUSINESS_TYPES = ["kirana", "msme", "startup", "ngo", "shop", "service", "other"] as const;

export type Categories = {
  sector: string;
  problem_type: string;
  skills: string[];
  difficulty: string;
  time_needed: string;
  work_mode: string;
  city: string;
  related_roles: string[];
};

// Career roles used for pathways, matching and roadmaps.
export const ROLES: { slug: string; title: string; keywords: string[] }[] = [
  { slug: "data-analyst", title: "Data Analyst", keywords: ["excel", "sql", "python", "data", "dashboard", "analytics", "statistics", "power bi", "forecast", "report", "डेटा", "हिसाब"] },
  { slug: "software-developer", title: "Software Developer", keywords: ["java", "python", "c++", "app", "software", "backend", "api", "database", "ऐप", "सॉफ्टवेयर"] },
  { slug: "frontend-developer", title: "Frontend Developer", keywords: ["html", "css", "javascript", "react", "website", "web", "frontend", "वेबसाइट"] },
  { slug: "ux-designer", title: "UX Designer", keywords: ["figma", "ux", "ui", "design", "user research", "wireframe", "prototype", "usability"] },
  { slug: "graphic-designer", title: "Graphic Designer", keywords: ["canva", "photoshop", "illustrator", "poster", "photo", "visual", "branding", "logo", "फोटो"] },
  { slug: "digital-marketer", title: "Digital Marketer", keywords: ["marketing", "seo", "ads", "instagram", "whatsapp", "growth", "campaign", "customers", "sales", "ग्राहक", "बिक्री", "मार्केटिंग"] },
  { slug: "social-media-manager", title: "Social Media Manager", keywords: ["instagram", "social media", "reels", "content calendar", "facebook", "youtube"] },
  { slug: "content-writer", title: "Content Writer", keywords: ["writing", "blog", "content", "copy", "story", "stories", "editing", "लेख"] },
  { slug: "journalist", title: "Journalist", keywords: ["journalism", "reporting", "news", "interview", "story", "media", "fact-check"] },
  { slug: "business-analyst", title: "Business Analyst", keywords: ["process", "requirements", "business analysis", "workflow", "stakeholder", "excel", "operations"] },
  { slug: "operations-analyst", title: "Operations Analyst", keywords: ["operations", "process", "inventory", "supply", "logistics", "stock", "स्टॉक", "सामान"] },
  { slug: "financial-analyst", title: "Financial Analyst", keywords: ["finance", "accounting", "costing", "budget", "tally", "gst", "profit", "खर्च", "पैसे", "उधार"] },
  { slug: "accountant", title: "Accountant", keywords: ["tally", "accounts", "bookkeeping", "gst", "ledger", "invoice", "बही", "खाता"] },
  { slug: "product-manager", title: "Product Manager", keywords: ["product", "roadmap", "user needs", "strategy", "prioritise", "launch"] },
  { slug: "research-analyst", title: "Research Analyst", keywords: ["research", "survey", "interviews", "field study", "report", "policy"] },
  { slug: "ngo-program-coordinator", title: "NGO Programme Coordinator", keywords: ["ngo", "community", "volunteer", "programme", "impact", "donor", "social"] },
];

export function roleTitle(slug: string): string {
  return ROLES.find((r) => r.slug === slug)?.title ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const ACADEMIC_DOMAIN_SUFFIXES = [".edu", ".ac.in", ".edu.in", ".ac.uk", ".edu.au", ".res.in"];
// Indian institutions whose student mail does not end in an academic suffix.
export const ACADEMIC_DOMAIN_ALLOWLIST = [
  "iitb.ac.in", "christuniversity.in", "srmist.edu.in", "vit.ac.in", "kiit.ac.in", "manipal.edu",
  "nmims.edu", "amity.edu", "lpu.in", "bits-pilani.ac.in", "learner.manipal.edu", "student.nitw.ac.in",
];

export function isAcademicEmail(email: string): boolean {
  const domain = email.toLowerCase().split("@")[1] ?? "";
  if (!domain) return false;
  if (ACADEMIC_DOMAIN_ALLOWLIST.some((d) => domain === d || domain.endsWith("." + d))) return true;
  return ACADEMIC_DOMAIN_SUFFIXES.some((s) => domain.endsWith(s));
}

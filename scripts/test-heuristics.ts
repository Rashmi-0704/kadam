// Run: node scripts/test-heuristics.ts — checks the offline problem categoriser on realistic inputs.
import { pickTitle, heuristicCategories } from "../src/lib/ai/heuristics.ts";

type Case = { name: string; problem: string; outcome: string; context: string; timeline: string; sector: string; expectType: string[]; expectRole: string[] };
const cases: Case[] = [
  {
    name: "Pickles online (English)",
    problem: "We make pickles and papad at home and sell to 12 shops in Cuttack. We want to start selling online on Instagram and WhatsApp but do not know how to take good photos or set prices for delivery.",
    outcome: "50 online orders a month and a clear price list with delivery.",
    context: "Family business, 6 women from our lane, 15 types of pickle. Shops order by phone every week, we deliver on a scooter.",
    timeline: "1 month", sector: "food",
    expectType: ["marketing"], expectRole: ["digital-marketer", "social-media-manager", "graphic-designer"],
  },
  {
    name: "Kirana credit book (Hindi)",
    problem: "हमारी किराना दुकान में ग्राहकों का उधार कॉपी में लिखते हैं। महीने के अंत में हिसाब गड़बड़ हो जाता है और पैसे वापस नहीं आते।",
    outcome: "हर उधार फोन पर 10 सेकंड में लिख सकें और महीने के अंत में ग्राहक को WhatsApp पर याद दिलाएँ।",
    context: "हम राशन और रोज़ का सामान बेचते हैं। उधार एक कॉपी में लिखते हैं।",
    timeline: "2 हफ्ते में", sector: "retail",
    expectType: ["tech_build", "finance"], expectRole: ["software-developer", "data-analyst", "accountant", "financial-analyst"],
  },
  {
    name: "Coaching centre fees",
    problem: "Parents pay fees late and our office calls each one. Records in the register never match the cash.",
    outcome: "A simple reminder routine and records that match.",
    context: "Coaching classes for 220 students in Pune.",
    timeline: "1 week", sector: "education",
    expectType: ["finance", "tech_build", "operations"], expectRole: ["accountant", "software-developer", "operations-analyst", "financial-analyst"],
  },
  {
    name: "NGO donor stories",
    problem: "Donors stop giving because they never hear stories from our centres. We need short stories and a monthly email.",
    outcome: "Five true stories with photos and a newsletter template.",
    context: "NGO running learning centres near Kolkata.",
    timeline: "3 weeks", sector: "ngo",
    expectType: ["content"], expectRole: ["content-writer", "journalist", "video-editor"],
  },
];

let fail = 0;
for (const c of cases) {
  const cat = heuristicCategories(`${c.problem} ${c.outcome}`, c.context, c.timeline, { sector: c.sector, city: "X" });
  const title = pickTitle(c.problem);
  const typeOk = c.expectType.includes(cat.problem_type);
  const roleOk = cat.related_roles.some((r) => c.expectRole.includes(r));
  if (!typeOk || !roleOk) fail++;
  console.log(`${typeOk && roleOk ? "PASS" : "FAIL"}  ${c.name}\n   title: ${title}\n   type: ${cat.problem_type} | roles: ${cat.related_roles.join(", ")} | skills: ${cat.skills.join(", ")} | time: ${cat.time_needed} | ${cat.difficulty} | ${cat.work_mode}`);
}
process.exit(fail ? 1 : 0);

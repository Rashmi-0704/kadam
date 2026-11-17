// Demo seed. No imports beyond sibling data files so it can run from Node scripts too.
import { SEEDED_ROADMAPS } from "./roadmaps-data.ts";

type Q = (text: string, params?: unknown[]) => Promise<unknown[]>;
type Put = (path: string, bytes: Uint8Array, contentType: string) => Promise<void>;

export const IDS = {
  admin: "00000000-0000-4000-8000-000000000001",
  ananya: "00000000-0000-4000-8000-000000000101",
  rohan: "00000000-0000-4000-8000-000000000102",
  meera: "00000000-0000-4000-8000-000000000103",
  sharma: "00000000-0000-4000-8000-000000000201",
  annapurna: "00000000-0000-4000-8000-000000000202",
  pragati: "00000000-0000-4000-8000-000000000203",
  kalakriti: "00000000-0000-4000-8000-000000000204",
  brightpath: "00000000-0000-4000-8000-000000000205",
  engInUse: "00000000-0000-4000-8000-000000000401",
  engSubmitted: "00000000-0000-4000-8000-000000000402",
};
const P = (n: number) => `00000000-0000-4000-8000-0000000003${String(n).padStart(2, "0")}`;

export const DEMO_ACCOUNTS = [
  { id: IDS.ananya, role: "student", label: "Ananya Das", note: "B.Tech CSE · new profile" },
  { id: IDS.rohan, role: "student", label: "Rohan Mehta", note: "B.Com · solution in use" },
  { id: IDS.meera, role: "student", label: "Meera Pillai", note: "BA Journalism · ID check pending" },
  { id: IDS.sharma, role: "business", label: "Sharma Kirana Store", note: "Bhubaneswar · kirana" },
  { id: IDS.annapurna, role: "business", label: "Annapurna Tiffin Services", note: "Bengaluru · food" },
  { id: IDS.pragati, role: "business", label: "Pragati Foundation", note: "Kolkata · NGO" },
  { id: IDS.kalakriti, role: "business", label: "Kalakriti Handloom", note: "Ahmedabad · handloom" },
  { id: IDS.brightpath, role: "business", label: "BrightPath Tutorials", note: "Pune · education" },
  { id: IDS.admin, role: "admin", label: "Kadam admin", note: "ID review" },
];

const J = (v: unknown) => JSON.stringify(v);

export async function seed(q: Q, put: Put) {
  const now = Date.now();
  const ago = (days: number, hours = 0) => new Date(now - days * 864e5 - hours * 36e5).toISOString();

  // ---------- users ----------
  const users: [string, string, string, string][] = [
    [IDS.admin, "admin", "Kadam Admin", "admin@kadam.example"],
    [IDS.ananya, "student", "Ananya Das", "ananya.das@kadam.example"],
    [IDS.rohan, "student", "Rohan Mehta", "rohan.mehta@kadam.example"],
    [IDS.meera, "student", "Meera Pillai", "meera.pillai@kadam.example"],
    [IDS.sharma, "business", "Ramesh Sharma", "sharma.kirana@kadam.example"],
    [IDS.annapurna, "business", "Lakshmi Iyer", "annapurna.tiffin@kadam.example"],
    [IDS.pragati, "business", "Sutapa Ghosh", "pragati.foundation@kadam.example"],
    [IDS.kalakriti, "business", "Hetal Patel", "kalakriti.handloom@kadam.example"],
    [IDS.brightpath, "business", "Amit Kulkarni", "brightpath.tutorials@kadam.example"],
  ];
  for (const [id, role, name, email] of users) {
    await q(
      `insert into users (id, role, name, email, language_pref, consent_at, created_at) values ($1,$2,$3,$4,$5,$6,$6)`,
      [id, role, name, email, id === IDS.sharma ? "hi" : "en", ago(60)],
    );
  }

  // ---------- businesses ----------
  const biz: [string, string, string, string, string][] = [
    [IDS.sharma, "Sharma Kirana Store", "kirana", "retail", "Bhubaneswar"],
    [IDS.annapurna, "Annapurna Tiffin Services", "msme", "food", "Bengaluru"],
    [IDS.pragati, "Pragati Foundation", "ngo", "ngo", "Kolkata"],
    [IDS.kalakriti, "Kalakriti Handloom", "msme", "manufacturing", "Ahmedabad"],
    [IDS.brightpath, "BrightPath Tutorials", "service", "education", "Pune"],
  ];
  for (const [id, name, type, sector, city] of biz) {
    await q(`insert into business_profiles (user_id, business_name, type, sector, city, contact_verified) values ($1,$2,$3,$4,$5,true)`, [id, name, type, sector, city]);
  }

  // ---------- students ----------
  // Ananya: verified, no profile yet (used for the live profile-builder demo).
  await q(
    `insert into student_profiles (user_id, college, course, year, verification_method, verification_status, college_email)
     values ($1,'Odisha University of Technology and Research, Bhubaneswar','B.Tech, Computer Science','3rd year','email_otp','verified','ananya.das@outr.ac.in')`,
    [IDS.ananya],
  );
  await q(`insert into verification_requests (student_id, method, status, submitted_at, reviewed_at) values ($1,'email_otp','verified',$2,$2)`, [IDS.ananya, ago(20)]);

  const rohanCv = {
    name: "Rohan Mehta",
    education: [{ degree: "B.Com (Honours)", institution: "St. Joseph's College of Commerce, Bengaluru", year: "2027" }],
    skills: ["Excel", "Tally", "Canva", "Instagram marketing", "Public speaking", "Basic SQL"],
    experience: [
      { title: "Social media volunteer", org: "College fest committee", summary: "Ran the Instagram page for the annual fest; grew followers from 900 to 4,200." },
      { title: "Accounts helper", org: "Family hardware shop", summary: "Kept daily sales and GST bills in Tally during holidays." },
    ],
    interests: ["marketing", "small businesses", "data"],
  };
  const rohanPathways = {
    now: [
      { role: "Digital Marketer", slug: "digital-marketer", rationale: "You already grew a real Instagram page and know Canva." },
      { role: "Accountant", slug: "accountant", rationale: "Hands-on Tally and GST billing from the family shop." },
    ],
    pivot: [
      { role: "Business Analyst", slug: "business-analyst", rationale: "Commerce basics plus Excel make process and numbers work a natural next step." },
      { role: "Social Media Manager", slug: "social-media-manager", rationale: "Move from one page to running content for a brand." },
    ],
    stretch: [
      { role: "Product Manager", slug: "product-manager", rationale: "You like small businesses and talking to customers — the core of product work." },
    ],
  };
  await q(
    `insert into student_profiles (user_id, college, course, year, verification_method, verification_status, college_email, cv_text, cv_parsed,
       intake_transcript, intake_summary, target_roles, job_links, pathways, approved_at)
     values ($1,'St. Joseph''s College of Commerce, Bengaluru','B.Com (Honours)','3rd year','id_upload','verified',null,$2,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb,'[]'::jsonb,$7::jsonb,$8)`,
    [
      IDS.rohan,
      "Rohan Mehta · B.Com (Honours), St. Joseph's College of Commerce · Skills: Excel, Tally, Canva, Instagram marketing, Basic SQL · Ran college fest Instagram (900 → 4,200 followers) · Kept GST bills for family hardware shop.",
      J(rohanCv),
      J([
        { role: "assistant", text: "Hi Rohan! I read your CV. What kind of work makes you lose track of time?" },
        { role: "user", text: "Planning posts and seeing how many people respond. Also helping my dad's shop." },
        { role: "assistant", text: "Where would you like to be two years after you graduate?" },
        { role: "user", text: "Working in marketing or strategy for a growing brand, maybe a startup." },
      ]),
      J({ interests: ["marketing", "small businesses"], current: "Final-year commerce student with real social media and accounts practice", goal: "Marketing or strategy role at a growing brand", target_roles: ["Digital Marketer", "Business Analyst"] }),
      J(["Digital Marketer", "Business Analyst"]),
      J(rohanPathways),
      ago(40),
    ],
  );
  await q(`insert into verification_requests (student_id, method, status, submitted_at, reviewed_by, reviewed_at) values ($1,'id_upload','verified',$2,$3,$4)`, [IDS.rohan, ago(45), IDS.admin, ago(44)]);

  // Meera: ID uploaded, waiting for admin review.
  const idCard = new TextEncoder().encode(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" rx="24" fill="#f6efe3"/><rect width="640" height="86" rx="24" fill="#1f3a5f"/><rect y="60" width="640" height="26" fill="#1f3a5f"/><text x="32" y="56" font-family="Arial" font-size="26" fill="#fff" font-weight="bold">Mount Carmel College, Bengaluru</text><rect x="32" y="116" width="150" height="190" rx="12" fill="#d9cdb8"/><circle cx="107" cy="180" r="38" fill="#b7a68a"/><rect x="62" y="230" width="90" height="56" rx="28" fill="#b7a68a"/><text x="214" y="150" font-family="Arial" font-size="18" fill="#555">Name</text><text x="214" y="178" font-family="Arial" font-size="26" fill="#111" font-weight="bold">Meera Pillai</text><text x="214" y="220" font-family="Arial" font-size="18" fill="#555">Course</text><text x="214" y="246" font-family="Arial" font-size="22" fill="#111">BA Journalism, 2nd year</text><text x="214" y="288" font-family="Arial" font-size="18" fill="#555">Student ID  MCC/BAJ/24/0193</text><text x="32" y="360" font-family="Arial" font-size="16" fill="#555">Valid till May 2027</text></svg>`,
  );
  await put("ids/meera-student-id.svg", idCard, "image/svg+xml");
  await q(
    `insert into student_profiles (user_id, college, course, year, verification_method, verification_status) values ($1,'Mount Carmel College, Bengaluru','BA Journalism','2nd year','id_upload','pending')`,
    [IDS.meera],
  );
  await q(
    `insert into verification_requests (student_id, method, id_file, status, submitted_at) values ($1,'id_upload',$2::jsonb,'pending',$3)`,
    [IDS.meera, J({ bucket: "student-ids", path: "ids/meera-student-id.svg", name: "student-id.svg", type: "image/svg+xml" }), ago(0, 5)],
  );

  // ---------- problems ----------
  type Prob = {
    n: number; biz: string; title: string; background: string; current: string; problem: string; outcome: string;
    constraints: string; timeline: string; resources: string; cat: Record<string, unknown>; daysAgo: number; raw?: Record<string, unknown>;
  };
  const probs: Prob[] = [
    {
      n: 1, biz: IDS.sharma, daysAgo: 12,
      title: "Know which items to restock before they run out",
      background: "A family kirana store in Bhubaneswar serving about 150 households, open 7am to 10pm.",
      current: "The owner checks shelves by eye each evening and orders from two wholesalers by phone.",
      problem: "Fast-moving items like atta, oil and milk packets run out two or three times a month, and slow items sit for weeks.",
      outcome: "A simple weekly restock list the owner can follow on a phone, based on what actually sells.",
      constraints: "Must work on a basic Android phone. Owner prefers Hindi or Odia. No monthly fees.",
      timeline: "3 weeks", resources: "Purchase bills for the last two months and a photo of the shelf layout.",
      cat: { sector: "retail", problem_type: "operations", skills: ["Google Sheets", "Inventory planning", "Data analysis"], difficulty: "beginner", time_needed: "w1_4", work_mode: "hybrid", city: "Bhubaneswar", related_roles: ["operations-analyst", "data-analyst"] },
      raw: { type: "voice", transcript: "दुकान में आटा, तेल और दूध के पैकेट बार-बार खत्म हो जाते हैं, और कुछ सामान हफ्तों पड़ा रहता है।" },
    },
    {
      n: 2, biz: IDS.annapurna, daysAgo: 70,
      title: "Grow tiffin subscriptions among office workers in Koramangala",
      background: "Home-style South Indian tiffin service run by four women from a central kitchen in Bengaluru.",
      current: "New customers come only by word of mouth. Orders are taken on WhatsApp.",
      problem: "Subscriptions have been flat at about 38 per month for a year even though many offices are nearby.",
      outcome: "A low-cost plan, tried for one month, that brings steady new monthly subscribers.",
      constraints: "Marketing budget under ₹5,000 a month. No paid agency.",
      timeline: "4–6 weeks to plan and test", resources: "Menu, price list, customer WhatsApp group (with consent), past order sheet.",
      cat: { sector: "food", problem_type: "marketing", skills: ["Instagram", "Canva", "WhatsApp Business", "Customer interviews"], difficulty: "intermediate", time_needed: "m1_2", work_mode: "hybrid", city: "Bengaluru", related_roles: ["digital-marketer", "social-media-manager", "business-analyst"] },
    },
    {
      n: 3, biz: IDS.annapurna, daysAgo: 1,
      title: "Cut food waste by forecasting daily tiffin orders",
      background: "Annapurna cooks fresh every morning for subscribers and walk-in orders.",
      current: "The cook guesses quantities each day from experience.",
      problem: "About 12% of food is thrown away on slow days, and some days they run out by noon.",
      outcome: "A simple daily forecast the cook can read each evening for the next day's quantities.",
      constraints: "Data is in a Google Sheet. Solution must be usable without a laptop.",
      timeline: "3 weeks", resources: "Eight months of daily order data in Google Sheets.",
      cat: { sector: "food", problem_type: "data", skills: ["Excel", "Forecasting", "Google Sheets"], difficulty: "intermediate", time_needed: "w1_4", work_mode: "remote", city: "Bengaluru", related_roles: ["data-analyst", "operations-analyst"] },
    },
    {
      n: 4, biz: IDS.pragati, daysAgo: 15,
      title: "Simple dashboard for our 12 village learning centres",
      background: "Pragati Foundation runs after-school learning centres for children in villages near Kolkata.",
      current: "Each centre sends attendance and test scores as photos of registers on WhatsApp.",
      problem: "The team cannot see which centres need help until the quarterly review.",
      outcome: "A weekly dashboard showing attendance and learning levels by centre, easy to update.",
      constraints: "Volunteers have basic phones. Free tools only.",
      timeline: "6–8 weeks", resources: "Six months of register photos and a typed sample sheet.",
      cat: { sector: "ngo", problem_type: "data", skills: ["Google Sheets", "Looker Studio", "Data cleaning"], difficulty: "intermediate", time_needed: "m1_2", work_mode: "remote", city: "Kolkata", related_roles: ["data-analyst", "ngo-program-coordinator"] },
    },
    {
      n: 5, biz: IDS.pragati, daysAgo: 6,
      title: "Write donor stories that bring in monthly givers",
      background: "Pragati depends on small monthly donations from individuals.",
      current: "Updates to donors are long reports sent twice a year.",
      problem: "Donors drift away because they rarely hear real stories from the centres.",
      outcome: "Five short, true stories with photos and a monthly email template.",
      constraints: "Children's privacy must be protected; consent from parents is needed for any photo.",
      timeline: "3 weeks", resources: "Field notes, volunteer contacts, photo library with consent forms.",
      cat: { sector: "ngo", problem_type: "content", skills: ["Writing", "Interviewing", "Storytelling"], difficulty: "beginner", time_needed: "w1_4", work_mode: "remote", city: "Kolkata", related_roles: ["content-writer", "journalist"] },
    },
    {
      n: 6, biz: IDS.kalakriti, daysAgo: 20,
      title: "Product photos and listings for selling saris online",
      background: "A cluster of 18 handloom weavers in Ahmedabad selling Patola-style saris.",
      current: "Saris are sold only at exhibitions and through one shop.",
      problem: "They have started an Instagram page but phone photos look dull and listings have no details.",
      outcome: "A photo style guide, 20 edited product photos and listing text they can reuse.",
      constraints: "Shoot with a phone in natural light. Weavers speak Gujarati.",
      timeline: "2 weeks", resources: "Access to the workshop on weekends, 20 saris to photograph.",
      cat: { sector: "manufacturing", problem_type: "design_ux", skills: ["Photography", "Canva", "Copywriting"], difficulty: "beginner", time_needed: "w1_4", work_mode: "onsite", city: "Ahmedabad", related_roles: ["graphic-designer", "digital-marketer", "content-writer"] },
    },
    {
      n: 7, biz: IDS.kalakriti, daysAgo: 30,
      title: "Work out the true cost of each sari we weave",
      background: "Kalakriti prices saris by habit and what buyers will pay.",
      current: "Yarn, dye and labour costs are noted in separate notebooks.",
      problem: "Some designs may be sold at a loss, but nobody knows which.",
      outcome: "A costing sheet per design and suggested minimum prices.",
      constraints: "Sheet must be simple enough for the cluster head to update.",
      timeline: "3 weeks", resources: "Purchase bills for the last 6 months, list of designs and weaving days.",
      cat: { sector: "manufacturing", problem_type: "finance", skills: ["Excel", "Costing", "Pricing"], difficulty: "beginner", time_needed: "w1_4", work_mode: "hybrid", city: "Ahmedabad", related_roles: ["financial-analyst", "accountant", "business-analyst"] },
    },
    {
      n: 8, biz: IDS.brightpath, daysAgo: 4,
      title: "Redesign our fee reminder and payment process",
      background: "BrightPath runs coaching classes for 220 school students in Pune.",
      current: "The office calls parents one by one when fees are late. Payments come by cash, UPI and cheque.",
      problem: "Staff spend two days a month chasing fees and records do not match.",
      outcome: "A clear process map and a reminder routine that cuts follow-up time in half.",
      constraints: "Parents must not feel pressured. Use tools the office already has.",
      timeline: "1 week", resources: "Fee register, sample reminder messages, a call with the office manager.",
      cat: { sector: "education", problem_type: "operations", skills: ["Process mapping", "Google Sheets", "Communication"], difficulty: "beginner", time_needed: "lt1w", work_mode: "remote", city: "Pune", related_roles: ["operations-analyst", "business-analyst"] },
    },
    {
      n: 9, biz: IDS.brightpath, daysAgo: 2,
      title: "Make our website easy to use for parents on phones",
      background: "Most parents find BrightPath through Google on their phones.",
      current: "The website was built years ago for desktop.",
      problem: "On phones the timetable and fee pages are hard to read and the enquiry form often fails.",
      outcome: "A redesigned mobile layout for the three key pages, with a working enquiry form.",
      constraints: "Keep the existing hosting. Pages must load fast on 4G.",
      timeline: "3–4 weeks", resources: "Website login, Google Analytics access, current page content.",
      cat: { sector: "education", problem_type: "design_ux", skills: ["Figma", "HTML", "CSS", "Usability testing"], difficulty: "intermediate", time_needed: "w1_4", work_mode: "remote", city: "Pune", related_roles: ["ux-designer", "frontend-developer"] },
    },
    {
      n: 10, biz: IDS.pragati, daysAgo: 25,
      title: "Research why girls drop out after Class 8 in our area",
      background: "Pragati has seen girls leave its centres after Class 8 in three villages.",
      current: "Staff have anecdotes but no structured evidence.",
      problem: "Without evidence it is hard to design the right support or raise funds for it.",
      outcome: "A short research report with interviews of 20 families and three recommendations.",
      constraints: "Field visits need a staff member present. Interviews in Bengali.",
      timeline: "6 weeks", resources: "Introductions to families, travel support for field days.",
      cat: { sector: "ngo", problem_type: "research", skills: ["Interviewing", "Research design", "Report writing", "Bengali"], difficulty: "advanced", time_needed: "m1_2", work_mode: "onsite", city: "Kolkata", related_roles: ["research-analyst", "journalist", "ngo-program-coordinator"] },
    },
  ];
  for (const p of probs) {
    await q(
      `insert into problems (id, business_id, raw_input, title, background, current_process, problem, desired_outcome, constraints, expected_timeline,
        resources_provided, categories, status, created_at, live_at)
       values ($1,$2,$3::jsonb,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,'live',$13,$13)`,
      [P(p.n), p.biz, J(p.raw ?? { type: "text", text: p.problem }), p.title, p.background, p.current, p.problem, p.outcome, p.constraints, p.timeline, p.resources, J(p.cat), ago(p.daysAgo)],
    );
  }

  // ---------- engagement 1: Rohan × Annapurna, In use with impact updates ----------
  const e1 = IDS.engInUse;
  await q(`insert into engagements (id, problem_id, student_id, status, share_token, started_at) values ($1,$2,$3,'in_use','r7m2annapurna9tiffin4k',$4)`, [e1, P(2), IDS.rohan, ago(66)]);
  const chat1: [string, string, number][] = [
    [IDS.rohan, "Namaste! I'm Rohan, B.Com final year. I'd love to work on growing your subscriptions. Could I visit the kitchen this Saturday?", 65],
    [IDS.annapurna, "Welcome Rohan. Yes, come at 11am after the lunch packing. I will share our order sheet.", 65],
    [IDS.rohan, "I spoke to 14 office workers near Sony Signal. Most didn't know a home tiffin was nearby. Price is fine; trial is the barrier.", 58],
    [IDS.annapurna, "That is useful. Can we try a ₹99 trial week?", 57],
    [IDS.rohan, "Yes! I've drafted a plan with a trial week, office-desk flyers with a QR code and a referral offer. Submitting it now.", 50],
  ];
  for (const [s, t, d] of chat1) await q(`insert into messages (engagement_id, sender_id, text, created_at) values ($1,$2,$3,$4)`, [e1, s, t, ago(d)]);
  await q(
    `insert into submissions (engagement_id, description, links, files, submitted_at, receipt_confirmed_at) values ($1,$2,$3::jsonb,'[]'::jsonb,$4,$5)`,
    [
      e1,
      "A one-month growth plan: (1) ₹99 trial week for new office customers, (2) QR flyers left at 9 office receptions in Koramangala, (3) a 'bring a colleague' referral giving one free meal, (4) a WhatsApp Business catalogue with daily menu photos, (5) a simple sheet to track trial-to-subscriber conversion.",
      J(["https://docs.google.com/document/d/annapurna-growth-plan", "https://www.canva.com/design/annapurna-flyer"]),
      ago(50),
      ago(49),
    ],
  );
  const sc1: [string, string | null, number][] = [["taken_up", null, 66], ["in_progress", null, 65], ["submitted", null, 50], ["received", null, 49], ["accepted", null, 47], ["in_use", null, 45]];
  for (const [s, r, d] of sc1) await q(`insert into status_changes (engagement_id, status, reason, created_at) values ($1,$2,$3,$4)`, [e1, s, r, ago(d)]);
  await q(`insert into feedback (engagement_id, text, created_at) values ($1,$2,$3)`, [e1, "Rohan listened to our customers before suggesting anything. The trial week idea was simple and it worked.", ago(30)]);
  const ups: [string, Record<string, string>, string, number][] = [
    ["Started the ₹99 trial week and put flyers in 9 offices.", { sales: "17 trial customers in 2 weeks", users: "Subscribers 38 → 49" }, "Good start. Many asked for less spicy options.", 31],
    ["Added a mild menu and the referral offer.", { sales: "Monthly revenue up about ₹21,000", users: "Subscribers 49 → 63", time_saved: "Order-taking time down 30 min/day with the WhatsApp catalogue" }, "Referral is working well.", 17],
    ["Second building complex added. Trial-to-subscriber rate is now 58%.", { sales: "Monthly revenue up about ₹36,000 from start", users: "Subscribers 63 → 81", costs: "Flyer cost ₹1,800 total" }, "We want to continue this every month.", 3],
  ];
  for (const [w, m, c, d] of ups) await q(`insert into impact_updates (engagement_id, what_changed, metrics, comments, created_at) values ($1,$2,$3::jsonb,$4,$5)`, [e1, w, J(m), c, ago(d)]);
  const reportBase = {
    summary:
      "Rohan Mehta designed and launched a low-cost growth plan for Annapurna Tiffin Services, a women-run home kitchen in Bengaluru. After interviewing 14 office workers, he found that trying the food — not price — was the barrier. His ₹99 trial week, QR flyers and referral offer have been in daily use for six weeks.",
    skills: ["Customer interviews", "Growth marketing", "WhatsApp Business", "Canva", "Conversion tracking", "Small-business strategy"],
  };
  const reports = [
    { v: 1, d: 45, outcomes: [{ label: "Status", value: "In use in daily operations" }], timeline: [{ date: ago(66), event: "Took up the problem" }, { date: ago(50), event: "Submitted growth plan" }, { date: ago(45), event: "Plan put into daily use" }], bullets: ["Designed a one-month growth plan for a women-run tiffin business after interviewing 14 target customers", "Plan accepted and put into daily use by the business"] },
    { v: 2, d: 31, outcomes: [{ label: "Subscribers", value: "38 → 49" }, { label: "New trial customers", value: "17 in 2 weeks" }], timeline: [{ date: ago(66), event: "Took up the problem" }, { date: ago(50), event: "Submitted growth plan" }, { date: ago(45), event: "Plan put into daily use" }, { date: ago(31), event: "First impact update: subscribers 38 → 49" }], bullets: ["Designed and launched a ₹99 trial-week offer that brought 17 new customers in 2 weeks", "Grew monthly subscribers from 38 to 49 for a home tiffin business in Bengaluru"] },
  ];
  for (const r of reports) {
    await q(
      `insert into impact_reports (engagement_id, version, summary, outcomes, skills_demonstrated, timeline, resume_bullets, generated_at, share_token)
       values ($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7::jsonb,$8,'r7m2annapurna9tiffin4k')`,
      [e1, r.v, reportBase.summary, J(r.outcomes), J(reportBase.skills), J(r.timeline), J(r.bullets), ago(r.d)],
    );
  }
  await q(
    `insert into impact_reports (engagement_id, version, summary, outcomes, skills_demonstrated, timeline, resume_bullets, generated_at, share_token)
     values ($1,3,$2,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb,$7,'r7m2annapurna9tiffin4k')`,
    [
      e1,
      reportBase.summary,
      J([
        { label: "Monthly subscribers", value: "38 → 81 (+113%)" },
        { label: "Monthly revenue", value: "+ about ₹36,000" },
        { label: "Trial-to-subscriber rate", value: "58%" },
        { label: "Order-taking time", value: "30 min less per day" },
        { label: "Marketing spend", value: "₹1,800 total" },
      ]),
      J(reportBase.skills),
      J([
        { date: ago(66), event: "Took up the problem" },
        { date: ago(58), event: "Interviewed 14 office workers near the kitchen" },
        { date: ago(50), event: "Submitted a one-month growth plan" },
        { date: ago(45), event: "Plan put into daily use" },
        { date: ago(31), event: "Subscribers 38 → 49" },
        { date: ago(17), event: "Subscribers 49 → 63, revenue +₹21,000/month" },
        { date: ago(3), event: "Subscribers 63 → 81, second office complex added" },
      ]),
      J([
        "Grew monthly subscriptions for a women-run tiffin business from 38 to 81 (+113%) in six weeks with a ₹1,800 budget",
        "Interviewed 14 target customers and found trial, not price, was the barrier; designed a ₹99 trial week with a 58% conversion rate",
        "Set up a WhatsApp Business catalogue and referral offer that cut daily order-taking time by 30 minutes",
        "Added about ₹36,000 in monthly revenue for an MSME, with the plan still in daily use",
      ]),
      ago(3),
    ],
  );

  // ---------- engagement 2: Rohan × Kalakriti, submitted and waiting ----------
  const e2 = IDS.engSubmitted;
  await q(`insert into engagements (id, problem_id, student_id, status, started_at) values ($1,$2,$3,'submitted',$4)`, [e2, P(7), IDS.rohan, ago(14)]);
  const chat2: [string, string, number][] = [
    [IDS.rohan, "Hello! I'll build the costing sheet. Could you share the yarn and dye bills?", 13],
    [IDS.kalakriti, "Sent photos of bills on WhatsApp. Weaving days per design are in the second photo.", 12],
    [IDS.rohan, "Thanks. Three designs look underpriced. I've added a minimum price column. Submitting now for your review.", 1],
  ];
  for (const [s, t, d] of chat2) await q(`insert into messages (engagement_id, sender_id, text, created_at) values ($1,$2,$3,$4)`, [e2, s, t, ago(d)]);
  await q(
    `insert into submissions (engagement_id, description, links, files, submitted_at) values ($1,$2,$3::jsonb,'[]'::jsonb,$4)`,
    [e2, "A costing sheet for all 11 designs: yarn, dye, weaving days and finishing per sari, with a suggested minimum price. Three designs are currently sold below cost.", J(["https://docs.google.com/spreadsheets/d/kalakriti-costing"]), ago(1)],
  );
  for (const [s, d] of [["taken_up", 14], ["in_progress", 13], ["submitted", 1]] as [string, number][]) {
    await q(`insert into status_changes (engagement_id, status, created_at) values ($1,$2,$3)`, [e2, s, ago(d)]);
  }

  // ---------- roadmaps ----------
  for (const r of SEEDED_ROADMAPS) {
    await q(`insert into roadmaps (role, title, summary, steps, source) values ($1,$2,$3,$4::jsonb,'seed')
       on conflict (role) do update set title = excluded.title, summary = excluded.summary, steps = excluded.steps, source = 'seed'`, [r.role, r.title, r.summary, J({ sections: r.sections })]);
  }
  const prog: [string, Record<string, string>][] = [
    ["digital-marketer", { "dm-basics": "done", "dm-basics-customer": "done", "dm-basics-offer": "done", "dm-basics-funnel": "done", "dm-local": "done", "dm-local-wa": "done", "dm-local-gbp": "learning", "dm-social": "done", "dm-social-calendar": "done", "dm-social-reels": "learning", "dm-seo": "learning", "dm-ads": "skipped" }],
    ["business-analyst", { "ba-money": "done", "ba-stake": "learning", "ba-stake-interview": "done" }],
  ];
  for (const [role, st] of prog) {
    const done = Object.entries(st).filter(([, v]) => v === "done").map(([k]) => k);
    await q(`insert into roadmap_progress (student_id, role, completed_step_ids, statuses) values ($1,$2,$3::jsonb,$4::jsonb)`, [IDS.rohan, role, J(done), J(st)]);
  }

  // ---------- notifications ----------
  const notes: [string, string, Record<string, unknown>, number, boolean][] = [
    [IDS.rohan, "report_regenerated", { engagementId: e1, title: "Grow tiffin subscriptions among office workers in Koramangala" }, 3, false],
    [IDS.rohan, "impact_update", { engagementId: e1, title: "Grow tiffin subscriptions among office workers in Koramangala" }, 3, true],
    [IDS.kalakriti, "submitted", { engagementId: e2, title: "Work out the true cost of each sari we weave", student: "Rohan Mehta" }, 1, false],
    [IDS.admin, "verification_requested", { student: "Meera Pillai" }, 0, false],
  ];
  for (const [u, t, p, d, r] of notes) await q(`insert into notifications (user_id, type, payload, read, created_at) values ($1,$2,$3::jsonb,$4,$5)`, [u, t, J(p), r, ago(d)]);
}

// Removes only the seeded demo accounts (and everything that cascades from them), then the seed can run again.
export const RESET_SQL = `
update verification_requests set reviewed_by = null where reviewed_by in (select id from users where email like '%@kadam.example');
delete from users where email like '%@kadam.example';
delete from roadmaps where source = 'seed';
delete from blobs where path like 'student-ids/ids/meera-%';
`;

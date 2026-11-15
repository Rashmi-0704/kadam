// Catalogue of Kadam roadmaps: role-based (by stream) and skill-based.
// `topics` are the key areas, used to build a specific roadmap when no hand-written one exists.
// `rsh` is the matching roadmap.sh page, linked (never copied) with credit.

export type CatalogItem = {
  slug: string;
  title: string;
  kind: "role" | "skill";
  group: string;
  blurb: string;
  topics: string[];
  rsh?: string;
};

const R = (slug: string, title: string, group: string, blurb: string, topics: string[], rsh?: string): CatalogItem => ({ slug, title, kind: "role", group, blurb, topics, rsh });
const S = (slug: string, title: string, group: string, blurb: string, topics: string[], rsh?: string): CatalogItem => ({ slug, title, kind: "skill", group, blurb, topics, rsh });

export const ROLE_GROUPS = ["Tech & data", "Business & commerce", "Design, media & social impact"] as const;
export const SKILL_GROUPS = ["Tools", "Coding", "Everyday skills"] as const;

export const CATALOG: CatalogItem[] = [
  // ---------- Tech & data ----------
  R("frontend-developer", "Frontend Developer", "Tech & data", "Build websites people use on any phone.", ["HTML", "CSS layouts", "JavaScript", "Git", "React", "Accessibility", "Deploying a site"], "frontend"),
  R("backend-developer", "Backend Developer", "Tech & data", "Servers, databases and APIs behind every app.", ["How the web works", "A server language", "SQL databases", "REST APIs", "Authentication", "Testing", "Deploying"], "backend"),
  R("full-stack-developer", "Full Stack Developer", "Tech & data", "Front and back of a product, end to end.", ["HTML, CSS, JavaScript", "React", "Node.js", "Databases", "APIs", "Auth", "Cloud hosting"], "full-stack"),
  R("android-developer", "Android Developer", "Tech & data", "Apps for the phones most Indians use.", ["Kotlin basics", "Android Studio", "Layouts and Compose", "Storing data", "Calling APIs", "Publishing on Play Store"], "android"),
  R("data-analyst", "Data Analyst", "Tech & data", "Turn messy numbers into clear decisions.", ["Spreadsheets", "Statistics", "SQL", "Data cleaning", "Dashboards"], "data-analyst"),
  R("data-scientist", "Data Scientist", "Tech & data", "Predict what happens next with data and models.", ["Python", "Statistics and probability", "pandas", "Machine learning basics", "Model evaluation", "Communicating results"], "ai-data-scientist"),
  R("ai-engineer", "AI Engineer", "Tech & data", "Build useful products on top of AI models.", ["Python", "How LLMs work", "Prompt engineering", "Using AI APIs", "Retrieval (RAG)", "Evaluating AI output", "Responsible AI"], "ai-engineer"),
  R("devops-engineer", "DevOps Engineer", "Tech & data", "Keep software running, fast and safe.", ["Linux", "Networking basics", "Git", "Docker", "CI/CD", "Cloud basics", "Monitoring"], "devops"),
  R("cyber-security-analyst", "Cyber Security Analyst", "Tech & data", "Protect people and businesses from attacks.", ["Networking", "Operating systems", "Common attacks", "Passwords and access", "Security tools", "Incident response"], "cyber-security"),
  R("software-developer", "Software Developer", "Tech & data", "Write and ship reliable software.", ["One programming language", "Data structures", "Git", "Databases", "Testing", "Building a project"], "computer-science"),
  R("qa-tester", "QA Tester", "Tech & data", "Find bugs before customers do.", ["Testing basics", "Writing test cases", "Bug reports", "Manual testing", "Automation basics", "Testing on phones"], "qa"),
  R("product-manager", "Product Manager", "Tech & data", "Decide what to build and why.", ["User problems", "Research", "Prioritising", "Writing specs", "Working with designers and engineers", "Measuring success"], "product-manager"),

  // ---------- Business & commerce ----------
  R("business-analyst", "Business Analyst", "Business & commerce", "Map how a business works and improve it.", ["How businesses make money", "Talking to stakeholders", "Process mapping", "Spreadsheets", "SQL basics", "Recommendations"]),
  R("financial-analyst", "Financial Analyst", "Business & commerce", "Help a business understand its money.", ["Accounting basics", "Costing", "Spreadsheet models", "Pricing", "Explaining numbers"]),
  R("accountant", "Accountant", "Business & commerce", "Keep the books right and on time.", ["Bookkeeping", "Tally", "GST basics", "Invoices and payments", "Monthly closing", "Reports for owners"]),
  R("digital-marketer", "Digital Marketer", "Business & commerce", "Find and keep customers online.", ["Marketing basics", "Local reach", "Social media", "SEO", "Measuring results"]),
  R("social-media-manager", "Social Media Manager", "Business & commerce", "Run a brand's Instagram, WhatsApp and more.", ["Knowing the audience", "Content calendar", "Short video", "Design with Canva", "Community replies", "Analytics"]),
  R("sales-executive", "Sales & Business Development", "Business & commerce", "Win customers and grow revenue.", ["Understanding the customer", "Prospecting", "Pitching", "Handling objections", "Follow-ups", "CRM basics"]),
  R("operations-analyst", "Operations Analyst", "Business & commerce", "Make daily work faster and cheaper.", ["Process mapping", "Inventory", "Spreadsheets", "Measuring time and cost", "Fixing bottlenecks", "Simple automation"]),
  R("supply-chain-analyst", "Supply Chain Analyst", "Business & commerce", "Move goods from supplier to customer, well.", ["Supply chain basics", "Inventory planning", "Forecasting demand", "Suppliers and buying", "Logistics", "Spreadsheets"]),
  R("hr-executive", "HR Executive", "Business & commerce", "Hire, support and grow people.", ["Recruiting", "Interviewing", "Onboarding", "Labour law basics", "Payroll basics", "Employee engagement"]),
  R("entrepreneur", "Entrepreneur", "Business & commerce", "Start and run something of your own.", ["Finding a problem", "Talking to customers", "Building a first version", "Pricing", "Selling", "Money and accounts"]),

  // ---------- Design, media & social impact ----------
  R("ux-designer", "UX Designer", "Design, media & social impact", "Make products simple for real people.", ["Design principles", "User research", "Figma", "Flows and wireframes", "Usability testing", "Accessible design"], "ux-design"),
  R("graphic-designer", "Graphic Designer", "Design, media & social impact", "Posters, brands and visuals that speak.", ["Design basics", "Typography", "Colour", "Canva", "Photoshop or Illustrator", "Building a portfolio"]),
  R("content-writer", "Content Writer", "Design, media & social impact", "Words that make people read and act.", ["Plain writing", "Structure and editing", "Storytelling", "Writing for the web", "Portfolio"]),
  R("journalist", "Journalist", "Design, media & social impact", "Find, check and tell true stories.", ["News writing", "Interviewing", "Fact-checking", "Data journalism", "Ethics and law"]),
  R("video-editor", "Video Editor", "Design, media & social impact", "Turn raw clips into stories.", ["Storytelling for video", "Editing basics", "Free editing apps", "Sound and music", "Captions", "Short-form video"]),
  R("teacher-trainer", "Teacher / Trainer", "Design, media & social impact", "Help people learn, in class or online.", ["How people learn", "Lesson planning", "Explaining clearly", "Activities", "Checking understanding", "Teaching online"]),
  R("ngo-program-coordinator", "NGO Programme Coordinator", "Design, media & social impact", "Run programmes that change lives.", ["Understanding the community", "Programme planning", "Volunteers", "Reporting to donors", "Measuring impact", "Budgets"]),
  R("research-analyst", "Research Analyst", "Design, media & social impact", "Answer hard questions with evidence.", ["Asking a research question", "Surveys", "Interviews", "Analysing data", "Writing a report", "Recommendations"]),
  R("policy-analyst", "Public Policy Analyst", "Design, media & social impact", "Understand and improve public programmes.", ["How government works", "Reading policy", "Data on India", "Field research", "Writing policy briefs", "Presenting"]),

  // ---------- Skills: tools ----------
  S("excel", "Excel", "Tools", "The tool every office runs on.", ["Formulas", "Lookups", "Pivot tables", "Charts", "Cleaning data", "Simple dashboards"]),
  S("google-sheets", "Google Sheets", "Tools", "Free, shareable spreadsheets for small teams.", ["Basics and sharing", "Formulas", "Forms to Sheets", "Charts", "Pivot tables", "Automating with Apps Script"]),
  S("power-bi", "Power BI", "Tools", "Interactive dashboards for business data.", ["Loading data", "Cleaning with Power Query", "Data models", "DAX basics", "Visuals", "Sharing reports"]),
  S("canva", "Canva", "Tools", "Quick, good-looking designs for anything.", ["Layouts", "Brand kit", "Social posts", "Posters", "Presentations", "Short videos"]),
  S("figma", "Figma", "Tools", "Design screens and prototypes together.", ["Frames and layers", "Auto layout", "Components", "Prototyping", "Design handoff"]),
  S("tally-gst", "Tally & GST", "Tools", "Books and tax for Indian small businesses.", ["Company setup", "Vouchers", "Inventory", "GST invoices", "GST returns basics", "Reports"]),
  S("git-github", "Git & GitHub", "Tools", "Save, share and collaborate on code.", ["Commits", "Branches", "Merging", "GitHub", "Pull requests", "Open source"], "git-github"),

  // ---------- Skills: coding ----------
  S("python", "Python", "Coding", "The friendliest first programming language.", ["Basics", "Lists and dictionaries", "Functions", "Files", "Libraries", "Small projects"], "python"),
  S("sql", "SQL", "Coding", "Ask questions of any database.", ["SELECT and WHERE", "Sorting and filtering", "GROUP BY", "JOINs", "Subqueries", "Designing tables"], "sql"),
  S("javascript", "JavaScript", "Coding", "The language of the web.", ["Basics", "Functions", "The DOM", "Events", "fetch and APIs", "async / await"], "javascript"),
  S("react", "React", "Coding", "Build interfaces from components.", ["Components", "Props", "State", "Effects", "Forms", "Routing"], "react"),
  S("prompt-engineering", "Prompt Engineering", "Coding", "Get useful, reliable results from AI.", ["How AI models respond", "Clear instructions", "Examples in prompts", "Structured output", "Checking answers", "Safety"], "prompt-engineering"),

  // ---------- Skills: everyday ----------
  S("public-speaking", "Public Speaking", "Everyday skills", "Speak with confidence to any group.", ["Structuring a talk", "Opening strong", "Voice and body", "Slides", "Handling questions", "Practising"]),
  S("communication", "Communication & Writing", "Everyday skills", "Emails, messages and reports that work.", ["Plain language", "Emails", "WhatsApp for work", "Meeting notes", "Reports", "Giving feedback"]),
  S("problem-solving", "Problem Solving", "Everyday skills", "Break big problems into doable steps.", ["Defining the problem", "Finding root causes", "Generating options", "Deciding", "Testing small", "Learning from results"]),
  S("statistics", "Statistics", "Everyday skills", "Know when numbers really mean something.", ["Averages", "Spread", "Probability", "Sampling", "Correlation", "Testing ideas"]),
  S("interviewing", "Interviewing People", "Everyday skills", "Learn what people really need.", ["Preparing questions", "Listening", "Follow-up questions", "Taking notes", "Finding patterns", "Ethics and consent"]),
];

export const catalogItem = (slug: string) => CATALOG.find((c) => c.slug === slug);

/** Roadmaps relevant to a problem: its career roles first, then roadmaps for the skills it needs. */
export function relevantRoadmaps(roles: string[], skills: string[], limit = 4): CatalogItem[] {
  const out: CatalogItem[] = [];
  const add = (c?: CatalogItem) => { if (c && !out.includes(c)) out.push(c); };
  roles.forEach((r) => add(catalogItem(r)));
  const lc = skills.map((s) => s.toLowerCase());
  for (const c of CATALOG.filter((x) => x.kind === "skill")) {
    const t = c.title.toLowerCase();
    if (lc.some((s) => t.includes(s) || s.includes(t.split(" ")[0]))) add(c);
  }
  return out.slice(0, limit);
}

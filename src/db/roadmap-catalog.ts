// Catalogue of Kadam roadmaps: role-based (by stream) and skill-based.
// `topics` are the key areas, used to build a specific roadmap when no hand-written one exists.
// `sections` / `optional` / `level` are richer hints for the AI roadmap prompt (see CatalogItem below).
// `rsh` is the matching roadmap.sh page, linked (never copied) with credit. Every `rsh` here was checked to return 200.

export type CatalogLevel = "beginner" | "intermediate" | "advanced";
export type CatalogSection = { title: string; topics: string[] };

export type CatalogItem = {
  slug: string;
  title: string;
  kind: "role" | "skill";
  group: string;
  blurb: string;
  /** Every key topic in learning order (flattened from `sections` when those exist). Other code reads this. */
  topics: string[];
  rsh?: string;
  /** Topics grouped into ordered sections, for building the roadmap outline. */
  sections?: CatalogSection[];
  /** Topics (exact strings from `topics`) that are nice-to-have rather than core. Everything else is core / recommended. */
  optional?: string[];
  /** How hard it is to start from zero: matches DIFFICULTIES in taxonomy.ts. */
  level?: CatalogLevel;
};

type Extra = { rsh?: string; level?: CatalogLevel };
/** A section's topic ending in "?" is optional; the "?" is stripped. */
type SectionSpec = [title: string, topics: string[]];

function build(kind: CatalogItem["kind"], slug: string, title: string, group: string, blurb: string, spec: string[] | SectionSpec[], extra: Extra = {}): CatalogItem {
  const base = { slug, title, kind, group, blurb, ...(extra.rsh ? { rsh: extra.rsh } : {}), ...(extra.level ? { level: extra.level } : {}) };
  if (spec.length && typeof spec[0] === "string") return { ...base, topics: spec as string[] };
  const optional: string[] = [];
  const sections = (spec as SectionSpec[]).map(([t, list]) => ({
    title: t,
    topics: list.map((x) => {
      const name = x.endsWith("?") ? x.slice(0, -1).trim() : x;
      if (name !== x) optional.push(name);
      return name;
    }),
  }));
  return { ...base, topics: sections.flatMap((s) => s.topics), sections, ...(optional.length ? { optional } : {}) };
}
const R = (slug: string, title: string, group: string, blurb: string, spec: string[] | SectionSpec[], extra?: Extra) => build("role", slug, title, group, blurb, spec, extra);
const S = (slug: string, title: string, group: string, blurb: string, spec: string[] | SectionSpec[], extra?: Extra) => build("skill", slug, title, group, blurb, spec, extra);

export const ROLE_GROUPS = ["Tech & data", "Business & commerce", "Design, media & social impact"] as const;
export const SKILL_GROUPS = ["Tools", "Coding", "Everyday skills"] as const;

export const CATALOG: CatalogItem[] = [
  // ---------- Tech & data ----------
  // Roles with a hand-written roadmap (roadmaps-data.ts or ./roadmaps/) keep a short topic list; the roadmap itself is the source of truth.
  R("frontend-developer", "Frontend Developer", "Tech & data", "Build websites people use on any phone.", ["HTML", "CSS layouts", "JavaScript", "Git", "React", "Accessibility", "Deploying a site"], { rsh: "frontend", level: "beginner" }),
  R("backend-developer", "Backend Developer", "Tech & data", "Servers, databases and APIs behind every app.", ["How the web works", "A server language", "SQL databases", "REST APIs", "Authentication", "Testing", "Deploying"], { rsh: "backend", level: "intermediate" }),
  R("full-stack-developer", "Full Stack Developer", "Tech & data", "Front and back of a product, end to end.", ["HTML, CSS, JavaScript", "React", "Node.js", "Databases", "APIs", "Auth", "Cloud hosting"], { rsh: "full-stack", level: "intermediate" }),
  R("android-developer", "Android Developer", "Tech & data", "Apps for the phones most Indians use.", [
    ["Foundations", ["Kotlin basics", "Android Studio and emulators", "Git and GitHub"]],
    ["Building screens", ["Jetpack Compose layouts", "Navigation between screens", "Material Design", "XML views?"]],
    ["Data and the network", ["Storing data with Room", "Calling APIs with Retrofit", "Working offline", "Firebase?"]],
    ["Ship it", ["Testing on low-end phones", "Publishing on Play Store", "Hindi and regional language support?"]],
  ], { rsh: "android", level: "intermediate" }),
  R("data-analyst", "Data Analyst", "Tech & data", "Turn messy numbers into clear decisions.", ["Spreadsheets", "Statistics", "SQL", "Data cleaning", "Dashboards"], { rsh: "data-analyst", level: "beginner" }),
  R("data-scientist", "Data Scientist", "Tech & data", "Predict what happens next with data and models.", [
    ["Foundations", ["Python", "Statistics and probability", "Linear algebra basics?"]],
    ["Working with data", ["pandas and NumPy", "Data cleaning", "Exploratory analysis and charts", "SQL"]],
    ["Machine learning", ["Regression and classification", "Model evaluation", "scikit-learn", "Deep learning basics?"]],
    ["Impact", ["Communicating results", "Deploying a simple model?", "Ethics and bias"]],
  ], { rsh: "ai-data-scientist", level: "advanced" }),
  R("ai-engineer", "AI Engineer", "Tech & data", "Build useful products on top of AI models.", [
    ["Foundations", ["Python", "APIs and JSON", "How LLMs work"]],
    ["Building with models", ["Prompt engineering", "Using AI APIs", "Structured output", "Retrieval (RAG)", "Embeddings and vector search?"]],
    ["Quality and safety", ["Evaluating AI output", "Cost and latency", "Responsible AI"]],
    ["Ship it", ["A small AI app", "Agents and tool use?", "Fine-tuning?"]],
  ], { rsh: "ai-engineer", level: "intermediate" }),
  R("devops-engineer", "DevOps Engineer", "Tech & data", "Keep software running, fast and safe.", [
    ["Foundations", ["Linux", "Networking basics", "Git", "Bash scripting"]],
    ["Build and ship", ["Docker", "CI/CD", "Deploying a web app"]],
    ["Run it", ["Cloud basics", "Monitoring and logs", "Infrastructure as code?", "Kubernetes?"]],
    ["Keep it safe", ["Secrets and access", "Backups and recovery"]],
  ], { rsh: "devops", level: "advanced" }),
  R("cyber-security-analyst", "Cyber Security Analyst", "Tech & data", "Protect people and businesses from attacks.", [
    ["Foundations", ["Networking", "Operating systems", "Linux command line"]],
    ["Threats", ["Common attacks", "Phishing and social engineering", "Web app security (OWASP Top 10)"]],
    ["Defence", ["Passwords and access", "Security tools", "Logs and monitoring", "Cloud security?"]],
    ["Respond", ["Incident response", "Security awareness for small businesses", "Capture-the-flag practice?"]],
  ], { rsh: "cyber-security", level: "intermediate" }),
  R("software-developer", "Software Developer", "Tech & data", "Write and ship reliable software.", [
    ["Foundations", ["One programming language", "Problem solving", "Git"]],
    ["Core computer science", ["Data structures", "Algorithms", "Object-oriented design", "Operating systems basics?"]],
    ["Building software", ["Databases", "APIs", "Testing", "Debugging"]],
    ["Ship it", ["Building a project", "Code review", "System design basics?"]],
  ], { rsh: "computer-science", level: "beginner" }),
  R("qa-tester", "QA Tester", "Tech & data", "Find bugs before customers do.", [
    ["Foundations", ["Testing basics", "How software is built", "Writing test cases"]],
    ["Manual testing", ["Exploratory testing", "Bug reports", "Testing on phones", "Accessibility checks?"]],
    ["Automation", ["Automation basics", "Browser automation (Playwright or Selenium)", "API testing", "Performance testing?"]],
  ], { rsh: "qa", level: "beginner" }),
  R("product-manager", "Product Manager", "Tech & data", "Decide what to build and why.", ["User problems", "Research", "Prioritising", "Writing specs", "Working with designers and engineers", "Measuring success"], { rsh: "product-manager", level: "intermediate" }),

  // ---------- Business & commerce ----------
  R("business-analyst", "Business Analyst", "Business & commerce", "Map how a business works and improve it.", ["How businesses make money", "Talking to stakeholders", "Process mapping", "Spreadsheets", "SQL basics", "Recommendations"], { level: "beginner" }),
  R("financial-analyst", "Financial Analyst", "Business & commerce", "Help a business understand its money.", ["Accounting basics", "Costing", "Spreadsheet models", "Pricing", "Explaining numbers"], { level: "intermediate" }),
  R("accountant", "Accountant", "Business & commerce", "Keep the books right and on time.", [
    ["Foundations", ["Accounting basics", "Bookkeeping", "Reading financial statements"]],
    ["Tools", ["Tally", "Excel for accountants", "Zoho Books or other cloud tools?"]],
    ["Tax and compliance", ["GST basics", "TDS basics", "Filing deadlines"]],
    ["Monthly work", ["Invoices and payments", "Bank reconciliation", "Monthly closing", "Reports for owners", "Payroll basics?"]],
  ], { level: "beginner" }),
  R("digital-marketer", "Digital Marketer", "Business & commerce", "Find and keep customers online.", ["Marketing basics", "Local reach", "Social media", "SEO", "Measuring results"], { level: "beginner" }),
  R("social-media-manager", "Social Media Manager", "Business & commerce", "Run a brand's Instagram, WhatsApp and more.", ["Knowing the audience", "Content calendar", "Short video", "Design with Canva", "Community replies", "Analytics"], { level: "beginner" }),
  R("sales-executive", "Sales & Business Development", "Business & commerce", "Win customers and grow revenue.", ["Understanding the customer", "Prospecting", "Pitching", "Handling objections", "Follow-ups", "CRM basics"], { level: "beginner" }),
  R("operations-analyst", "Operations Associate / Analyst", "Business & commerce", "Make daily work faster and cheaper.", ["Process mapping", "Inventory", "Spreadsheets", "Measuring time and cost", "Fixing bottlenecks", "Simple automation"], { level: "beginner" }),
  R("supply-chain-analyst", "Supply Chain Analyst", "Business & commerce", "Move goods from supplier to customer, well.", [
    ["Foundations", ["Supply chain basics", "Spreadsheets", "Key supply chain metrics"]],
    ["Planning", ["Forecasting demand", "Inventory planning", "Safety stock and reorder points"]],
    ["Buying and moving", ["Suppliers and buying", "Logistics", "Warehousing basics", "Cold chain for perishables?"]],
    ["Improve", ["Cost analysis", "Dashboards", "ERP basics?"]],
  ], { level: "intermediate" }),
  R("hr-executive", "HR / People Operations", "Business & commerce", "Hire, support and grow people.", ["Recruiting", "Interviewing", "Onboarding", "Labour law basics", "Payroll basics", "Employee engagement"], { level: "beginner" }),
  R("entrepreneur", "Entrepreneur", "Business & commerce", "Start and run something of your own.", [
    ["Find the problem", ["Finding a problem", "Talking to customers", "Looking at competitors"]],
    ["Build and test", ["Building a first version", "Testing with real customers", "No-code tools?"]],
    ["Money", ["Pricing", "Money and accounts", "Registering a business (Udyam, GST)?", "Funding options?"]],
    ["Grow", ["Selling", "Marketing on a small budget", "Hiring first people?"]],
  ], { level: "intermediate" }),

  // ---------- Design, media & social impact ----------
  R("ux-designer", "UX Designer", "Design, media & social impact", "Make products simple for real people.", ["Design principles", "User research", "Figma", "Flows and wireframes", "Usability testing", "Accessible design"], { rsh: "ux-design", level: "beginner" }),
  R("graphic-designer", "Graphic Designer", "Design, media & social impact", "Posters, brands and visuals that speak.", ["Design basics", "Typography", "Colour", "Canva", "Photoshop or Illustrator", "Building a portfolio"], { level: "beginner" }),
  R("content-writer", "Content Writer", "Design, media & social impact", "Words that make people read and act.", ["Plain writing", "Structure and editing", "Storytelling", "Writing for the web", "Portfolio"], { level: "beginner" }),
  R("journalist", "Journalist", "Design, media & social impact", "Find, check and tell true stories.", ["News writing", "Interviewing", "Fact-checking", "Data journalism", "Ethics and law"], { level: "beginner" }),
  R("video-editor", "Video Editor", "Design, media & social impact", "Turn raw clips into stories.", [
    ["Foundations", ["Storytelling for video", "Shooting basics on a phone", "Editing basics"]],
    ["Tools", ["Free editing apps (CapCut, DaVinci Resolve)", "Premiere Pro?", "File formats and export settings"]],
    ["Polish", ["Sound and music", "Colour correction", "Captions and subtitles", "Motion graphics?"]],
    ["Formats", ["Short-form video", "YouTube videos", "Copyright and music licences", "Building a showreel"]],
  ], { level: "beginner" }),
  R("teacher-trainer", "Teacher / Trainer", "Design, media & social impact", "Help people learn, in class or online.", [
    ["How learning works", ["How people learn", "Knowing your learners"]],
    ["Planning", ["Lesson planning", "Learning goals", "Activities"]],
    ["Teaching", ["Explaining clearly", "Managing a group", "Teaching in a local language?"]],
    ["Checking and improving", ["Checking understanding", "Giving feedback", "Teaching online", "Making short video lessons?"]],
  ], { level: "beginner" }),
  R("ngo-program-coordinator", "NGO Programme Coordinator", "Design, media & social impact", "Run programmes that change lives.", [
    ["Understand", ["How NGOs work in India", "Understanding the community", "Needs assessment"]],
    ["Plan and run", ["Programme planning", "Volunteers", "Budgets", "Partnerships with schools and local government?"]],
    ["Report", ["Measuring impact", "Reporting to donors", "Writing a funding proposal?", "Telling stories with photos and data"]],
    ["Rules", ["Compliance basics (FCRA, CSR)?", "Safeguarding and consent"]],
  ], { level: "beginner" }),
  R("research-analyst", "Research Analyst", "Design, media & social impact", "Answer hard questions with evidence.", [
    ["Plan", ["Asking a research question", "Desk research and sources", "Research design"]],
    ["Collect", ["Surveys", "Interviews", "Field work and consent"]],
    ["Analyse", ["Analysing data", "Qualitative coding", "Statistics basics", "Python or R?"]],
    ["Share", ["Writing a report", "Charts that explain", "Recommendations"]],
  ], { level: "intermediate" }),
  R("policy-analyst", "Public Policy Analyst", "Design, media & social impact", "Understand and improve public programmes.", [
    ["Foundations", ["How government works", "The Constitution and governance basics", "Reading policy"]],
    ["Evidence", ["Data on India", "Field research", "Programme evaluation", "Economics basics?"]],
    ["Communicate", ["Writing policy briefs", "Presenting", "Working with NGOs and local government?"]],
  ], { level: "intermediate" }),

  // ---------- Skills: tools ----------
  S("excel", "Excel", "Tools", "The tool every office runs on.", [
    ["Basics", ["Cells, ranges and tables", "Formulas", "Sorting and filtering"]],
    ["Core", ["Lookups (XLOOKUP, VLOOKUP)", "Pivot tables", "Charts", "Cleaning data"]],
    ["Next level", ["Simple dashboards", "Power Query?", "Macros?"]],
  ], { level: "beginner" }),
  S("google-sheets", "Google Sheets", "Tools", "Free, shareable spreadsheets for small teams.", [
    ["Basics", ["Basics and sharing", "Formulas", "Data validation"]],
    ["Core", ["Forms to Sheets", "Lookups", "Charts", "Pivot tables"]],
    ["Next level", ["Looker Studio dashboards?", "Automating with Apps Script?"]],
  ], { level: "beginner" }),
  S("power-bi", "Power BI", "Tools", "Interactive dashboards for business data.", [
    ["Get data in", ["Loading data", "Cleaning with Power Query"]],
    ["Model it", ["Data models and relationships", "DAX basics"]],
    ["Show it", ["Visuals", "Dashboard design", "Sharing reports", "Row-level security?"]],
  ], { level: "intermediate" }),
  S("canva", "Canva", "Tools", "Quick, good-looking designs for anything.", [
    ["Basics", ["Layouts", "Fonts and colours", "Brand kit"]],
    ["Make things", ["Social posts", "Posters", "Presentations", "Short videos?"]],
    ["Pro habits", ["Templates others can edit", "Exporting for print and web", "Canva for teams?"]],
  ], { level: "beginner" }),
  S("figma", "Figma", "Tools", "Design screens and prototypes together.", [
    ["Basics", ["Frames and layers", "Shapes, text and images", "Auto layout"]],
    ["Systems", ["Components and variants", "Styles and variables?"]],
    ["Share", ["Prototyping", "Comments and collaboration", "Design handoff", "Plugins?"]],
  ], { level: "beginner" }),
  S("tally-gst", "Tally & GST", "Tools", "Books and tax for Indian small businesses.", [
    ["Setup", ["Company setup", "Ledgers and groups"]],
    ["Daily work", ["Vouchers", "Inventory", "GST invoices", "Bank reconciliation?"]],
    ["Monthly", ["GST returns basics", "Reports", "Payroll in Tally?"]],
  ], { level: "beginner" }),
  S("git-github", "Git & GitHub", "Tools", "Save, share and collaborate on code.", [
    ["Basics", ["Commits", "Undoing mistakes", "Branches"]],
    ["Working together", ["Merging and conflicts", "GitHub", "Pull requests", "Code review"]],
    ["Beyond", ["GitHub Actions?", "Open source"]],
  ], { rsh: "git-github", level: "beginner" }),

  // ---------- Skills: coding ----------
  S("python", "Python", "Coding", "The friendliest first programming language.", [
    ["Basics", ["Setup and first program", "Variables and types", "Conditions and loops"]],
    ["Core", ["Lists and dictionaries", "Functions", "Files", "Errors and debugging"]],
    ["Use it", ["Libraries", "Small projects", "pandas for data?", "Web scraping?"]],
  ], { rsh: "python", level: "beginner" }),
  S("sql", "SQL", "Coding", "Ask questions of any database.", [
    ["Basics", ["SELECT and WHERE", "Sorting and filtering"]],
    ["Core", ["GROUP BY", "JOINs", "Subqueries"]],
    ["Next level", ["Designing tables", "Indexes?", "Window functions?"]],
  ], { rsh: "sql", level: "beginner" }),
  S("javascript", "JavaScript", "Coding", "The language of the web.", [
    ["Basics", ["Variables and types", "Functions", "Arrays and objects"]],
    ["In the browser", ["The DOM", "Events", "fetch and APIs", "async / await"]],
    ["Next level", ["Modules", "TypeScript?", "Node.js?"]],
  ], { rsh: "javascript", level: "beginner" }),
  S("react", "React", "Coding", "Build interfaces from components.", [
    ["Basics", ["Components", "JSX", "Props"]],
    ["Core", ["State", "Effects", "Forms", "Lists and keys"]],
    ["Apps", ["Routing", "Fetching data", "Next.js?", "State libraries?"]],
  ], { rsh: "react", level: "intermediate" }),
  S("prompt-engineering", "Prompt Engineering", "Coding", "Get useful, reliable results from AI.", [
    ["Basics", ["How AI models respond", "Clear instructions", "Giving context"]],
    ["Techniques", ["Examples in prompts", "Step-by-step reasoning", "Structured output"]],
    ["Use it well", ["Checking answers", "Safety and privacy", "Using AI APIs?"]],
  ], { rsh: "prompt-engineering", level: "beginner" }),

  // ---------- Skills: everyday ----------
  S("public-speaking", "Public Speaking", "Everyday skills", "Speak with confidence to any group.", [
    ["Prepare", ["Knowing your audience", "Structuring a talk", "Opening strong"]],
    ["Deliver", ["Voice and body", "Slides", "Managing nerves"]],
    ["Respond", ["Handling questions", "Practising", "Speaking in Hindi or a regional language?"]],
  ], { level: "beginner" }),
  S("communication", "Communication & Writing", "Everyday skills", "Emails, messages and reports that work.", [
    ["Basics", ["Plain language", "Knowing your reader"]],
    ["Everyday writing", ["Emails", "WhatsApp for work", "Meeting notes"]],
    ["Bigger pieces", ["Reports", "Giving feedback", "Presenting data?"]],
  ], { level: "beginner" }),
  S("problem-solving", "Problem Solving", "Everyday skills", "Break big problems into doable steps.", [
    ["Understand", ["Defining the problem", "Finding root causes"]],
    ["Decide", ["Generating options", "Deciding", "Estimating quickly?"]],
    ["Act", ["Testing small", "Learning from results"]],
  ], { level: "beginner" }),
  S("statistics", "Statistics", "Everyday skills", "Know when numbers really mean something.", [
    ["Describe", ["Averages", "Spread", "Charts for distributions"]],
    ["Chance", ["Probability", "Sampling"]],
    ["Decide", ["Correlation", "Testing ideas", "Regression basics?"]],
  ], { level: "beginner" }),
  S("interviewing", "Interviewing People", "Everyday skills", "Learn what people really need.", [
    ["Prepare", ["Preparing questions", "Ethics and consent"]],
    ["Conduct", ["Listening", "Follow-up questions", "Taking notes"]],
    ["Make sense", ["Finding patterns", "Sharing findings?"]],
  ], { level: "beginner" }),
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

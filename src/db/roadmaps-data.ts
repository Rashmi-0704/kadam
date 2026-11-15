// Kadam skill roadmaps: sections → topics → sub-topics, each with a short explainer and free resources.
// Structure inspired by roadmap.sh; all content written for Kadam.

export type ResourceType = "article" | "video" | "course" | "docs" | "tool";
export type Resource = { title: string; url: string; type: ResourceType };
export type Topic = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  resources: Resource[];
  optional?: boolean;
  children?: Topic[];
};
export type Section = { title: string; topics: Topic[] };
export type RoadmapData = { role: string; title: string; summary: string; sections: Section[] };

/** Kept for older code paths: a topic flattened into a list. */
export type RoadmapStep = Topic & { order: number; prerequisites: string[] };

export const art = (title: string, url: string): Resource => ({ title, url, type: "article" });
export const docs = (title: string, url: string): Resource => ({ title, url, type: "docs" });
export const course = (title: string, url: string): Resource => ({ title, url, type: "course" });
export const tool = (title: string, url: string): Resource => ({ title, url, type: "tool" });
export const vid = (query: string): Resource => ({ title: `Video lessons: ${query}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, type: "video" });

const t = (id: string, title: string, description: string, skills: string[], resources: Resource[], children?: Topic[], optional?: boolean): Topic => ({
  id, title, description, skills, resources, ...(children ? { children } : {}), ...(optional ? { optional } : {}),
});
const s = (id: string, title: string, description: string, skills: string[] = [], resources: Resource[] = [], optional?: boolean): Topic => t(id, title, description, skills, resources, undefined, optional);

/** Every topic and sub-topic in reading order. */
export function flattenTopics(sections: Section[]): Topic[] {
  return sections.flatMap((sec) => sec.topics.flatMap((tp) => [tp, ...(tp.children ?? [])]));
}

/** Accepts the current shape ({ sections }) or the older flat list of steps. */
export function normalizeSections(raw: unknown): Section[] {
  if (raw && typeof raw === "object" && !Array.isArray(raw) && Array.isArray((raw as { sections?: unknown }).sections)) return (raw as { sections: Section[] }).sections;
  if (Array.isArray(raw)) {
    if (raw.length && (raw[0] as Section).topics) return raw as Section[];
    return [{ title: "Steps", topics: (raw as Topic[]).map((x) => ({ id: x.id, title: x.title, description: x.description ?? "", skills: x.skills ?? [], resources: (x.resources ?? []).map((r) => ({ ...r, type: r.type ?? "article" })) })) }];
  }
  return [];
}

const KHAN_STATS = "https://www.khanacademy.org/math/statistics-probability";
const SHEETS = "https://support.google.com/docs/topic/9054603";
const EXCEL = "https://support.microsoft.com/en-us/excel";

export const SEEDED_ROADMAPS: RoadmapData[] = [
  {
    role: "data-analyst",
    title: "Data Analyst",
    summary: "Turn messy numbers into clear answers that help a business decide what to do next.",
    sections: [
      {
        title: "Foundations",
        topics: [
          t("da-intro", "What analysts do", "Analysts collect data, clean it, find patterns and explain them in plain words. The goal is always a decision: what to stock, whom to call, where to spend.", ["data"], [art("What does a data analyst do?", "https://www.coursera.org/articles/what-does-a-data-analyst-do-a-career-guide")], [
            s("da-intro-q", "Asking good questions", "Start from the decision the owner needs to make, not from the data you happen to have."),
            s("da-intro-types", "Four kinds of analysis", "Describe what happened, diagnose why, predict what will happen, and recommend what to do."),
          ]),
          t("da-sheets", "Spreadsheets", "Most small businesses already keep data in a sheet. Get fast at formulas, sorting, filters and pivot tables before anything else.", ["excel", "google sheets", "pivot tables"], [docs("Google Sheets help", SHEETS), docs("Excel help & learning", EXCEL), vid("google sheets for beginners")], [
            s("da-sheets-formulas", "Everyday formulas", "SUM, AVERAGE, COUNTIF, IF and text clean-up formulas.", ["excel"]),
            s("da-sheets-lookup", "Lookups", "Join two tables with XLOOKUP or VLOOKUP.", ["excel"]),
            s("da-sheets-pivot", "Pivot tables", "Summarise thousands of rows by month, item or customer in seconds.", ["pivot tables"]),
            s("da-sheets-charts", "Basic charts", "Line for trends, bar for comparisons. Keep it simple.", ["data visualisation"]),
          ]),
          t("da-stats", "Statistics you will use", "Averages, spread, percentages, trends and simple probability — enough to know when a change is real.", ["statistics"], [course("Khan Academy: Statistics and probability", KHAN_STATS)], [
            s("da-stats-central", "Mean, median, mode", "Which 'average' to use when a few big orders skew the numbers."),
            s("da-stats-spread", "Spread and outliers", "Range, standard deviation, and spotting odd values."),
            s("da-stats-corr", "Correlation is not cause", "Two things moving together doesn't mean one causes the other."),
          ]),
        ],
      },
      {
        title: "Working with data",
        topics: [
          t("da-sql", "SQL", "The language for asking questions of databases. Most companies expect it.", ["sql"], [course("SQLBolt interactive lessons", "https://sqlbolt.com/"), vid("SQL for beginners")], [
            s("da-sql-select", "SELECT and WHERE", "Pull the rows and columns you need."),
            s("da-sql-group", "GROUP BY", "Totals and averages by category."),
            s("da-sql-join", "JOINs", "Combine orders with customers or products."),
          ]),
          t("da-clean", "Cleaning data", "Real data is messy: typos, blanks, duplicates, dates in five formats. Cleaning is most of the job.", ["data cleaning"], [vid("data cleaning in google sheets")], [
            s("da-clean-missing", "Missing values", "Decide whether to fill, flag or drop them."),
            s("da-clean-dupes", "Duplicates", "Find and remove repeated rows safely."),
            s("da-clean-format", "Consistent formats", "One date format, one spelling per item."),
          ]),
          t("da-python", "Python for analysis", "When sheets get slow, Python and pandas handle bigger data and repeatable steps.", ["python", "pandas"], [docs("Python tutorial", "https://docs.python.org/3/tutorial/"), docs("pandas getting started", "https://pandas.pydata.org/docs/getting_started/intro_tutorials/")], [
            s("da-python-pandas", "pandas basics", "Load a CSV, filter, group and save.", ["pandas"]),
            s("da-python-notebooks", "Notebooks", "Work step by step in Jupyter or Google Colab.", ["python"], [tool("Google Colab", "https://colab.research.google.com/")]),
          ], true),
        ],
      },
      {
        title: "Telling the story",
        topics: [
          t("da-viz", "Charts that explain", "Pick the right chart, remove clutter, and write a title that states the finding.", ["data visualisation"], [art("Storytelling with Data blog", "https://www.storytellingwithdata.com/blog")], [
            s("da-viz-choose", "Choosing a chart", "Trend, comparison, part-of-whole, distribution."),
            s("da-viz-declutter", "Decluttering", "Fewer colours, direct labels, no 3D."),
          ]),
          t("da-dash", "Dashboards", "A one-screen view an owner can read on a phone every week.", ["dashboard", "looker studio", "power bi"], [docs("Looker Studio help", "https://support.google.com/looker-studio"), docs("Power BI learning", "https://learn.microsoft.com/en-us/training/powerplatform/power-bi")], [
            s("da-dash-looker", "Looker Studio", "Free and works straight from Google Sheets.", ["looker studio"]),
            s("da-dash-powerbi", "Power BI", "Common in larger companies.", ["power bi"], [], true),
          ]),
          t("da-forecast", "Forecasting basics", "Moving averages and weekly patterns are enough to plan stock or cooking quantities.", ["forecasting"], [course("Forecasting: Principles and Practice", "https://otexts.com/fpp3/")], undefined, true),
          t("da-prove", "Prove it on a real problem", "Take up a data problem on Kadam, deliver it, and let the business's results become your impact report.", [], []),
        ],
      },
    ],
  },
  {
    role: "frontend-developer",
    title: "Frontend Developer",
    summary: "Build websites and apps that work well on any phone, for every kind of user.",
    sections: [
      {
        title: "The web platform",
        topics: [
          t("fe-html", "HTML", "The structure of every page. Use the right element for the job — it helps search engines and screen readers.", ["html"], [docs("MDN: HTML basics", "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics")], [
            s("fe-html-semantic", "Semantic elements", "header, nav, main, button — not div for everything."),
            s("fe-html-forms", "Forms", "Labels, input types, and validation that helps people."),
          ]),
          t("fe-css", "CSS", "Layout, spacing, colour and type. Learn to build layouts that adapt from phone to laptop.", ["css"], [docs("MDN: CSS layout", "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout"), course("web.dev: Learn CSS", "https://web.dev/learn/css")], [
            s("fe-css-flex", "Flexbox", "One-direction layouts like toolbars and cards."),
            s("fe-css-grid", "Grid", "Two-direction page layouts."),
            s("fe-css-responsive", "Responsive design", "Design for small screens first, then add space."),
          ]),
          t("fe-js", "JavaScript", "Make pages interactive: respond to clicks, fetch data, update the screen.", ["javascript"], [course("javascript.info", "https://javascript.info/")], [
            s("fe-js-dom", "The DOM", "Find and change elements on the page."),
            s("fe-js-fetch", "fetch and JSON", "Load data from an API."),
            s("fe-js-async", "async / await", "Wait for slow things without freezing the page."),
          ]),
        ],
      },
      {
        title: "Tools of the trade",
        topics: [
          t("fe-git", "Git and GitHub", "Save versions of your work, undo mistakes, and collaborate.", ["git", "github"], [docs("Pro Git book", "https://git-scm.com/book/en/v2")]),
          t("fe-react", "React", "Build interfaces from reusable components.", ["react"], [docs("react.dev: Learn", "https://react.dev/learn")], [
            s("fe-react-components", "Components and props", "Small pieces you can reuse."),
            s("fe-react-state", "State", "Data that changes as people use the page."),
          ]),
          t("fe-vue", "Vue or Svelte", "Popular alternatives to React. Learn one framework well first.", ["vue"], [docs("Vue guide", "https://vuejs.org/guide/introduction.html")], undefined, true),
        ],
      },
      {
        title: "Quality",
        topics: [
          t("fe-a11y", "Accessibility", "Everyone should be able to use your site — with a screen reader, a keyboard or a slow phone.", ["accessibility"], [course("web.dev: Learn Accessibility", "https://web.dev/learn/accessibility")]),
          t("fe-perf", "Performance on budget phones", "Small pages and compressed images load fast on 4G.", ["performance"], [course("web.dev: Learn Performance", "https://web.dev/learn/performance")]),
          t("fe-deploy", "Deploy your site", "Put a project online for free and share the link.", ["deployment"], [docs("Vercel docs", "https://vercel.com/docs"), docs("GitHub Pages", "https://pages.github.com/")]),
          t("fe-prove", "Ship for a real business", "Build or fix a site for a Kadam business and measure what changes.", [], []),
        ],
      },
    ],
  },
  {
    role: "digital-marketer",
    title: "Digital Marketer",
    summary: "Help small businesses find customers, keep them, and grow without big budgets.",
    sections: [
      {
        title: "Basics",
        topics: [
          t("dm-basics", "Marketing fundamentals", "Who is the customer, what problem do you solve for them, and why should they pick you?", ["marketing"], [course("Google Digital Garage", "https://learndigital.withgoogle.com/digitalgarage")], [
            s("dm-basics-customer", "Customer research", "Talk to ten customers before spending a rupee."),
            s("dm-basics-offer", "Offers", "Trials, bundles and referral rewards."),
            s("dm-basics-funnel", "The funnel", "Notice → try → buy → come back → tell friends."),
          ]),
          t("dm-local", "Local reach", "For small shops, the nearest customers matter most.", ["whatsapp", "google business profile"], [docs("WhatsApp Business", "https://business.whatsapp.com/"), docs("Google Business Profile help", "https://support.google.com/business")], [
            s("dm-local-wa", "WhatsApp Business", "Catalogue, quick replies and broadcast lists.", ["whatsapp"]),
            s("dm-local-gbp", "Google Business Profile", "Show up on Maps with photos and reviews.", ["google business profile"]),
          ]),
        ],
      },
      {
        title: "Channels",
        topics: [
          t("dm-social", "Social media content", "Plan posts and reels that people want to share.", ["instagram", "social media", "canva"], [course("Meta Blueprint", "https://www.facebook.com/business/learn"), tool("Canva", "https://www.canva.com/")], [
            s("dm-social-calendar", "Content calendar", "Plan a month of posts in one sitting."),
            s("dm-social-reels", "Short video", "Hook in the first two seconds."),
          ]),
          t("dm-seo", "SEO basics", "Help people find the business when they search on Google.", ["seo"], [docs("Google SEO starter guide", "https://developers.google.com/search/docs/fundamentals/seo-starter-guide")]),
          t("dm-ads", "Paid ads", "Small, well-targeted ad tests on Meta or Google.", ["ads"], [course("Google Skillshop", "https://skillshop.withgoogle.com/")], undefined, true),
          t("dm-email", "Email and SMS", "Cheap ways to bring customers back.", ["email marketing"], [course("HubSpot Academy", "https://academy.hubspot.com/")], undefined, true),
        ],
      },
      {
        title: "Measure and improve",
        topics: [
          t("dm-measure", "Measuring results", "Track trials, sign-ups, repeat orders and cost per customer.", ["analytics", "google analytics"], [course("Google Analytics training", "https://skillshop.withgoogle.com/")], [
            s("dm-measure-sheet", "A simple tracking sheet", "One row per customer, one column per step."),
            s("dm-measure-test", "A/B tests", "Change one thing at a time and compare."),
          ]),
          t("dm-prove", "Run a campaign for a real business", "Take up a marketing problem on Kadam and report the numbers.", [], []),
        ],
      },
    ],
  },
  {
    role: "ux-designer",
    title: "UX Designer",
    summary: "Make products simple and pleasant for the people who actually use them.",
    sections: [
      {
        title: "Understand people",
        topics: [
          t("ux-principles", "Design principles", "Hierarchy, contrast, spacing and well-known rules of thumb.", ["design"], [art("Laws of UX", "https://lawsofux.com/")]),
          t("ux-research", "User research", "Interview and observe users to learn what they really need.", ["user research"], [art("NN/g articles", "https://www.nngroup.com/articles/")], [
            s("ux-research-interview", "Interviews", "Ask about past behaviour, not opinions."),
            s("ux-research-observe", "Observation", "Watch people do the task in real life."),
            s("ux-research-personas", "Personas", "Summarise who you're designing for.", [], [], true),
          ]),
        ],
      },
      {
        title: "Design",
        topics: [
          t("ux-figma", "Figma", "The most common design tool. Free for students.", ["figma"], [docs("Figma Learn", "https://help.figma.com/hc/en-us")], [
            s("ux-figma-autolayout", "Auto layout", "Designs that resize like real screens."),
            s("ux-figma-components", "Components", "Reusable buttons, cards and inputs."),
          ]),
          t("ux-flows", "Flows and wireframes", "Sketch the steps before polishing screens.", ["wireframe"], [art("NN/g: Wireflows", "https://www.nngroup.com/articles/wireflows/")]),
          t("ux-proto", "Prototypes", "Clickable mock-ups you can test with people.", ["prototype"], [vid("figma prototyping tutorial")]),
        ],
      },
      {
        title: "Test and include",
        topics: [
          t("ux-testing", "Usability testing", "Watch five people use your design and fix what trips them up.", ["usability"], [art("Usability Testing 101", "https://www.nngroup.com/articles/usability-testing-101/")]),
          t("ux-a11y", "Accessible design", "Colour contrast, large text and designs for first-time digital users.", ["accessibility"], [docs("W3C WAI fundamentals", "https://www.w3.org/WAI/fundamentals/")]),
          t("ux-prove", "Redesign for a real business", "Improve a screen or process for a Kadam business and measure the change.", [], []),
        ],
      },
    ],
  },
  {
    role: "content-writer",
    title: "Content Writer",
    summary: "Write clear words that make people read, trust and act.",
    sections: [
      {
        title: "Craft",
        topics: [
          t("cw-plain", "Plain writing", "Short sentences, active voice, one idea at a time.", ["writing"], [docs("Plain language guidelines", "https://www.plainlanguage.gov/guidelines/")]),
          t("cw-edit", "Structure and editing", "Outline first, then cut everything that isn't needed.", ["editing"], [course("Google Technical Writing courses", "https://developers.google.com/tech-writing")], [
            s("cw-edit-outline", "Outlines", "Plan the headings before writing."),
            s("cw-edit-cut", "Cutting", "Remove a third of your first draft."),
          ]),
          t("cw-story", "Storytelling", "A person, a problem, a change — and a clear ask at the end.", ["storytelling"], [art("The Moth: storytelling tips", "https://themoth.org/share-your-story/storytelling-tips-tricks")]),
        ],
      },
      {
        title: "Formats",
        topics: [
          t("cw-web", "Writing for the web", "Headlines, scannable pages and SEO basics.", ["seo", "copywriting"], [docs("Google SEO starter guide", "https://developers.google.com/search/docs/fundamentals/seo-starter-guide")], [
            s("cw-web-headlines", "Headlines", "Promise one clear benefit."),
            s("cw-web-scan", "Scannable pages", "Short paragraphs, lists and subheadings."),
          ]),
          t("cw-social", "Social and WhatsApp copy", "Say it in two lines.", ["copywriting"], [vid("copywriting for social media")], undefined, true),
          t("cw-portfolio", "Build a portfolio", "Publish 3–5 pieces that show range — including one for a real organisation via Kadam.", ["portfolio"], []),
        ],
      },
    ],
  },
  {
    role: "business-analyst",
    title: "Business Analyst",
    summary: "Understand how a business works today and design a better way.",
    sections: [
      {
        title: "Understand the business",
        topics: [
          t("ba-money", "How businesses make money", "Revenue, costs, margins and cash flow.", ["business basics"], [course("Khan Academy: Core finance", "https://www.khanacademy.org/economics-finance-domain/core-finance")]),
          t("ba-stake", "Talking to stakeholders", "Ask good questions, listen, and write down what people need.", ["requirements", "stakeholder"], [art("Atlassian: Product requirements", "https://www.atlassian.com/agile/product-management/requirements")], [
            s("ba-stake-interview", "Interviews", "Ask how things happen today, step by step."),
            s("ba-stake-req", "Requirements", "Write what must be true when the problem is solved."),
          ]),
        ],
      },
      {
        title: "Analyse",
        topics: [
          t("ba-process", "Process mapping", "Draw today's process and find the slow, costly or error-prone steps.", ["process mapping", "process"], [art("What is process mapping", "https://www.lucidchart.com/pages/process-mapping")], [
            s("ba-process-asis", "As-is map", "How it works now, honestly."),
            s("ba-process-tobe", "To-be map", "How it should work."),
          ]),
          t("ba-sheets", "Spreadsheets for analysis", "Clean data and build simple what-if models.", ["excel", "google sheets"], [docs("Excel help & learning", EXCEL)]),
          t("ba-sql", "SQL basics", "Pull the numbers you need yourself.", ["sql"], [course("SQLBolt", "https://sqlbolt.com/")], undefined, true),
        ],
      },
      {
        title: "Recommend",
        topics: [
          t("ba-present", "Recommend and present", "A one-page proposal with options, costs and a clear choice.", ["presentation"], [vid("how to write a one page proposal")]),
          t("ba-prove", "Improve a real process", "Take up an operations problem on Kadam and measure time or money saved.", [], []),
        ],
      },
    ],
  },
  {
    role: "financial-analyst",
    title: "Financial Analyst",
    summary: "Help a business understand its money and plan ahead.",
    sections: [
      {
        title: "Foundations",
        topics: [
          t("fa-acct", "Accounting basics", "Income, expenses, assets and the three statements.", ["accounting"], [course("AccountingCoach", "https://www.accountingcoach.com/")], [
            s("fa-acct-pl", "Profit and loss", "What came in, what went out."),
            s("fa-acct-bs", "Balance sheet", "What the business owns and owes."),
            s("fa-acct-cash", "Cash flow", "Profit isn't cash — timing matters."),
          ]),
          t("fa-gst", "GST and compliance", "What a small business must file, and when.", ["gst"], [docs("CBIC GST portal", "https://cbic-gst.gov.in/")], undefined, true),
        ],
      },
      {
        title: "Analysis",
        topics: [
          t("fa-cost", "Costing", "Fixed and variable costs, unit cost and break-even.", ["costing"], [course("Khan Academy: Core finance", "https://www.khanacademy.org/economics-finance-domain/core-finance")], [
            s("fa-cost-unit", "Unit cost", "What one product really costs to make."),
            s("fa-cost-breakeven", "Break-even", "How many you must sell to cover costs."),
          ]),
          t("fa-model", "Spreadsheet models", "Build a clean model others can follow and change.", ["excel", "financial modelling"], [art("CFI: Financial modelling", "https://corporatefinanceinstitute.com/resources/financial-modeling/")]),
          t("fa-pricing", "Pricing", "Prices that cover costs and still sell.", ["pricing"], [vid("pricing strategy small business")]),
        ],
      },
      {
        title: "Communicate",
        topics: [
          t("fa-present", "Explain the numbers", "Plain words and one chart per message.", ["presentation"], []),
          t("fa-prove", "Fix a real business's numbers", "Take up a finance problem on Kadam.", [], []),
        ],
      },
    ],
  },
  {
    role: "journalist",
    title: "Journalist",
    summary: "Find true stories, check them carefully, and tell them well.",
    sections: [
      {
        title: "Reporting",
        topics: [
          t("jn-news", "News writing", "Lead with what matters most, attribute every claim.", ["writing"], [course("Google News Initiative training", "https://newsinitiative.withgoogle.com/resources/trainings/")], [
            s("jn-news-lead", "Leads", "Who, what, where, when — in one sentence."),
            s("jn-news-attrib", "Attribution", "Say who told you."),
          ]),
          t("jn-interview", "Interviewing", "Prepare, listen, follow up, and record accurately.", ["interview"], [vid("journalism interview techniques")]),
          t("jn-fact", "Fact-checking", "Verify claims, photos and numbers before publishing.", ["fact-check"], [art("IFCN at Poynter", "https://www.poynter.org/ifcn/")]),
        ],
      },
      {
        title: "Specialise",
        topics: [
          t("jn-data", "Data journalism", "Find stories in spreadsheets and public data.", ["data", "excel"], [art("Data Journalism Handbook", "https://datajournalism.com/read/handbook/one")]),
          t("jn-ethics", "Ethics and law", "Consent, privacy and defamation basics.", ["media ethics"], []),
          t("jn-multi", "Audio and video", "Podcasts and short video reports.", ["video editing"], [vid("mobile journalism basics")], undefined, true),
          t("jn-prove", "Publish a real story", "Report a local story, or tell an NGO's story on Kadam.", [], []),
        ],
      },
    ],
  },
];

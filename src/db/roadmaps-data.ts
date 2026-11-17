import { EXTRA_ROADMAPS } from "./roadmaps/index.ts";
// Kadam skill roadmaps: sections → topics → sub-topics, each with a short explainer and free resources.
// Structure inspired by roadmap.sh; all content written for Kadam.

// "docs" is shown as "Guide" in the UI.
export type ResourceType = "article" | "video" | "course" | "docs" | "tool";
/** A free resource. `url` must be a real, well-known page; when unsure, use a search URL built from `search` instead of inventing one. */
export type Resource = { title: string; url: string; type: ResourceType; search?: string };
export type TopicLevel = "recommended" | "optional" | "alternative";
export type Topic = {
  id: string;
  title: string;
  /** 2–4 sentence explainer, in Kadam's own words. */
  description: string;
  skills: string[];
  resources: Resource[];
  /** Older flag; prefer `level`. */
  optional?: boolean;
  level?: TopicLevel;
  /** Why this matters for the role (one sentence). */
  why?: string;
  /** Rough time to get comfortable, e.g. "1 week", "3–5 days". */
  time?: string;
  /** A small practice task. */
  practice?: string;
  /** Kadam problem types (see PROBLEM_TYPES in taxonomy.ts) that build this skill. */
  problemTypes?: string[];
  children?: Topic[];
};
export type Section = { title: string; topics: Topic[] };
export type RoadmapIntro = {
  /** What the role does, 2–3 sentences. */
  does: string;
  /** Typical first jobs in India. */
  firstJobs: string[];
  /** Only when a reliable public source exists. */
  salary?: { range: string; source: string; url: string };
  /** How solving Kadam problems helps for this role. */
  kadam: string;
};
export type RoadmapData = {
  role: string;
  title: string;
  summary: string;
  sections: Section[];
  intro?: RoadmapIntro;
  /** roadmap.sh pages confirmed to exist, e.g. ["frontend"] → https://roadmap.sh/frontend. Linked with credit, never copied. */
  rsh?: string[];
};

/** Kept for older code paths: a topic flattened into a list. */
export type RoadmapStep = Topic & { order: number; prerequisites: string[] };

export const art = (title: string, url: string): Resource => ({ title, url, type: "article" });
export const docs = (title: string, url: string): Resource => ({ title, url, type: "docs" });
export const course = (title: string, url: string): Resource => ({ title, url, type: "course" });
export const tool = (title: string, url: string): Resource => ({ title, url, type: "tool" });
/** YouTube search results for `query` (never a guessed video link). */
export const vid = (query: string): Resource => ({ title: `Video lessons: ${query}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, type: "video", search: query });
/** Google search results for `query`, for when no single well-known page fits. */
export const web = (title: string, query: string): Resource => ({ title, url: `https://www.google.com/search?q=${encodeURIComponent(query)}`, type: "article", search: query });

type Opts = {
  skills?: string[];
  res?: Resource[];
  why?: string;
  time?: string;
  practice?: string;
  pt?: string[];
  level?: TopicLevel;
  kids?: Topic[];
};

/** A topic. `optional` is also set for non-recommended levels so older code that reads it still works. */
const T = (id: string, title: string, description: string, o: Opts = {}): Topic => {
  const level = o.level ?? "recommended";
  return {
    id, title, description,
    skills: o.skills ?? [],
    resources: o.res ?? [],
    level,
    ...(level !== "recommended" ? { optional: true } : {}),
    ...(o.why ? { why: o.why } : {}),
    ...(o.time ? { time: o.time } : {}),
    ...(o.practice ? { practice: o.practice } : {}),
    ...(o.pt ? { problemTypes: o.pt } : {}),
    ...(o.kids ? { children: o.kids } : {}),
  };
};
/** A sub-topic: explainer, time and level at minimum. */
const S = (id: string, title: string, description: string, time: string, o: Omit<Opts, "kids" | "time"> = {}): Topic => T(id, title, description, { ...o, time });

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

/** A topic's level, reading the older `optional` flag when `level` is missing (AI roadmaps cached in the old shape). */
export const levelOf = (x: Pick<Topic, "level" | "optional">): TopicLevel => x.level ?? (x.optional ? "optional" : "recommended");

/** The roadmap.sh credit base URL. */
export const RSH_BASE = "https://roadmap.sh/";

// Shared, well-known free resources.
const KHAN_STATS = "https://www.khanacademy.org/math/statistics-probability";
const KHAN_FIN = "https://www.khanacademy.org/economics-finance-domain/core-finance";
const SHEETS = "https://support.google.com/docs/topic/9054603";
const EXCEL = "https://support.microsoft.com/en-us/excel";
const SEO_GUIDE = "https://developers.google.com/search/docs/fundamentals/seo-starter-guide";
const SALARY_SRC = "AmbitionBox (self-reported salaries, checked Nov 2026)";

const DATA_ANALYST: RoadmapData = {
  role: "data-analyst",
  title: "Data Analyst",
  summary: "Turn messy numbers into clear answers that help a business decide what to do next.",
  rsh: ["data-analyst", "sql"],
  intro: {
    does: "A data analyst collects data, cleans it, finds patterns and explains them in plain words. The work always ends in a decision: what to stock, whom to call back, where to spend the next rupee.",
    firstJobs: ["Junior Data Analyst", "MIS Executive", "Business / Reporting Analyst", "Operations Analyst", "Analyst in a bank, e-commerce or consulting firm"],
    salary: { range: "About ₹4.3 lakh a year on average with under 1 year's experience, about ₹5.5 lakh at 1–3 years", source: SALARY_SRC, url: "https://www.ambitionbox.com/profile/data-analyst-salary" },
    kadam: "Small businesses on Kadam share real sales registers, stock sheets and order lists. Cleaning one and giving the owner a weekly dashboard is real analyst work, and the impact report shows what changed because of it.",
  },
  sections: [
    {
      title: "Foundations",
      topics: [
        T("da-intro", "What analysts do", "Analysts turn raw records into answers. You start with a question from the business, find the data that can answer it, check that the data is right, and explain the result in a way the owner can act on.", {
          skills: ["data"], why: "If you know what the decision is, you won't waste days on charts nobody needs.", time: "2–3 days",
          res: [art("What does a data analyst do? (Coursera)", "https://www.coursera.org/articles/what-does-a-data-analyst-do-a-career-guide"), vid("what does a data analyst do day in the life")],
          practice: "Pick a shop you know. Write three questions its owner would want answered from their sales data.",
          pt: ["data", "research"],
          kids: [
            S("da-intro-q", "Asking good questions", "Start from the decision the owner needs to make, not from the data you happen to have. A good question is specific: 'Which 10 items sell out before Saturday?' is better than 'Analyse sales'.", "1 day"),
            S("da-intro-types", "Four kinds of analysis", "Descriptive (what happened), diagnostic (why), predictive (what will happen) and prescriptive (what to do). Most entry-level work is the first two, done well.", "1 day"),
          ],
        }),
        T("da-sheets", "Spreadsheets", "Most small businesses already keep their data in Excel or Google Sheets. Getting fast at formulas, filters and pivot tables lets you answer most questions without any other tool. It is also the skill most interviews test first.", {
          skills: ["excel", "google sheets", "pivot tables"], why: "Almost every analyst job and every small business uses spreadsheets every day.", time: "2–3 weeks",
          res: [docs("Google Sheets help", SHEETS), docs("Excel help & learning (Microsoft)", EXCEL), vid("google sheets for beginners")],
          practice: "Type one month of made-up shop sales (date, item, quantity, price) into a sheet and find the top 5 items by revenue.",
          pt: ["data", "operations"],
          kids: [
            S("da-sheets-formulas", "Everyday formulas", "SUM, AVERAGE, COUNTIF, SUMIF, IF and text clean-up formulas like TRIM and PROPER. These cover most daily work.", "4–5 days", { skills: ["excel"] }),
            S("da-sheets-lookup", "Lookups", "Join two tables with XLOOKUP or VLOOKUP, for example to bring the item price from a price list into a sales sheet.", "2–3 days", { skills: ["excel"], res: [docs("XLOOKUP function (Microsoft)", "https://support.microsoft.com/en-us/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929")] }),
            S("da-sheets-pivot", "Pivot tables", "Summarise thousands of rows by month, item or customer in seconds, without writing a formula.", "2–3 days", { skills: ["pivot tables"], res: [docs("Create a PivotTable (Microsoft)", "https://support.microsoft.com/en-us/office/create-a-pivottable-to-analyze-worksheet-data-a9a84538-bfe9-40a9-a8e9-f99134456576"), docs("Pivot tables in Google Sheets", "https://support.google.com/docs/answer/1272900")] }),
            S("da-sheets-charts", "Basic charts", "Line charts for trends over time, bar charts for comparing items. Keep it simple and label it clearly.", "1–2 days", { skills: ["data visualisation"] }),
          ],
        }),
        T("da-stats", "Statistics you will use", "You don't need advanced maths. You need averages, spread, percentages and a feel for when a change is real and when it is just noise. This keeps you from telling an owner that sales 'jumped' when it was one big order.", {
          skills: ["statistics"], why: "Wrong conclusions from numbers cost businesses money; basic statistics protects you from them.", time: "2–3 weeks",
          res: [course("Khan Academy: Statistics and probability", KHAN_STATS), vid("statistics for data analysts beginners")],
          practice: "For 30 days of sales figures, find the mean, median and the two days that look unusual. Explain why in two lines.",
          pt: ["data", "research"],
          kids: [
            S("da-stats-central", "Mean, median, mode", "Which 'average' to use when a few big orders skew the numbers. Median is often the honest choice for sales and incomes.", "2 days"),
            S("da-stats-spread", "Spread and outliers", "Range, standard deviation and how to spot values that don't fit. Outliers are sometimes mistakes and sometimes the most important story.", "3 days"),
            S("da-stats-pct", "Percentages and growth", "Percentage change, percentage points, and month-on-month vs year-on-year. Easy to get wrong, and checked in every interview.", "2 days"),
            S("da-stats-corr", "Correlation is not cause", "Two things moving together doesn't mean one causes the other. Rain and tea sales may both rise in July for different reasons.", "1–2 days"),
          ],
        }),
      ],
    },
    {
      title: "Working with data",
      topics: [
        T("da-sql", "SQL", "SQL is how you ask questions of a database: 'show me all orders above ₹500 from last month'. Most companies keep their data in databases, so SQL is expected in almost every analyst interview.", {
          skills: ["sql"], why: "It is the most-asked technical skill for analyst jobs in India.", time: "3–4 weeks",
          res: [course("SQLBolt interactive lessons", "https://sqlbolt.com/"), course("Kaggle: Intro to SQL", "https://www.kaggle.com/learn/intro-to-sql"), docs("W3Schools SQL tutorial", "https://www.w3schools.com/sql/")],
          practice: "Load a small sales table into a free online SQL editor and write queries for: total sales per month, top 5 customers, and items never sold.",
          pt: ["data", "tech_build"],
          kids: [
            S("da-sql-select", "SELECT and WHERE", "Pull only the rows and columns you need, and filter by dates, amounts or names.", "3–4 days"),
            S("da-sql-group", "GROUP BY", "Totals, counts and averages by category, month or customer. The SQL version of a pivot table.", "3–4 days"),
            S("da-sql-join", "JOINs", "Combine tables, for example orders with customers or products. Learn INNER and LEFT JOIN first.", "1 week"),
            S("da-sql-sub", "Subqueries and CTEs", "Break a long question into steps with WITH. Useful once the basics feel easy.", "1 week", { level: "optional" }),
          ],
        }),
        T("da-clean", "Cleaning data", "Real data is messy: spelling mistakes, blanks, duplicates and dates in five formats. Cleaning is often most of the job, and doing it carefully is what makes your results trustworthy.", {
          skills: ["data cleaning"], why: "A wrong total from dirty data loses an owner's trust faster than anything else.", time: "1–2 weeks",
          res: [course("Kaggle: Data Cleaning", "https://www.kaggle.com/learn/data-cleaning"), vid("data cleaning in google sheets"), vid("data cleaning in excel")],
          practice: "Take a messy list (for example 50 customer names and phone numbers typed by hand) and make it clean: one format, no duplicates, blanks flagged.",
          pt: ["data", "operations"],
          kids: [
            S("da-clean-missing", "Missing values", "Decide whether to fill, flag or drop them, and write down what you chose so others know.", "2 days"),
            S("da-clean-dupes", "Duplicates", "Find and remove repeated rows safely, without deleting real repeat orders.", "1–2 days"),
            S("da-clean-format", "Consistent formats", "One date format, one spelling per item, numbers stored as numbers.", "2 days"),
          ],
        }),
        T("da-python", "Python for analysis", "When sheets get slow or you repeat the same steps every week, Python with the pandas library handles bigger data and automates the work. Many analyst roles list it as a plus, not a must.", {
          skills: ["python", "pandas"], level: "optional", why: "It lets you handle larger data and repeat a report in one click; it often decides between two equal candidates.", time: "4–6 weeks",
          res: [docs("Python tutorial (official)", "https://docs.python.org/3/tutorial/"), course("Kaggle: Pandas", "https://www.kaggle.com/learn/pandas"), docs("pandas getting started", "https://pandas.pydata.org/docs/getting_started/intro_tutorials/")],
          practice: "In Google Colab, load a CSV of sales, group it by month and plot the trend.",
          pt: ["data", "tech_build"],
          kids: [
            S("da-python-pandas", "pandas basics", "Load a CSV, filter rows, group and summarise, and save the result.", "2–3 weeks", { skills: ["pandas"] }),
            S("da-python-notebooks", "Notebooks", "Work step by step in Jupyter or Google Colab, with notes beside your code.", "2 days", { skills: ["python"], res: [tool("Google Colab", "https://colab.research.google.com/")] }),
          ],
        }),
      ],
    },
    {
      title: "Analysing for decisions",
      topics: [
        T("da-metrics", "Business metrics", "Every business tracks a few numbers that tell it whether things are going well: revenue, repeat customers, average order value, stock turns. Knowing which numbers matter to which business is what makes your analysis useful.", {
          skills: ["kpi", "analytics"], why: "Owners care about a handful of numbers; analysts who track the right ones get listened to.", time: "1 week",
          res: [art("KPIs explained (Investopedia)", "https://www.investopedia.com/terms/k/kpi.asp"), vid("business metrics for data analysts")],
          practice: "For a tiffin service, list five numbers the owner should check every week and how you would calculate each from an order sheet.",
          pt: ["data", "finance", "operations"],
          kids: [
            S("da-metrics-kpi", "Choosing KPIs", "Pick 3–5 numbers linked to the owner's goal. More numbers usually means less attention.", "2 days"),
            S("da-metrics-cohort", "Repeat customers and cohorts", "Group customers by the month they first bought and see how many come back. Shows whether a business keeps people.", "3–4 days", { level: "optional" }),
          ],
        }),
        T("da-compare", "Before-and-after comparisons", "Did the new offer actually raise sales, or was it a festival week? Comparing fairly — same days of the week, same season, one change at a time — is how you prove impact.", {
          skills: ["a/b testing", "analytics"], why: "Proving that a change worked is the most valuable thing an analyst can do for a small business.", time: "1 week",
          res: [vid("a/b testing explained for beginners"), web("How to compare before and after results fairly", "how to measure impact before and after comparison small business")],
          practice: "A shop started WhatsApp reminders on 1 March. Plan how you would check, with their sales sheet, whether reminders raised repeat orders.",
          pt: ["data", "marketing"],
        }),
        T("da-forecast", "Forecasting basics", "Moving averages and weekly patterns are often enough to plan stock or cooking quantities. You don't need complex models to save a business from waste.", {
          skills: ["forecasting"], level: "optional", why: "Small, simple forecasts cut waste and stock-outs, which owners notice immediately.", time: "1–2 weeks",
          res: [course("Forecasting: Principles and Practice (free book)", "https://otexts.com/fpp3/"), vid("moving average forecast excel")],
          practice: "Using 8 weeks of daily sales, forecast next week's sales with a 7-day moving average and compare with what really happened.",
          pt: ["data", "operations"],
        }),
      ],
    },
    {
      title: "Telling the story",
      topics: [
        T("da-viz", "Charts that explain", "A good chart answers one question at a glance. Pick the right chart type, remove clutter, and write a title that states the finding, like 'Sunday orders doubled after the offer'.", {
          skills: ["data visualisation"], why: "Owners and managers decide from charts, not from tables.", time: "1–2 weeks",
          res: [art("Storytelling with Data blog", "https://www.storytellingwithdata.com/blog"), docs("The Data Visualisation Catalogue", "https://datavizcatalogue.com/"), course("Kaggle: Data Visualization", "https://www.kaggle.com/learn/data-visualization")],
          practice: "Take a cluttered chart from a news site and redraw it in Sheets with fewer colours and a title that says the finding.",
          pt: ["data", "content"],
          kids: [
            S("da-viz-choose", "Choosing a chart", "Trend → line. Comparison → bar. Part of a whole → stacked bar (pie only for 2–3 parts). Spread → histogram.", "2–3 days"),
            S("da-viz-declutter", "Decluttering", "Fewer colours, direct labels, no 3D, no extra grid lines. Highlight only what matters.", "2 days"),
          ],
        }),
        T("da-dash", "Dashboards", "A dashboard is a one-screen view that an owner can read on a phone every week without asking you. Start with the 3–5 numbers that matter and a chart for each.", {
          skills: ["dashboard", "looker studio", "power bi"], why: "Building dashboards is a daily task in most analyst jobs.", time: "2 weeks",
          res: [docs("Looker Studio help", "https://support.google.com/looker-studio"), course("Power BI training (Microsoft Learn)", "https://learn.microsoft.com/en-us/training/powerplatform/power-bi"), vid("looker studio dashboard tutorial")],
          practice: "Connect a Google Sheet of sales to Looker Studio and build a one-page dashboard with weekly sales, top items and repeat customers.",
          pt: ["data"],
          kids: [
            S("da-dash-looker", "Looker Studio", "Free, works straight from Google Sheets, and easy to share as a link. Good for small businesses.", "1 week", { skills: ["looker studio"] }),
            S("da-dash-powerbi", "Power BI", "Common in larger companies and in many job listings. Pick this or Looker Studio first; the ideas carry over.", "2 weeks", { skills: ["power bi"], level: "alternative" }),
          ],
        }),
        T("da-present", "Writing up findings", "Your work only matters if someone acts on it. A short write-up — the question, what you found, what to do, and how sure you are — is often more useful than a big dashboard.", {
          skills: ["presentation", "communication"], why: "Clear write-ups get your work used and remembered.", time: "1 week",
          res: [course("Google Technical Writing One", "https://developers.google.com/tech-writing/one"), vid("how to present data analysis findings")],
          practice: "Write a 150-word note to a shop owner explaining one finding from your sales analysis and one action to take.",
          pt: ["data", "content"],
        }),
      ],
    },
    {
      title: "Prove it",
      topics: [
        T("da-prove", "Prove it on a real problem", "Take up a data problem on Kadam: clean a real sheet, answer the owner's question and set up something they keep using. The business's results become your impact report.", {
          skills: ["data"], why: "Real data with a real owner teaches what tutorials can't, and the report is proof for your CV.", time: "2–4 weeks",
          res: [docs("Open government data (data.gov.in)", "https://data.gov.in/"), docs("Kaggle datasets", "https://www.kaggle.com/datasets")],
          practice: "Browse data problems on Kadam and shortlist two that use spreadsheets you already know.",
          pt: ["data"],
        }),
      ],
    },
  ],
};

const FRONTEND: RoadmapData = {
  role: "frontend-developer",
  title: "Frontend Developer",
  summary: "Build websites and apps that work well on any phone, for every kind of user.",
  rsh: ["frontend", "javascript", "react"],
  intro: {
    does: "A frontend developer builds the part of a website or app that people see and use: pages, buttons, forms and menus. The job is to make it work fast and clearly on every screen, including cheap phones on slow networks.",
    firstJobs: ["Junior Frontend Developer", "Web Developer", "UI Developer", "React Developer (trainee)", "Associate Software Engineer"],
    salary: { range: "About ₹3.3 lakh a year on average with under 1 year's experience, about ₹4.5 lakh at 1–3 years", source: SALARY_SRC, url: "https://www.ambitionbox.com/profile/front-end-developer-salary" },
    kadam: "Many Kadam businesses need a simple website, an order form or a fix to a slow page. Shipping one for a real owner — and measuring the orders or calls it brings — is stronger proof than another to-do app.",
  },
  sections: [
    {
      title: "How the web works",
      topics: [
        T("fe-web", "How the web works", "When you open a page, your browser asks a server for files (HTML, CSS, JavaScript, images) and puts them together on screen. Knowing this flow helps you understand why pages are slow and where bugs come from.", {
          skills: ["web", "http"], why: "Every frontend decision — speed, caching, security — builds on this picture.", time: "3–4 days",
          res: [docs("MDN: An overview of HTTP", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview"), docs("MDN: Learn web development", "https://developer.mozilla.org/en-US/docs/Learn_web_development"), vid("how the web works for beginners")],
          practice: "Open any site, press F12, go to the Network tab and reload. Note which files load and which one is the largest.",
          pt: ["tech_build"],
          kids: [
            S("fe-web-http", "Requests and responses", "URLs, HTTP methods (GET, POST), status codes like 200 and 404, and what a domain name is.", "2 days"),
            S("fe-web-devtools", "Browser DevTools", "Inspect elements, see errors in the Console and watch network requests. You will use this every day.", "2 days", { res: [docs("Chrome DevTools docs", "https://developer.chrome.com/docs/devtools")] }),
          ],
        }),
      ],
    },
    {
      title: "The web platform",
      topics: [
        T("fe-html", "HTML", "HTML gives every page its structure: headings, paragraphs, links, images, forms. Using the right element for the job helps search engines, screen readers and other developers understand your page.", {
          skills: ["html"], why: "Clean HTML is the base of accessible, fast, search-friendly sites.", time: "1–2 weeks",
          res: [docs("MDN: HTML basics", "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics"), course("web.dev: Learn HTML", "https://web.dev/learn/html"), course("freeCodeCamp: Responsive Web Design", "https://www.freecodecamp.org/learn/2022/responsive-web-design/")],
          practice: "Write the HTML (no CSS yet) for a one-page menu of a local tiffin service: name, timings, dishes with prices and a contact link.",
          pt: ["tech_build"],
          kids: [
            S("fe-html-semantic", "Semantic elements", "header, nav, main, section, button — not div for everything. Screen readers and Google rely on them.", "2–3 days", { res: [docs("MDN: HTML elements reference", "https://developer.mozilla.org/en-US/docs/Web/HTML/Element")] }),
            S("fe-html-forms", "Forms", "Labels, the right input types (tel, email, number) and validation messages that help people finish.", "3 days", { res: [course("web.dev: Learn Forms", "https://web.dev/learn/forms")] }),
          ],
        }),
        T("fe-css", "CSS", "CSS controls layout, spacing, colour and type. The key skill is building layouts that adapt from a small phone to a laptop without breaking.", {
          skills: ["css"], why: "Most frontend bugs people notice are layout bugs.", time: "3–4 weeks",
          res: [docs("MDN: CSS layout", "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout"), course("web.dev: Learn CSS", "https://web.dev/learn/css"), vid("css flexbox and grid tutorial")],
          practice: "Style your tiffin menu page so it looks good at 360 px (phone) and 1280 px (laptop) wide.",
          pt: ["tech_build", "design_ux"],
          kids: [
            S("fe-css-flex", "Flexbox", "Layouts in one direction, like toolbars, rows of cards and centring things.", "3–4 days", { res: [docs("MDN: Basic concepts of flexbox", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox")] }),
            S("fe-css-grid", "Grid", "Two-direction page layouts with rows and columns.", "3–4 days", { res: [docs("MDN: Basic concepts of grid layout", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout")] }),
            S("fe-css-responsive", "Responsive design", "Design for small screens first, then add space and columns as the screen grows.", "1 week", { res: [course("web.dev: Learn Responsive Design", "https://web.dev/learn/design")] }),
          ],
        }),
        T("fe-js", "JavaScript", "JavaScript makes pages interactive: it responds to taps, loads data and updates the screen without a reload. Learn the language itself well before jumping to a framework.", {
          skills: ["javascript"], why: "Every frontend framework is JavaScript underneath; strong basics make everything later easier.", time: "6–8 weeks",
          res: [course("javascript.info", "https://javascript.info/"), course("freeCodeCamp curriculum", "https://www.freecodecamp.org/learn/"), vid("javascript full course for beginners")],
          practice: "Add a 'total' box to your menu page that updates as people choose dishes and quantities.",
          pt: ["tech_build"],
          kids: [
            S("fe-js-basics", "Language basics", "Variables, arrays, objects, functions, loops and conditions.", "2–3 weeks"),
            S("fe-js-dom", "The DOM", "Find elements on the page, listen for events and change what is shown.", "1 week", { res: [docs("MDN: Introduction to the DOM", "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction")] }),
            S("fe-js-fetch", "fetch and JSON", "Load data from an API and show it on the page.", "3–4 days", { res: [docs("MDN: Using the Fetch API", "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch")] }),
            S("fe-js-async", "async / await", "Wait for slow things like network calls without freezing the page.", "3–4 days", { res: [docs("MDN: Asynchronous JavaScript", "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous")] }),
          ],
        }),
      ],
    },
    {
      title: "Tools of the trade",
      topics: [
        T("fe-git", "Git and GitHub", "Git saves versions of your work so you can undo mistakes, and GitHub lets you share code and work with others. Every team uses it, and your GitHub profile becomes part of your CV.", {
          skills: ["git", "github"], why: "No team will hire a developer who can't use Git.", time: "1 week",
          res: [docs("Pro Git book (free)", "https://git-scm.com/book/en/v2"), docs("GitHub: Hello World", "https://docs.github.com/en/get-started/start-your-journey/hello-world"), course("GitHub Skills", "https://skills.github.com/")],
          practice: "Put your menu page on GitHub with at least five small, clearly named commits.",
          pt: ["tech_build"],
          kids: [
            S("fe-git-branch", "Branches and merging", "Work on a change without breaking the main version, then merge it in.", "2–3 days"),
            S("fe-git-pr", "Pull requests", "Propose a change, get it reviewed and discuss it before it is merged.", "2 days"),
          ],
        }),
        T("fe-npm", "npm and packages", "npm installs code other people have written, like React or a date library. You'll use it to start projects, run scripts and manage versions.", {
          skills: ["npm", "node.js"], why: "Every modern frontend project starts with a package manager.", time: "2–3 days",
          res: [docs("About npm (official)", "https://docs.npmjs.com/about-npm"), docs("Introduction to Node.js", "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs")],
          practice: "Create a new project with npm, install one small package and use it in a page.",
          pt: ["tech_build"],
        }),
      ],
    },
    {
      title: "Frameworks",
      topics: [
        T("fe-react", "React", "React builds interfaces from small, reusable components. It is the most common frontend framework in Indian job listings, so it is a safe first choice.", {
          skills: ["react"], why: "Most frontend job listings in India ask for React.", time: "4–6 weeks",
          res: [docs("react.dev: Learn", "https://react.dev/learn"), docs("Thinking in React", "https://react.dev/learn/thinking-in-react"), vid("react tutorial for beginners")],
          practice: "Rebuild your menu page in React with a Dish component and a cart that keeps its state.",
          pt: ["tech_build"],
          kids: [
            S("fe-react-components", "Components and props", "Small pieces you can reuse, each getting data through props.", "1 week", { res: [docs("Your first component", "https://react.dev/learn/your-first-component")] }),
            S("fe-react-state", "State", "Data that changes as people use the page, and how to share it between components.", "1–2 weeks", { res: [docs("Managing state", "https://react.dev/learn/managing-state")] }),
            S("fe-react-effects", "Effects and data loading", "Load data when a component appears, and handle loading and error states.", "1 week"),
          ],
        }),
        T("fe-vue", "Vue or Svelte", "Vue and Svelte are popular alternatives to React with gentler learning curves. Learn one framework well first; the ideas carry over.", {
          skills: ["vue", "svelte"], level: "alternative", why: "Some teams and startups use these instead of React.", time: "3–4 weeks",
          res: [docs("Vue guide", "https://vuejs.org/guide/introduction.html"), course("Svelte interactive tutorial", "https://svelte.dev/tutorial")],
          practice: "Build the same small cart in Vue or Svelte and note what felt easier or harder than React.",
          pt: ["tech_build"],
        }),
        T("fe-ts", "TypeScript", "TypeScript adds types to JavaScript so your editor catches mistakes before users do. Many companies now use it by default.", {
          skills: ["typescript"], level: "optional", why: "Increasingly expected in job listings and makes larger projects safer.", time: "2 weeks",
          res: [docs("TypeScript handbook", "https://www.typescriptlang.org/docs/handbook/intro.html"), vid("typescript for beginners")],
          practice: "Convert one component of your project to TypeScript and fix every error it shows.",
          pt: ["tech_build"],
        }),
        T("fe-tailwind", "CSS frameworks", "Tools like Tailwind CSS give ready-made utility classes so you style faster and more consistently. Learn plain CSS first so you know what they do.", {
          skills: ["tailwind", "css"], level: "optional", why: "Common in startups and speeds up building.", time: "1 week",
          res: [docs("Tailwind CSS docs", "https://tailwindcss.com/docs"), vid("tailwind css tutorial for beginners")],
          practice: "Restyle one page with Tailwind and compare the amount of CSS you wrote.",
          pt: ["tech_build", "design_ux"],
        }),
      ],
    },
    {
      title: "Quality",
      topics: [
        T("fe-a11y", "Accessibility", "Everyone should be able to use your site — with a screen reader, only a keyboard, poor eyesight or a cracked phone screen. Good contrast, labels and focus states help everyone.", {
          skills: ["accessibility"], why: "Accessible sites reach more customers, and many companies now check for it in interviews.", time: "1–2 weeks",
          res: [course("web.dev: Learn Accessibility", "https://web.dev/learn/accessibility"), docs("W3C WAI: Accessibility fundamentals", "https://www.w3.org/WAI/fundamentals/"), docs("W3C: Easy checks", "https://www.w3.org/WAI/test-evaluate/preliminary/")],
          practice: "Use your site with only the keyboard (Tab, Enter, Esc). Fix every place you get stuck.",
          pt: ["tech_build", "design_ux"],
        }),
        T("fe-perf", "Performance on budget phones", "Many Indian users are on budget phones and patchy 4G. Small pages, compressed images and less JavaScript make your site usable for them.", {
          skills: ["performance"], why: "A slow page loses customers before it even loads.", time: "1–2 weeks",
          res: [course("web.dev: Learn Performance", "https://web.dev/learn/performance"), course("web.dev: Learn Images", "https://web.dev/learn/images"), tool("PageSpeed Insights", "https://pagespeed.web.dev/")],
          practice: "Run PageSpeed Insights on a local business's site and list the three biggest fixes it suggests.",
          pt: ["tech_build"],
        }),
        T("fe-test", "Testing", "Automated tests check that your code still works after changes. Start with a few tests for the most important flows.", {
          skills: ["testing"], level: "optional", why: "Teams trust developers whose changes don't break things.", time: "1–2 weeks",
          res: [vid("javascript testing for beginners"), web("Testing React components guide", "testing react components beginner guide")],
          practice: "Write one test that checks your cart total is right for three dishes.",
          pt: ["tech_build"],
        }),
      ],
    },
    {
      title: "Ship it",
      topics: [
        T("fe-deploy", "Deploy your site", "A project only counts once it is online. Free hosts like Vercel, Netlify and GitHub Pages put your site on a public link in minutes.", {
          skills: ["deployment"], why: "A live link is what recruiters and business owners actually open.", time: "2–3 days",
          res: [docs("Vercel docs", "https://vercel.com/docs"), docs("GitHub Pages", "https://pages.github.com/"), docs("Netlify docs", "https://docs.netlify.com/")],
          practice: "Deploy your menu project and open it on a friend's phone over mobile data.",
          pt: ["tech_build"],
        }),
        T("fe-prove", "Ship for a real business", "Take up a tech problem on Kadam: build or fix a site for a real owner, then measure what changes — more calls, more orders, fewer wrong orders.", {
          skills: ["web"], why: "A real site with real users and numbers is the strongest thing on a fresher CV.", time: "2–4 weeks",
          res: [vid("building a website for a small business"), tool("PageSpeed Insights", "https://pagespeed.web.dev/")],
          practice: "Shortlist one Kadam tech problem and write down the first screen you would build.",
          pt: ["tech_build", "design_ux"],
        }),
      ],
    },
  ],
};

const DIGITAL_MARKETER: RoadmapData = {
  role: "digital-marketer",
  title: "Digital Marketer",
  summary: "Help small businesses find customers, keep them, and grow without big budgets.",
  intro: {
    does: "A digital marketer helps a business reach the right people online, turn them into customers and bring them back. For small businesses that means WhatsApp, Google Maps, Instagram and small, careful tests rather than big ad budgets.",
    firstJobs: ["Digital Marketing Executive", "Social Media Executive", "SEO Executive", "Performance Marketing Trainee", "Growth Associate at a startup"],
    salary: { range: "About ₹3.0 lakh a year on average with under 1 year's experience, about ₹3.7 lakh at 1–3 years", source: SALARY_SRC, url: "https://www.ambitionbox.com/profile/digital-marketer-salary" },
    kadam: "Kadam businesses bring real marketing problems: few repeat customers, no Google listing, weak Instagram. Running a campaign for one and reporting the numbers gives you results to talk about, not just certificates.",
  },
  sections: [
    {
      title: "Basics",
      topics: [
        T("dm-basics", "Marketing fundamentals", "Marketing starts with three questions: who is the customer, what problem do you solve for them, and why should they pick you over the shop next door? Every post, offer and ad comes from those answers.", {
          skills: ["marketing"], why: "Tactics change every year; understanding customers doesn't.", time: "1–2 weeks",
          res: [course("Google Digital Garage", "https://learndigital.withgoogle.com/digitalgarage"), course("HubSpot Academy", "https://academy.hubspot.com/"), vid("marketing fundamentals for beginners")],
          practice: "Talk to five customers of a local shop. Write down why they buy there and what almost stopped them.",
          pt: ["marketing", "research"],
          kids: [
            S("dm-basics-customer", "Customer research", "Talk to ten customers before spending a rupee. Their words become your best ad copy.", "3–4 days"),
            S("dm-basics-offer", "Offers", "Trials, bundles and referral rewards. A good offer makes trying you an easy decision.", "2 days"),
            S("dm-basics-funnel", "The funnel", "Notice → try → buy → come back → tell friends. Find the step where most people drop off.", "2 days"),
          ],
        }),
        T("dm-local", "Local reach", "For small shops, the customers within a few kilometres matter most. A good Google Maps listing and a well-run WhatsApp Business account often beat any ad.", {
          skills: ["whatsapp", "google business profile"], why: "Most Indian small businesses get customers through Maps and WhatsApp first.", time: "1 week",
          res: [docs("WhatsApp Business", "https://business.whatsapp.com/"), docs("Google Business Profile help", "https://support.google.com/business"), vid("google business profile setup tutorial")],
          practice: "Audit a local shop's Google listing: photos, hours, replies to reviews. List five improvements.",
          pt: ["marketing"],
          kids: [
            S("dm-local-wa", "WhatsApp Business", "Catalogue, quick replies, labels and broadcast lists for customers who have opted in.", "2–3 days", { skills: ["whatsapp"] }),
            S("dm-local-gbp", "Google Business Profile", "Show up on Maps with correct hours, photos and replies to reviews.", "2–3 days", { skills: ["google business profile"] }),
          ],
        }),
      ],
    },
    {
      title: "Content and social",
      topics: [
        T("dm-social", "Social media content", "Plan posts and short videos that people want to watch and share. Consistency and a clear voice matter more than fancy editing.", {
          skills: ["instagram", "social media", "canva"], why: "Social media is where most small brands are discovered today.", time: "2–3 weeks",
          res: [course("Meta Blueprint (free courses)", "https://www.facebook.com/business/learn"), course("Canva Design School", "https://www.canva.com/designschool/"), tool("Canva", "https://www.canva.com/")],
          practice: "Plan 12 Instagram posts for a local bakery for one month, with a caption and a visual idea for each.",
          pt: ["marketing", "content"],
          kids: [
            S("dm-social-calendar", "Content calendar", "Plan a month of posts in one sitting, mixing product, behind-the-scenes and customer stories.", "2 days"),
            S("dm-social-reels", "Short video", "Hook in the first two seconds, show the product early, add captions for people watching on mute.", "1 week"),
          ],
        }),
        T("dm-copy", "Copy that sells", "Good marketing copy is short, specific and about the customer. 'Hot lunch at your desk by 1 pm' beats 'Best quality food'.", {
          skills: ["copywriting"], why: "Every ad, post and message depends on the words.", time: "1 week",
          res: [vid("copywriting for beginners"), web("Copywriting formulas AIDA PAS explained", "copywriting formulas AIDA PAS explained")],
          practice: "Rewrite a shop's WhatsApp broadcast message three ways and ask five people which they would act on.",
          pt: ["marketing", "content"],
        }),
      ],
    },
    {
      title: "Search and ads",
      topics: [
        T("dm-seo", "SEO basics", "SEO helps people find the business when they search on Google. For small businesses it is mostly local SEO: the right words on the page, a good Maps listing and genuine reviews.", {
          skills: ["seo"], why: "Free search traffic keeps coming long after an ad budget runs out.", time: "2 weeks",
          res: [docs("Google SEO starter guide", SEO_GUIDE), tool("Google Trends", "https://trends.google.com/"), vid("seo for beginners")],
          practice: "Find the five phrases people in your city would type to find a tiffin service, using Google's search suggestions and Trends.",
          pt: ["marketing", "content"],
          kids: [
            S("dm-seo-keywords", "Keywords", "The words real people type, often in Hinglish or local languages. Use them naturally in titles and text.", "3–4 days"),
            S("dm-seo-local", "Local SEO", "Maps listing, reviews, and the business name, address and phone written the same way everywhere.", "3 days"),
          ],
        }),
        T("dm-ads", "Paid ads", "Small, well-targeted ad tests on Meta (Instagram, Facebook) or Google. Start with ₹100–₹200 a day, one clear goal and one offer.", {
          skills: ["ads"], level: "optional", why: "Most marketing jobs expect you to run and read ad campaigns.", time: "2–3 weeks",
          res: [course("Google Skillshop", "https://skillshop.withgoogle.com/"), course("Meta Blueprint", "https://www.facebook.com/business/learn")],
          practice: "Write a plan for a ₹1,000 test campaign: audience, offer, two ad versions and the number that decides the winner.",
          pt: ["marketing"],
          kids: [
            S("dm-ads-meta", "Meta ads", "Instagram and Facebook ads targeted by area, age and interests. Good for things people buy on impulse.", "1–2 weeks"),
            S("dm-ads-google", "Google ads", "Ads shown when people search for what you sell. Good when people already know what they want.", "1–2 weeks", { level: "alternative" }),
          ],
        }),
      ],
    },
    {
      title: "Keep customers",
      topics: [
        T("dm-email", "Email, SMS and WhatsApp follow-ups", "Bringing back an old customer is far cheaper than finding a new one. Simple, permission-based messages — a reminder, a thank-you, a new item — keep people coming back.", {
          skills: ["email marketing", "whatsapp"], level: "optional", why: "Repeat customers are where most small businesses make their profit.", time: "1 week",
          res: [course("HubSpot Academy", "https://academy.hubspot.com/"), vid("email marketing for beginners")],
          practice: "Draft a 3-message follow-up for someone who ordered once and never came back.",
          pt: ["marketing", "content"],
        }),
        T("dm-reviews", "Reviews and word of mouth", "Happy customers telling friends is the strongest marketing in India. Ask for reviews at the right moment and reply to every one, especially the bad ones.", {
          skills: ["reviews", "referrals"], why: "A few honest reviews often decide whether a new customer walks in.", time: "3–4 days",
          res: [docs("Google Business Profile: reviews help", "https://support.google.com/business"), vid("how to get more google reviews for small business")],
          practice: "Write a polite reply to a 2-star review of a local restaurant that fixes the issue without arguing.",
          pt: ["marketing"],
        }),
      ],
    },
    {
      title: "Measure and improve",
      topics: [
        T("dm-measure", "Measuring results", "Track trials, sign-ups, repeat orders and cost per customer. Without numbers you can't tell which idea worked — and the owner can't tell if you helped.", {
          skills: ["analytics", "google analytics"], why: "Marketers who show numbers get trusted with bigger budgets.", time: "1–2 weeks",
          res: [docs("Google Analytics help", "https://support.google.com/analytics"), course("Google Skillshop: Analytics", "https://skillshop.withgoogle.com/"), docs("Google Sheets help", SHEETS)],
          practice: "Build a one-page sheet that tracks a campaign: messages sent, replies, first orders, repeat orders.",
          pt: ["marketing", "data"],
          kids: [
            S("dm-measure-sheet", "A simple tracking sheet", "One row per customer, one column per step of the funnel.", "2 days"),
            S("dm-measure-test", "A/B tests", "Change one thing at a time (offer, image, time of day) and compare fairly.", "3 days"),
            S("dm-measure-ga", "Google Analytics", "See where website visitors come from and what they do. Needed once a business has a website.", "1 week", { level: "optional", skills: ["google analytics"] }),
          ],
        }),
        T("dm-prove", "Run a campaign for a real business", "Take up a marketing problem on Kadam, run a small campaign and report honest numbers — what worked, what didn't, and what the owner should keep doing.", {
          skills: ["marketing"], why: "A campaign with real results is more convincing than any certificate.", time: "2–4 weeks",
          res: [docs("Think with Google (consumer insights)", "https://www.thinkwithgoogle.com/"), docs("Google Business Profile help", "https://support.google.com/business")],
          practice: "Pick one Kadam marketing problem and write the one number you would try to move.",
          pt: ["marketing"],
        }),
      ],
    },
  ],
};

const UX_DESIGNER: RoadmapData = {
  role: "ux-designer",
  title: "UX Designer",
  summary: "Make products simple and pleasant for the people who actually use them.",
  rsh: ["ux-design"],
  intro: {
    does: "A UX designer finds out how people really use a product and designs it so they can finish their task easily. The work is part research, part sketching and part testing — not just making screens look nice.",
    firstJobs: ["Junior UX Designer", "UI/UX Designer", "Product Designer (associate)", "UX Researcher (associate)", "Visual / Interaction Designer"],
    salary: { range: "About ₹7.8 lakh a year on average at 1–3 years' experience (fresher figures not published)", source: SALARY_SRC, url: "https://www.ambitionbox.com/profile/ux-designer-salary" },
    kadam: "Kadam businesses have real screens, forms and processes that confuse their customers. Watching their users, redesigning one flow and measuring fewer mistakes or more orders gives you a true case study.",
  },
  sections: [
    {
      title: "Foundations",
      topics: [
        T("ux-principles", "Design principles", "Hierarchy, contrast, spacing and alignment decide what people notice first. A few well-known rules of thumb explain why some screens feel easy and others confusing.", {
          skills: ["design"], why: "Principles let you explain your design choices, which interviewers always ask about.", time: "1–2 weeks",
          res: [art("Laws of UX", "https://lawsofux.com/"), art("NN/g: 10 usability heuristics", "https://www.nngroup.com/articles/ten-usability-heuristics/"), vid("ui design principles for beginners")],
          practice: "Screenshot a confusing app screen (a bill-payment or railway app) and mark three principles it breaks.",
          pt: ["design_ux"],
          kids: [
            S("ux-principles-hierarchy", "Visual hierarchy", "Size, weight, colour and position tell people what to look at first.", "2–3 days"),
            S("ux-principles-heuristics", "Usability heuristics", "Ten classic checks, like 'show system status' and 'prevent errors', to review any design.", "3 days"),
          ],
        }),
      ],
    },
    {
      title: "Understand people",
      topics: [
        T("ux-research", "User research", "Talk to and watch real users to learn what they actually need, not what you assume. Even five short conversations usually change the design.", {
          skills: ["user research"], why: "Designs based on research solve real problems; designs based on guesses often don't.", time: "2–3 weeks",
          res: [art("NN/g: User interviews", "https://www.nngroup.com/articles/user-interviews/"), art("NN/g articles", "https://www.nngroup.com/articles/"), vid("user research methods for beginners")],
          practice: "Interview three people about the last time they ordered food online. Note one moment of frustration from each.",
          pt: ["design_ux", "research"],
          kids: [
            S("ux-research-interview", "Interviews", "Ask about past behaviour ('Tell me about the last time…'), not opinions ('Would you use…?').", "1 week"),
            S("ux-research-observe", "Observation", "Watch people do the task where they normally do it, like a shopkeeper billing at the counter.", "3–4 days"),
            S("ux-research-personas", "Personas", "Short summaries of the kinds of people you design for. Useful only if based on real research.", "2 days", { level: "optional", res: [art("NN/g: Personas", "https://www.nngroup.com/articles/persona/")] }),
          ],
        }),
        T("ux-journey", "Journey maps and problem statements", "A journey map lays out every step a person takes, with what they feel at each step. It ends in a clear problem statement that the whole team agrees to solve.", {
          skills: ["journey mapping"], why: "It keeps you solving the right problem instead of polishing the wrong screen.", time: "1 week",
          res: [art("NN/g: Journey mapping 101", "https://www.nngroup.com/articles/journey-mapping-101/"), vid("customer journey map tutorial")],
          practice: "Map the journey of a customer booking a gas cylinder, from noticing it is empty to delivery.",
          pt: ["design_ux", "research"],
        }),
      ],
    },
    {
      title: "Structure",
      topics: [
        T("ux-ia", "Information architecture", "How content is grouped, named and ordered so people can find things. Card sorting with real users shows how they expect things to be grouped.", {
          skills: ["information architecture"], why: "If people can't find it, it doesn't matter how good it looks.", time: "1 week",
          res: [art("NN/g: Card sorting", "https://www.nngroup.com/articles/card-sorting-definition/"), vid("information architecture ux tutorial")],
          practice: "Run a card sort with five friends using 20 items from a grocery app and compare their groups.",
          pt: ["design_ux"],
        }),
        T("ux-flows", "Flows and wireframes", "Sketch the steps and rough screens before polishing anything. Paper or simple boxes are fine; the point is to test ideas quickly and cheaply.", {
          skills: ["wireframe"], why: "Cheap sketches let you throw away bad ideas before they cost time.", time: "1–2 weeks",
          res: [art("NN/g: Wireflows", "https://www.nngroup.com/articles/wireflows/"), vid("wireframing for beginners")],
          practice: "Sketch the flow for reordering yesterday's tiffin in three taps or fewer.",
          pt: ["design_ux"],
        }),
      ],
    },
    {
      title: "Design",
      topics: [
        T("ux-figma", "Figma", "Figma is the most common design tool in Indian companies, and it is free for students. Learn to build screens that resize properly and reuse components.", {
          skills: ["figma"], why: "Nearly every UX job listing asks for Figma.", time: "2–3 weeks",
          res: [docs("Figma Learn (help centre)", "https://help.figma.com/hc/en-us"), docs("Figma for Education", "https://www.figma.com/education/"), vid("figma tutorial for beginners")],
          practice: "Rebuild one screen of an app you use daily in Figma, using auto layout and at least two components.",
          pt: ["design_ux"],
          kids: [
            S("ux-figma-autolayout", "Auto layout", "Frames that grow and shrink like real screens and buttons.", "3–4 days", { res: [vid("figma auto layout tutorial")] }),
            S("ux-figma-components", "Components", "Reusable buttons, cards and inputs, so one change updates everywhere.", "3–4 days"),
          ],
        }),
        T("ux-visual", "Visual design basics", "Typography, colour and spacing make a design readable and trustworthy. Design systems like Material Design show how big teams keep things consistent.", {
          skills: ["visual design", "typography"], why: "Clean visuals make users trust a product, especially first-time digital users.", time: "2 weeks",
          res: [docs("Material Design 3", "https://m3.material.io/"), docs("Apple Human Interface Guidelines", "https://developer.apple.com/design/human-interface-guidelines/"), vid("typography and colour for ui design")],
          practice: "Pick two fonts and four colours for a local pharmacy app and check every text colour for contrast.",
          pt: ["design_ux"],
        }),
        T("ux-proto", "Prototypes", "Clickable mock-ups that feel like the real app. You test them with people before any code is written.", {
          skills: ["prototype"], why: "Testing a prototype is far cheaper than fixing a built app.", time: "1 week",
          res: [vid("figma prototyping tutorial"), docs("Figma Learn", "https://help.figma.com/hc/en-us")],
          practice: "Turn your reorder flow into a clickable Figma prototype and share the link with two people.",
          pt: ["design_ux"],
        }),
      ],
    },
    {
      title: "Test and include",
      topics: [
        T("ux-testing", "Usability testing", "Watch five people try to finish a task with your design while thinking aloud. Don't help them; note where they hesitate, and fix those places first.", {
          skills: ["usability"], why: "Testing shows real problems that no amount of discussion finds.", time: "1–2 weeks",
          res: [art("NN/g: Usability testing 101", "https://www.nngroup.com/articles/usability-testing-101/"), vid("how to run a usability test")],
          practice: "Run a 15-minute test of your prototype with three people and list the top three problems.",
          pt: ["design_ux", "research"],
        }),
        T("ux-a11y", "Accessible design", "Good contrast, large tap targets, clear labels and simple language help people with low vision, older users and first-time smartphone users.", {
          skills: ["accessibility"], why: "In India, many users are new to digital apps; accessible design reaches them.", time: "1 week",
          res: [docs("W3C WAI fundamentals", "https://www.w3.org/WAI/fundamentals/"), tool("WebAIM contrast checker", "https://webaim.org/resources/contrastchecker/")],
          practice: "Check every text and button colour in your design with a contrast checker and fix the ones that fail.",
          pt: ["design_ux"],
        }),
        T("ux-writing", "UX writing", "The words on buttons, errors and empty screens. Clear, short words often fix more problems than a redesign.", {
          skills: ["ux writing", "copywriting"], level: "optional", why: "Small word changes can cut errors and support calls.", time: "1 week",
          res: [docs("Google developer style guide", "https://developers.google.com/style"), vid("ux writing for beginners")],
          practice: "Rewrite five confusing error messages from apps you use.",
          pt: ["design_ux", "content"],
        }),
      ],
    },
    {
      title: "Show your work",
      topics: [
        T("ux-case", "Case studies", "Recruiters want to see how you think, not just final screens. A case study tells the story: the problem, what you learned from users, the options you tried, and what changed.", {
          skills: ["portfolio"], why: "Your portfolio of case studies is what gets you interviews in UX.", time: "1–2 weeks",
          res: [art("Interaction Design Foundation: literature", "https://www.interaction-design.org/literature"), vid("ux case study portfolio tips")],
          practice: "Write a one-page case study of your reorder-flow project with before and after screens.",
          pt: ["design_ux", "content"],
        }),
        T("ux-prove", "Redesign for a real business", "Take up a design problem on Kadam: improve a screen, form or process for a real business and measure the change, like fewer wrong orders or faster billing.", {
          skills: ["design"], why: "A case study with real users and real numbers stands out from course projects.", time: "2–4 weeks",
          res: [art("NN/g: Usability testing 101", "https://www.nngroup.com/articles/usability-testing-101/"), docs("Figma Learn", "https://help.figma.com/hc/en-us")],
          practice: "Pick one Kadam design problem and list the three people you would talk to first.",
          pt: ["design_ux"],
        }),
      ],
    },
  ],
};

const CONTENT_WRITER: RoadmapData = {
  role: "content-writer",
  title: "Content Writer",
  summary: "Write clear words that make people read, trust and act.",
  rsh: ["technical-writer"],
  intro: {
    does: "A content writer writes the words people read online: website pages, blogs, social posts, emails, product descriptions and guides. Good writers research well, write plainly and make readers do something — call, buy, sign up or share.",
    firstJobs: ["Content Writer", "Copywriter (trainee)", "Content Executive", "Social Media Content Writer", "Technical Writer (junior)"],
    salary: { range: "About ₹2.8 lakh a year on average with under 1 year's experience, about ₹3.3 lakh at 1–3 years", source: SALARY_SRC, url: "https://www.ambitionbox.com/profile/content-writer-salary" },
    kadam: "Kadam businesses and NGOs need real words: a website page, a donor story, a product list in two languages. Writing for them gives you published work and results you can point to.",
  },
  sections: [
    {
      title: "Craft",
      topics: [
        T("cw-plain", "Plain writing", "Short sentences, common words, active voice and one idea at a time. Plain writing isn't 'dumbing down'; it respects the reader's time.", {
          skills: ["writing"], why: "Clients and readers in India read on phones, often in a second language; plain writing reaches them.", time: "1–2 weeks",
          res: [docs("Plain language guidelines", "https://www.plainlanguage.gov/guidelines/"), course("Google Technical Writing One", "https://developers.google.com/tech-writing/one"), tool("Hemingway Editor", "https://hemingwayapp.com/")],
          practice: "Take a long government notice or college circular and rewrite it in half the words.",
          pt: ["content"],
        }),
        T("cw-edit", "Structure and editing", "Good pieces are planned before they are written and cut after. Outline your headings first, write fast, then remove everything the reader doesn't need.", {
          skills: ["editing"], why: "Editing your own work is what clients pay for; first drafts are rarely good enough.", time: "1–2 weeks",
          res: [course("Google Technical Writing courses", "https://developers.google.com/tech-writing"), docs("Purdue OWL writing guides", "https://owl.purdue.edu/owl/purdue_owl.html")],
          practice: "Write a 500-word blog post, then cut it to 330 words without losing a single idea.",
          pt: ["content"],
          kids: [
            S("cw-edit-outline", "Outlines", "Plan the headings and the one point of each section before writing.", "2 days"),
            S("cw-edit-cut", "Cutting", "Remove a third of your first draft: filler words, repeats and throat-clearing intros.", "3 days"),
          ],
        }),
        T("cw-story", "Storytelling", "A person, a problem, a change — and a clear ask at the end. Stories make readers care, which is why NGOs and brands use them everywhere.", {
          skills: ["storytelling"], why: "Stories are remembered and shared far more than facts alone.", time: "1 week",
          res: [vid("storytelling techniques for writers"), web("Storytelling tips for writers", "storytelling tips for writers structure")],
          practice: "Write a 200-word story about one customer of a local shop and how the shop helped them.",
          pt: ["content", "marketing"],
        }),
      ],
    },
    {
      title: "Research",
      topics: [
        T("cw-research", "Research and sources", "Good writing starts with good facts. Learn to find reliable sources, check numbers, quote people correctly and never copy someone else's text.", {
          skills: ["research"], why: "One wrong fact or copied paragraph can end a client relationship.", time: "1 week",
          res: [docs("Purdue OWL: research and citation", "https://owl.purdue.edu/owl/purdue_owl.html"), vid("how to research for content writing")],
          practice: "For an article on UPI use in small towns, find three reliable sources and note what each one proves.",
          pt: ["content", "research"],
        }),
      ],
    },
    {
      title: "Formats",
      topics: [
        T("cw-web", "Writing for the web", "People scan web pages instead of reading every word. Clear headlines, short paragraphs and words people search for help them find and finish your piece.", {
          skills: ["seo", "copywriting"], why: "Most paid writing work in India is for websites and blogs.", time: "2 weeks",
          res: [docs("Google SEO starter guide", SEO_GUIDE), vid("seo content writing for beginners")],
          practice: "Write a 300-word 'About us' page for a local tailor that a phone reader can scan in 20 seconds.",
          pt: ["content", "marketing"],
          kids: [
            S("cw-web-headlines", "Headlines", "Promise one clear benefit in plain words. Write five, keep the best.", "2 days"),
            S("cw-web-scan", "Scannable pages", "Short paragraphs, lists and subheadings that say something on their own.", "2 days"),
            S("cw-web-seo", "Search-friendly writing", "Use the words people actually search for, naturally, in titles and headings.", "3–4 days", { skills: ["seo"] }),
          ],
        }),
        T("cw-social", "Social and WhatsApp copy", "Say it in two lines, with one clear action. Social and WhatsApp copy is short but hard: every word must earn its place.", {
          skills: ["copywriting", "social media"], level: "optional", why: "Brands hire writers for daily social posts and campaign messages.", time: "1 week",
          res: [vid("copywriting for social media"), course("Meta Blueprint", "https://www.facebook.com/business/learn")],
          practice: "Write five Instagram captions for a handloom brand, each under 25 words.",
          pt: ["content", "marketing"],
        }),
        T("cw-tech", "Guides and how-tos", "Step-by-step guides, FAQs and help pages. Technical writing pays well and is in demand at software companies.", {
          skills: ["technical writing"], level: "optional", why: "A path into software companies for writers.", time: "2 weeks",
          res: [course("Google Technical Writing courses", "https://developers.google.com/tech-writing"), docs("Google developer style guide", "https://developers.google.com/style")],
          practice: "Write a how-to guide: 'Accept UPI payments with a QR code' for a shop owner, with numbered steps.",
          pt: ["content", "tech_build"],
        }),
        T("cw-lang", "Writing in Indian languages", "Many readers prefer Hindi, Tamil, Bengali or other Indian languages. Writers who can write naturally in two languages — not word-for-word translation — are valuable.", {
          skills: ["translation", "writing"], level: "optional", why: "Regional-language content is growing fast in India.", time: "ongoing",
          res: [vid("translation vs transcreation explained"), docs("Plain language guidelines", "https://www.plainlanguage.gov/guidelines/")],
          practice: "Take an English product description and write it naturally in your home language for a local reader.",
          pt: ["content"],
        }),
      ],
    },
    {
      title: "Working with clients",
      topics: [
        T("cw-brief", "Working from a brief", "Clients give a brief: who the reader is, what they should do, tone, length and deadline. Asking the right questions before writing saves rounds of changes.", {
          skills: ["communication"], why: "Most rewrites happen because the brief was unclear, not because the writing was bad.", time: "3–4 days",
          res: [vid("how to write a content brief"), web("Content brief template", "content brief template for writers")],
          practice: "Write a one-page brief for a blog post a local gym needs, including five questions you would ask the owner.",
          pt: ["content", "marketing"],
        }),
        T("cw-tools", "Writing tools", "Google Docs for drafts and comments, a grammar checker, and a simple website builder or CMS like WordPress to publish.", {
          skills: ["google docs", "wordpress"], why: "Clients expect you to draft, take comments and publish without help.", time: "3–4 days",
          res: [tool("WordPress.com", "https://wordpress.com/"), tool("Hemingway Editor", "https://hemingwayapp.com/")],
          practice: "Publish one of your pieces on a free WordPress site with a title, image and tags.",
          pt: ["content"],
        }),
      ],
    },
    {
      title: "Portfolio",
      topics: [
        T("cw-portfolio", "Build a portfolio", "Publish 3–5 pieces that show range: a web page, a blog post, social copy and a story. Include at least one written for a real organisation.", {
          skills: ["portfolio"], why: "Clients and editors hire writers from samples, not degrees.", time: "2–3 weeks",
          res: [tool("WordPress.com", "https://wordpress.com/"), vid("content writing portfolio for beginners")],
          practice: "Make a one-page portfolio with three links and one line on each about the result.",
          pt: ["content"],
        }),
        T("cw-prove", "Write for a real organisation", "Take up a content problem on Kadam — a website page, a donor story, a product list — and track what happens after it goes live.", {
          skills: ["writing"], why: "Published work with a real result is the best sample you can show.", time: "1–3 weeks",
          res: [docs("Plain language guidelines", "https://www.plainlanguage.gov/guidelines/"), tool("Hemingway Editor", "https://hemingwayapp.com/")],
          practice: "Pick one Kadam content problem and write the headline before anything else.",
          pt: ["content"],
        }),
      ],
    },
  ],
};

const BUSINESS_ANALYST: RoadmapData = {
  role: "business-analyst",
  title: "Business Analyst",
  summary: "Understand how a business works today and design a better way.",
  rsh: ["bi-analyst"],
  intro: {
    does: "A business analyst studies how work actually gets done, finds where time or money is lost, and recommends a better process or tool. They sit between the people who run the business and the people who build solutions.",
    firstJobs: ["Business Analyst (associate)", "Process Analyst", "MIS / Operations Analyst", "Junior Consultant", "Product / Business Operations Associate"],
    salary: { range: "About ₹7.3 lakh a year on average at 1–3 years' experience (fresher figures not published)", source: SALARY_SRC, url: "https://www.ambitionbox.com/profile/business-analyst-salary" },
    kadam: "Kadam businesses bring operations problems — slow billing, lost orders, stock confusion. Mapping one process, fixing it with the owner and measuring time or money saved is exactly what BAs do at work.",
  },
  sections: [
    {
      title: "Understand the business",
      topics: [
        T("ba-money", "How businesses make money", "Revenue, costs, margins and cash flow. You can't improve a business if you don't know where its money comes from and goes.", {
          skills: ["business basics"], why: "Recommendations that ignore money don't get approved.", time: "1–2 weeks",
          res: [course("Khan Academy: Core finance", KHAN_FIN), vid("how businesses make money basics")],
          practice: "For a local tea stall, estimate daily revenue, costs and profit from what you can see in one hour.",
          pt: ["finance", "research"],
        }),
        T("ba-stake", "Talking to stakeholders", "Stakeholders are everyone affected by a change: owner, staff, customers, suppliers. Ask good questions, listen more than you talk, and write down what each person needs.", {
          skills: ["requirements", "stakeholder"], why: "Most failed projects solved the wrong problem because nobody asked the right people.", time: "1–2 weeks",
          res: [art("Atlassian: Product requirements", "https://www.atlassian.com/agile/product-management/requirements"), vid("stakeholder interview business analyst")],
          practice: "Interview a shop owner and one staff member separately about billing. Note where their answers differ.",
          pt: ["operations", "research"],
          kids: [
            S("ba-stake-interview", "Interviews", "Ask how things happen today, step by step, with real examples from last week.", "3–4 days"),
            S("ba-stake-req", "Requirements", "Write what must be true when the problem is solved, in words both sides agree on.", "3–4 days"),
          ],
        }),
      ],
    },
    {
      title: "Analyse",
      topics: [
        T("ba-process", "Process mapping", "Draw today's process step by step, then find the slow, costly or error-prone steps. A simple flowchart often shows the problem more clearly than any meeting.", {
          skills: ["process mapping", "process"], why: "Process maps are the BA's main tool for spotting waste.", time: "1–2 weeks",
          res: [tool("diagrams.net (free)", "https://app.diagrams.net/"), vid("process mapping tutorial"), web("Swimlane diagrams explained", "swimlane process map explained")],
          practice: "Map how a kirana takes a phone order, from the call to payment, and mark the two slowest steps.",
          pt: ["operations"],
          kids: [
            S("ba-process-asis", "As-is map", "How it works now, honestly, including workarounds people use.", "3 days"),
            S("ba-process-tobe", "To-be map", "How it should work, with fewer steps and handovers.", "3 days"),
          ],
        }),
        T("ba-root", "Finding root causes", "The first problem you hear is often a symptom. Tools like '5 whys' and fishbone diagrams help you dig to the real cause.", {
          skills: ["root cause analysis"], why: "Fixing a symptom wastes money; fixing the cause solves it for good.", time: "1 week",
          res: [vid("5 whys root cause analysis"), web("Fishbone diagram explained", "fishbone ishikawa diagram explained")],
          practice: "Use 5 whys on 'customers complain that orders are late' for a tiffin service.",
          pt: ["operations", "research"],
        }),
        T("ba-sheets", "Spreadsheets for analysis", "Clean data, summarise it with pivot tables, and build simple what-if models to compare options.", {
          skills: ["excel", "google sheets"], why: "Excel is used in nearly every BA role, every day.", time: "2–3 weeks",
          res: [docs("Excel help & learning (Microsoft)", EXCEL), docs("Google Sheets help", SHEETS), vid("excel for business analysts")],
          practice: "Build a sheet comparing two options (hire a helper vs buy billing software) over 12 months.",
          pt: ["data", "operations"],
        }),
        T("ba-sql", "SQL basics", "Pull the numbers you need yourself instead of waiting for someone else. Basic SELECT, GROUP BY and JOIN cover most BA needs.", {
          skills: ["sql"], level: "optional", why: "Many BA job listings ask for basic SQL.", time: "2–3 weeks",
          res: [course("SQLBolt", "https://sqlbolt.com/"), course("Kaggle: Intro to SQL", "https://www.kaggle.com/learn/intro-to-sql")],
          practice: "Write a query that finds the five slowest-delivered orders from an orders table.",
          pt: ["data"],
        }),
      ],
    },
    {
      title: "Measure",
      topics: [
        T("ba-kpi", "KPIs and metrics", "Pick a few numbers that show whether the process is getting better: time per order, error rate, cost per order. Measure before and after every change.", {
          skills: ["kpi", "analytics"], why: "Numbers turn your recommendation from an opinion into proof.", time: "1 week",
          res: [art("KPIs explained (Investopedia)", "https://www.investopedia.com/terms/k/kpi.asp"), docs("Looker Studio help", "https://support.google.com/looker-studio")],
          practice: "Choose three KPIs for a laundry shop's pickup-and-delivery process and how to collect each.",
          pt: ["data", "operations"],
        }),
      ],
    },
    {
      title: "Ways of working",
      topics: [
        T("ba-agile", "Agile and user stories", "Most software teams work in short cycles and write needs as user stories: 'As a shop owner, I want…, so that…'. BAs write and refine these stories.", {
          skills: ["agile", "user stories"], why: "Most BA roles in IT companies work inside agile teams.", time: "1–2 weeks",
          res: [art("Atlassian: Agile guide", "https://www.atlassian.com/agile"), art("Atlassian: User stories", "https://www.atlassian.com/agile/project-management/user-stories")],
          practice: "Write five user stories with acceptance criteria for a simple khata (credit book) app.",
          pt: ["tech_build", "operations"],
          kids: [
            S("ba-agile-stories", "User stories", "Who needs it, what they need and why, in one sentence.", "2–3 days"),
            S("ba-agile-ac", "Acceptance criteria", "The checks that tell everyone when a story is done.", "2 days"),
          ],
        }),
        T("ba-swot", "Business frameworks", "Frameworks like SWOT give structure to messy discussions. Use them as a starting point, not as the answer.", {
          skills: ["strategy"], level: "optional", why: "Common in consulting interviews and case rounds.", time: "3–4 days",
          res: [art("SWOT analysis (Investopedia)", "https://www.investopedia.com/terms/s/swot.asp"), vid("business case interview frameworks")],
          practice: "Do a SWOT for a local bookshop facing online competition.",
          pt: ["research"],
        }),
      ],
    },
    {
      title: "Recommend",
      topics: [
        T("ba-present", "Recommend and present", "A one-page proposal with options, costs, risks and a clear recommendation. Decision-makers want the answer first and the details after.", {
          skills: ["presentation"], why: "Your analysis only matters if someone approves the change.", time: "1 week",
          res: [vid("how to write a one page proposal"), course("Google Technical Writing One", "https://developers.google.com/tech-writing/one")],
          practice: "Write a one-page proposal for the shop's billing problem with two options and your pick.",
          pt: ["operations", "content"],
        }),
        T("ba-prove", "Improve a real process", "Take up an operations problem on Kadam, map and fix the process with the owner, and measure the time or money saved.", {
          skills: ["process"], why: "A measured improvement in a real business is a strong interview story.", time: "2–4 weeks",
          res: [tool("diagrams.net (free)", "https://app.diagrams.net/"), docs("Google Sheets help", SHEETS)],
          practice: "Shortlist one Kadam operations problem and draw its as-is process from the description.",
          pt: ["operations"],
        }),
      ],
    },
  ],
};

const FINANCIAL_ANALYST: RoadmapData = {
  role: "financial-analyst",
  title: "Financial Analyst",
  summary: "Help a business understand its money and plan ahead.",
  intro: {
    does: "A financial analyst reads a business's numbers — sales, costs, profit, cash — and helps it plan: what to price, where to cut, whether an investment is worth it. They build spreadsheet models and explain them in plain words.",
    firstJobs: ["Financial Analyst (associate)", "FP&A Analyst", "Accounts / Finance Executive", "Credit Analyst", "Equity Research Associate"],
    salary: { range: "About ₹5.7 lakh a year on average at 1–3 years' experience (fresher figures not published)", source: SALARY_SRC, url: "https://www.ambitionbox.com/profile/financial-analyst-salary" },
    kadam: "Many Kadam businesses don't know their real cost per item or why cash runs short. Working out true costs or a simple budget for one owner gives you real numbers and a real result to show.",
  },
  sections: [
    {
      title: "Foundations",
      topics: [
        T("fa-acct", "Accounting basics", "Accounting records what comes in and goes out, and summarises it in three statements: profit and loss, balance sheet and cash flow. Every finance role starts here.", {
          skills: ["accounting"], why: "You can't analyse numbers you can't read.", time: "3–4 weeks",
          res: [course("AccountingCoach (free lessons)", "https://www.accountingcoach.com/"), course("Khan Academy: Core finance", KHAN_FIN), vid("accounting basics for beginners")],
          practice: "From a month of a shop's bills and expenses (made up is fine), prepare a simple profit-and-loss statement.",
          pt: ["finance"],
          kids: [
            S("fa-acct-pl", "Profit and loss", "What came in, what went out, and what is left over in a period.", "1 week", { res: [art("AccountingCoach: Income statement", "https://www.accountingcoach.com/income-statement/explanation")] }),
            S("fa-acct-bs", "Balance sheet", "What the business owns and owes on one day.", "1 week", { res: [art("AccountingCoach: Balance sheet", "https://www.accountingcoach.com/balance-sheet/explanation")] }),
            S("fa-acct-cash", "Cash flow", "Profit isn't cash. Credit sales and stock purchases change when money actually moves.", "1 week", { res: [art("AccountingCoach: Cash flow statement", "https://www.accountingcoach.com/cash-flow-statement/explanation")] }),
          ],
        }),
        T("fa-books", "Bookkeeping tools", "Small Indian businesses keep books in Tally, other accounting apps or plain spreadsheets. Knowing at least one helps you get data out and check it.", {
          skills: ["tally", "bookkeeping"], why: "Tally appears in many Indian finance job listings.", time: "2 weeks",
          res: [docs("TallyHelp (official)", "https://help.tallysolutions.com/"), vid("tally prime tutorial for beginners")],
          practice: "Enter 20 sample transactions in Tally or a sheet and produce a trial balance.",
          pt: ["finance"],
          kids: [
            S("fa-books-tally", "Tally", "Common accounting software in Indian small and mid-sized firms.", "2 weeks", { skills: ["tally"] }),
            S("fa-books-sheets", "Sheets-based books", "Many tiny businesses only keep a sheet or notebook. Pick this or Tally to start.", "1 week", { level: "alternative", skills: ["google sheets"] }),
          ],
        }),
        T("fa-gst", "GST and compliance", "What a small business must file, by when, and how input tax credit works. You don't need to be a CA, but you should understand the basics.", {
          skills: ["gst"], level: "optional", why: "GST affects pricing and cash for every registered Indian business.", time: "1–2 weeks",
          res: [docs("GST portal", "https://www.gst.gov.in/"), docs("CBIC GST portal", "https://cbic-gst.gov.in/"), vid("gst basics for beginners india")],
          practice: "For one invoice, work out the GST, the price before tax and the input credit the buyer can claim.",
          pt: ["finance"],
        }),
      ],
    },
    {
      title: "Spreadsheet skills",
      topics: [
        T("fa-excel", "Excel for finance", "Formulas, lookups, pivot tables and clean formatting. Finance teams live in Excel, and speed matters.", {
          skills: ["excel"], why: "Every finance interview tests Excel.", time: "2–3 weeks",
          res: [docs("Excel help & learning (Microsoft)", EXCEL), docs("XLOOKUP function", "https://support.microsoft.com/en-us/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929"), vid("excel for finance beginners")],
          practice: "Build a monthly expense tracker with categories, a pivot summary and a chart.",
          pt: ["finance", "data"],
        }),
        T("fa-model", "Spreadsheet models", "A model is a sheet where you change a few inputs (price, volume, cost) and see the result. A good model is clean and easy for others to follow and change.", {
          skills: ["excel", "financial modelling"], why: "Modelling is the core day-to-day skill of a financial analyst.", time: "3–4 weeks",
          res: [art("CFI: What is financial modelling", "https://corporatefinanceinstitute.com/resources/financial-modeling/"), vid("financial modelling for beginners excel")],
          practice: "Build a 12-month model for a small bakery with inputs for price, daily sales and costs.",
          pt: ["finance", "data"],
        }),
      ],
    },
    {
      title: "Analysis",
      topics: [
        T("fa-cost", "Costing", "Fixed costs, variable costs, cost per unit and break-even. Many small businesses don't know what one product really costs them.", {
          skills: ["costing"], why: "Getting costs right is the first step to fixing profit.", time: "1–2 weeks",
          res: [art("Break-even analysis (Investopedia)", "https://www.investopedia.com/terms/b/breakevenanalysis.asp"), course("Khan Academy: Core finance", KHAN_FIN)],
          practice: "Work out the cost per plate for a tiffin service: ingredients, gas, packing, delivery and rent share.",
          pt: ["finance", "operations"],
          kids: [
            S("fa-cost-unit", "Unit cost", "What one product really costs to make, including a fair share of fixed costs.", "3–4 days"),
            S("fa-cost-breakeven", "Break-even", "How many you must sell to cover all costs.", "2–3 days"),
          ],
        }),
        T("fa-ratios", "Financial ratios", "Ratios like margin, current ratio and debt-to-equity let you compare businesses and spot trouble early.", {
          skills: ["financial analysis"], why: "Ratios are how analysts and lenders read a business quickly.", time: "1–2 weeks",
          res: [art("Ratio analysis (Investopedia)", "https://www.investopedia.com/terms/r/ratioanalysis.asp"), art("Working capital (Investopedia)", "https://www.investopedia.com/terms/w/workingcapital.asp")],
          practice: "From a listed company's annual report, calculate three ratios and explain each in one line.",
          pt: ["finance"],
        }),
        T("fa-budget", "Budgets and forecasts", "A budget plans income and spending ahead; a forecast updates it as the year goes on. Small businesses often need a simple monthly cash plan more than anything else.", {
          skills: ["budgeting", "forecasting"], why: "FP&A roles are mostly budgeting and forecasting.", time: "1–2 weeks",
          res: [vid("how to make a budget forecast in excel"), docs("Google Sheets help", SHEETS)],
          practice: "Make a 3-month cash plan for a shop that pays suppliers in 15 days but gets paid by customers in 30.",
          pt: ["finance"],
        }),
        T("fa-pricing", "Pricing", "Prices must cover costs, match what customers will pay and leave a margin. Small changes in price often matter more than more sales.", {
          skills: ["pricing"], why: "Pricing mistakes quietly cost small businesses most of their profit.", time: "1 week",
          res: [vid("pricing strategy small business"), web("Cost-plus vs value-based pricing", "cost plus vs value based pricing explained")],
          practice: "Suggest a price for a handmade sari using its full cost and two competitor prices.",
          pt: ["finance", "marketing"],
        }),
        T("fa-tvm", "Time value of money", "A rupee today is worth more than a rupee next year. NPV and simple payback help decide if an investment like a new machine is worth it.", {
          skills: ["npv", "investment"], level: "optional", why: "Needed for investment, banking and corporate finance roles.", time: "1–2 weeks",
          res: [art("Time value of money (Investopedia)", "https://www.investopedia.com/terms/t/timevalueofmoney.asp"), art("Net present value (Investopedia)", "https://www.investopedia.com/terms/n/npv.asp")],
          practice: "Should a shop buy a ₹60,000 fridge that saves ₹2,000 a month? Work out the payback period.",
          pt: ["finance"],
        }),
      ],
    },
    {
      title: "Communicate",
      topics: [
        T("fa-present", "Explain the numbers", "Owners and managers are busy. Use plain words, one chart per message and a clear 'so what' — what they should do next.", {
          skills: ["presentation"], why: "Finance people who explain clearly get pulled into bigger decisions.", time: "1 week",
          res: [art("Storytelling with Data blog", "https://www.storytellingwithdata.com/blog"), vid("how to present financial data simply")],
          practice: "Explain your bakery model to a friend with no finance background in two minutes.",
          pt: ["finance", "content"],
        }),
        T("fa-prove", "Fix a real business's numbers", "Take up a finance problem on Kadam: true costs, a price list, a cash plan. Show the owner what changed in their margin or cash.", {
          skills: ["finance"], why: "Real numbers from a real business beat any textbook case.", time: "2–4 weeks",
          res: [art("Break-even analysis (Investopedia)", "https://www.investopedia.com/terms/b/breakevenanalysis.asp"), docs("Excel help & learning (Microsoft)", EXCEL)],
          practice: "Shortlist one Kadam finance problem and list the data you would ask the owner for.",
          pt: ["finance"],
        }),
      ],
    },
  ],
};

const JOURNALIST: RoadmapData = {
  role: "journalist",
  title: "Journalist",
  summary: "Find true stories, check them carefully, and tell them well.",
  intro: {
    does: "A journalist finds stories that matter to people, checks every fact, and tells them clearly in text, audio or video. Accuracy and fairness come before speed.",
    firstJobs: ["Trainee Reporter", "Sub-editor / Copy Editor", "Digital Content Producer", "Fact-checker", "Multimedia / Video Journalist"],
    salary: { range: "About ₹3.1 lakh a year on average at 1–3 years' experience (fresher figures not published)", source: SALARY_SRC, url: "https://www.ambitionbox.com/profile/journalist-salary" },
    kadam: "NGOs and community groups on Kadam need their stories told accurately: a programme's impact, a beneficiary's voice, a report for donors. That gives you published, checked work for your clips file.",
  },
  sections: [
    {
      title: "Reporting",
      topics: [
        T("jn-sources", "Finding stories and sources", "Stories come from noticing what has changed, what is unfair or what people talk about. Build a list of people and public records you can go back to.", {
          skills: ["reporting", "research"], why: "Editors value reporters who bring their own story ideas.", time: "1–2 weeks",
          res: [course("Google News Initiative training", "https://newsinitiative.withgoogle.com/resources/trainings/"), art("IJNet: resources for journalists", "https://ijnet.org/en")],
          practice: "Walk through your local market and pitch three story ideas in two lines each.",
          pt: ["research", "content"],
        }),
        T("jn-news", "News writing", "Lead with what matters most, keep it short, and attribute every claim. The reader should know the main fact in the first sentence.", {
          skills: ["writing"], why: "Clear, fast news writing is the base skill for every newsroom job.", time: "2 weeks",
          res: [course("Google News Initiative training", "https://newsinitiative.withgoogle.com/resources/trainings/"), vid("how to write a news story")],
          practice: "Write a 250-word news report on a college event with a one-sentence lead.",
          pt: ["content"],
          kids: [
            S("jn-news-lead", "Leads", "Who, what, where, when — in one sentence. Why and how follow.", "3 days"),
            S("jn-news-attrib", "Attribution", "Say who told you, and how they know.", "2 days"),
          ],
        }),
        T("jn-interview", "Interviewing", "Prepare questions, listen closely, ask follow-ups and record accurately. The best quotes often come after the 'main' questions are over.", {
          skills: ["interview"], why: "Most stories depend on what people tell you.", time: "1–2 weeks",
          res: [vid("journalism interview techniques"), course("Knight Center free journalism courses", "https://journalismcourses.org/")],
          practice: "Interview a street vendor for 15 minutes and write up three accurate quotes.",
          pt: ["research", "content"],
        }),
      ],
    },
    {
      title: "Verification",
      topics: [
        T("jn-fact", "Fact-checking", "Check every claim, photo, video and number before you publish. In India, misinformation spreads fast on WhatsApp, and fact-checkers are in demand.", {
          skills: ["fact-check"], why: "One wrong fact can damage a reputation and real people.", time: "2 weeks",
          res: [art("IFCN at Poynter", "https://www.poynter.org/ifcn/"), art("BOOM fact-checks", "https://www.boomlive.in/"), art("Factly", "https://factly.in/")],
          practice: "Pick a viral WhatsApp forward and check it step by step. Write what you found and how.",
          pt: ["research", "content"],
          kids: [
            S("jn-fact-image", "Checking photos and videos", "Reverse image search and checking dates and places in the picture.", "3–4 days", { res: [tool("TinEye reverse image search", "https://tineye.com/"), tool("Google Images", "https://images.google.com/")] }),
            S("jn-fact-numbers", "Checking numbers", "Find the original source, check the unit and the year, and compare with official data.", "3 days", { res: [docs("Open government data (data.gov.in)", "https://data.gov.in/")] }),
          ],
        }),
      ],
    },
    {
      title: "Ethics and law",
      topics: [
        T("jn-ethics", "Ethics and law", "Consent, privacy, fairness and the basics of defamation. Protect vulnerable people, give the other side a chance to respond, and correct mistakes openly.", {
          skills: ["media ethics"], why: "Ethical lapses can hurt people and end careers.", time: "1–2 weeks",
          res: [web("Press Council of India: Norms of Journalistic Conduct", "Press Council of India Norms of Journalistic Conduct"), course("Knight Center free journalism courses", "https://journalismcourses.org/")],
          practice: "Read one news story about a minor or a victim and note how it protects (or fails to protect) their identity.",
          pt: ["content", "research"],
        }),
      ],
    },
    {
      title: "Specialise",
      topics: [
        T("jn-data", "Data journalism", "Find stories in spreadsheets and public data: budgets, crime figures, school results. Simple sorting and a clear chart can reveal what nobody else noticed.", {
          skills: ["data", "excel"], why: "Data skills set you apart in a crowded field.", time: "3–4 weeks",
          res: [art("Data Journalism Handbook", "https://datajournalism.com/read/handbook/one"), docs("Open government data (data.gov.in)", "https://data.gov.in/"), docs("Google Sheets help", SHEETS)],
          practice: "Download a district-level dataset from data.gov.in and find one surprising fact worth a story.",
          pt: ["data", "research"],
        }),
        T("jn-multi", "Audio and video", "Podcasts and short video reports shot and edited on a phone. Mobile journalism is common in Indian digital newsrooms.", {
          skills: ["video editing"], level: "optional", why: "Digital newsrooms want reporters who can also shoot and edit.", time: "2–3 weeks",
          res: [vid("mobile journalism basics"), vid("edit video on phone for beginners")],
          practice: "Shoot and edit a 60-second phone video report on a local issue, with captions.",
          pt: ["content"],
        }),
        T("jn-feature", "Features and long-form", "Longer stories with scenes, characters and context. They take more time but are what readers remember.", {
          skills: ["storytelling", "writing"], level: "optional", why: "Features build your name as a writer.", time: "2–3 weeks",
          res: [vid("feature writing journalism tips"), art("IJNet: resources for journalists", "https://ijnet.org/en")],
          practice: "Write a 900-word feature on a craftsperson in your town, with at least two scenes.",
          pt: ["content", "research"],
        }),
      ],
    },
    {
      title: "Publish",
      topics: [
        T("jn-portfolio", "Build a clips file", "Editors hire from published work. Keep links to your best 5–8 pieces with a line on what each shows.", {
          skills: ["portfolio"], why: "Your clips matter more than your degree in most newsrooms.", time: "ongoing",
          res: [tool("WordPress.com", "https://wordpress.com/"), vid("journalism portfolio tips")],
          practice: "Set up a simple page listing your published pieces, newest first.",
          pt: ["content"],
        }),
        T("jn-prove", "Publish a real story", "Report a local story, or tell an NGO's story accurately on Kadam. Check every fact, get consent, and track where it was read or used.", {
          skills: ["reporting"], why: "Published, checked work is the strongest proof you can show an editor.", time: "1–3 weeks",
          res: [course("Google News Initiative training", "https://newsinitiative.withgoogle.com/resources/trainings/"), art("IFCN at Poynter", "https://www.poynter.org/ifcn/")],
          practice: "Pick one Kadam content or research problem from an NGO and list the people you would interview.",
          pt: ["content", "research"],
        }),
      ],
    },
  ],
};

const BASE_ROADMAPS: RoadmapData[] = [DATA_ANALYST, FRONTEND, DIGITAL_MARKETER, UX_DESIGNER, CONTENT_WRITER, BUSINESS_ANALYST, FINANCIAL_ANALYST, JOURNALIST];

/** Every hand-written roadmap: the base set above plus one file per role in ./roadmaps/. Static roadmaps never call AI. */
export const SEEDED_ROADMAPS: RoadmapData[] = [...BASE_ROADMAPS, ...EXTRA_ROADMAPS];

/** The hand-written roadmap for a role, if there is one. */
export const seededRoadmap = (role: string): RoadmapData | undefined => SEEDED_ROADMAPS.find((r) => r.role === role);

/** roadmap.sh slugs confirmed to return HTTP 200 (curl, 17 Nov 2026). Credit links are shown only for these. */
export const CONFIRMED_RSH = new Set([
  "frontend", "backend", "full-stack", "product-manager", "data-analyst", "ux-design", "bi-analyst", "technical-writer", "devrel",
  "ai-data-scientist", "computer-science", "qa", "sql", "python", "javascript", "react", "git-github", "prompt-engineering",
  "android", "devops", "cyber-security", "ai-engineer", "engineering-manager",
]);

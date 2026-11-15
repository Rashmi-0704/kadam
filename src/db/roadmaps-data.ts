export type RoadmapStep = {
  id: string;
  title: string;
  order: number;
  description: string;
  skills: string[];
  resources: { title: string; url: string }[];
  prerequisites: string[];
};
export type RoadmapData = { role: string; title: string; summary: string; steps: RoadmapStep[] };

function steps(prefix: string, list: Omit<RoadmapStep, "id" | "order" | "prerequisites">[]): RoadmapStep[] {
  return list.map((s, i) => ({ ...s, id: `${prefix}-${i + 1}`, order: i + 1, prerequisites: i === 0 ? [] : [`${prefix}-${i}`] }));
}

export const SEEDED_ROADMAPS: RoadmapData[] = [
  {
    role: "data-analyst",
    title: "Data Analyst",
    summary: "Turn messy numbers into clear answers that help a business decide.",
    steps: steps("da", [
      { title: "Spreadsheet basics", description: "Formulas, sorting, filters, pivot tables and charts.", skills: ["excel", "google sheets", "pivot tables"], resources: [{ title: "Google Sheets training", url: "https://support.google.com/a/users/answer/9282959" }, { title: "Excel video training", url: "https://support.microsoft.com/en-us/office/excel-video-training-9bc05390-e94c-46af-a5b3-d7c22f6990bb" }] },
      { title: "Statistics you will use", description: "Averages, spread, percentages, trends and simple probability.", skills: ["statistics"], resources: [{ title: "Khan Academy: Statistics", url: "https://www.khanacademy.org/math/statistics-probability" }] },
      { title: "SQL for asking questions of data", description: "SELECT, WHERE, GROUP BY and JOIN.", skills: ["sql"], resources: [{ title: "SQLBolt interactive lessons", url: "https://sqlbolt.com/" }] },
      { title: "Python and pandas", description: "Load, clean and reshape data with code.", skills: ["python", "pandas"], resources: [{ title: "Python tutorial", url: "https://docs.python.org/3/tutorial/" }, { title: "pandas getting started", url: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/" }] },
      { title: "Charts that tell a story", description: "Pick the right chart and remove clutter.", skills: ["data visualisation"], resources: [{ title: "Storytelling with Data blog", url: "https://www.storytellingwithdata.com/blog" }] },
      { title: "Dashboards", description: "Build a simple dashboard a business owner can read on a phone.", skills: ["dashboard", "looker studio", "power bi"], resources: [{ title: "Looker Studio help", url: "https://support.google.com/looker-studio" }] },
      { title: "Forecasting basics", description: "Moving averages and seasonality for daily or weekly demand.", skills: ["forecasting"], resources: [{ title: "Forecasting: Principles and Practice", url: "https://otexts.com/fpp3/" }] },
      { title: "Prove it on a real problem", description: "Solve a Kadam problem and share the impact report.", skills: [], resources: [] },
    ]),
  },
  {
    role: "frontend-developer",
    title: "Frontend Developer",
    summary: "Build websites and apps people can use easily on any phone.",
    steps: steps("fe", [
      { title: "HTML and CSS", description: "Page structure, layout with flexbox and grid, responsive design.", skills: ["html", "css"], resources: [{ title: "MDN: Learn web development", url: "https://developer.mozilla.org/en-US/docs/Learn" }] },
      { title: "JavaScript", description: "Variables, functions, arrays, the DOM and fetch.", skills: ["javascript"], resources: [{ title: "javascript.info", url: "https://javascript.info/" }] },
      { title: "Git and GitHub", description: "Save your work, branch and share code.", skills: ["git", "github"], resources: [{ title: "Pro Git book", url: "https://git-scm.com/book/en/v2" }] },
      { title: "React", description: "Components, state and props.", skills: ["react"], resources: [{ title: "react.dev: Learn", url: "https://react.dev/learn" }] },
      { title: "Accessibility", description: "Make pages usable for everyone, including screen-reader users.", skills: ["accessibility"], resources: [{ title: "web.dev: Learn Accessibility", url: "https://web.dev/learn/accessibility" }] },
      { title: "Performance on cheap phones", description: "Small pages, fast loading, good images.", skills: ["performance"], resources: [{ title: "web.dev: Learn Performance", url: "https://web.dev/learn/performance" }] },
      { title: "Deploy your site", description: "Put a project online with a free host.", skills: ["deployment"], resources: [{ title: "Vercel docs", url: "https://vercel.com/docs" }] },
    ]),
  },
  {
    role: "digital-marketer",
    title: "Digital Marketer",
    summary: "Help small businesses find and keep customers online.",
    steps: steps("dm", [
      { title: "Marketing fundamentals", description: "Customers, positioning, offers and the sales funnel.", skills: ["marketing"], resources: [{ title: "Google Digital Garage", url: "https://learndigital.withgoogle.com/digitalgarage" }] },
      { title: "WhatsApp Business and local reach", description: "Catalogues, broadcast lists and Google Business Profile.", skills: ["whatsapp", "google business profile"], resources: [{ title: "WhatsApp Business", url: "https://business.whatsapp.com/" }, { title: "Google Business Profile help", url: "https://support.google.com/business" }] },
      { title: "Social media content", description: "Plan posts and reels people want to share.", skills: ["instagram", "social media", "canva"], resources: [{ title: "Meta Blueprint", url: "https://www.facebook.com/business/learn" }] },
      { title: "SEO basics", description: "Help people find the business on Google.", skills: ["seo"], resources: [{ title: "Google SEO starter guide", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide" }] },
      { title: "Measure what works", description: "Track sign-ups, orders and repeat customers.", skills: ["analytics", "google analytics"], resources: [{ title: "Google Skillshop", url: "https://skillshop.withgoogle.com/" }] },
      { title: "Run a small campaign", description: "Set a goal, a budget and a test, then report results.", skills: ["campaigns"], resources: [{ title: "HubSpot Academy", url: "https://academy.hubspot.com/" }] },
    ]),
  },
  {
    role: "ux-designer",
    title: "UX Designer",
    summary: "Make products simple and pleasant for the people who use them.",
    steps: steps("ux", [
      { title: "Design principles", description: "Hierarchy, contrast, spacing and common UX laws.", skills: ["design"], resources: [{ title: "Laws of UX", url: "https://lawsofux.com/" }] },
      { title: "User research", description: "Interview users and find what they really need.", skills: ["user research"], resources: [{ title: "NN/g articles", url: "https://www.nngroup.com/articles/" }] },
      { title: "Figma", description: "Frames, components and auto layout.", skills: ["figma"], resources: [{ title: "Figma Learn", url: "https://help.figma.com/hc/en-us" }] },
      { title: "Wireframes and prototypes", description: "Sketch flows, then click-through prototypes.", skills: ["wireframe", "prototype"], resources: [{ title: "NN/g: Wireframing", url: "https://www.nngroup.com/articles/wireflows/" }] },
      { title: "Usability testing", description: "Watch five people use your design and fix what trips them.", skills: ["usability"], resources: [{ title: "Usability Testing 101", url: "https://www.nngroup.com/articles/usability-testing-101/" }] },
      { title: "Accessible design", description: "Colour contrast, text size, and designing for first-time users.", skills: ["accessibility"], resources: [{ title: "W3C WAI fundamentals", url: "https://www.w3.org/WAI/fundamentals/" }] },
    ]),
  },
  {
    role: "content-writer",
    title: "Content Writer",
    summary: "Write clear words that make people read, trust and act.",
    steps: steps("cw", [
      { title: "Plain writing", description: "Short sentences, active voice, one idea at a time.", skills: ["writing"], resources: [{ title: "Plain language guidelines", url: "https://www.plainlanguage.gov/guidelines/" }] },
      { title: "Structure and editing", description: "Outlines, headings and cutting what is not needed.", skills: ["editing"], resources: [{ title: "Google Technical Writing courses", url: "https://developers.google.com/tech-writing" }] },
      { title: "Storytelling", description: "Characters, conflict and a clear ask.", skills: ["storytelling"], resources: [{ title: "The Moth: storytelling tips", url: "https://themoth.org/share-your-story/storytelling-tips-tricks" }] },
      { title: "Writing for the web", description: "Headlines, SEO basics and scannable pages.", skills: ["seo", "copywriting"], resources: [{ title: "Google SEO starter guide", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide" }] },
      { title: "Build a portfolio", description: "Publish 3–5 pieces that show range.", skills: ["portfolio"], resources: [] },
    ]),
  },
  {
    role: "business-analyst",
    title: "Business Analyst",
    summary: "Understand how a business works and design a better way.",
    steps: steps("ba", [
      { title: "How businesses make money", description: "Revenue, costs, margins and customers.", skills: ["business basics"], resources: [{ title: "Khan Academy: Core finance", url: "https://www.khanacademy.org/economics-finance-domain/core-finance" }] },
      { title: "Process mapping", description: "Draw today's process step by step and find the slow parts.", skills: ["process mapping", "process"], resources: [{ title: "What is process mapping", url: "https://www.lucidchart.com/pages/process-mapping" }] },
      { title: "Talking to stakeholders", description: "Ask good questions and write down requirements.", skills: ["requirements", "stakeholder"], resources: [{ title: "Atlassian: Requirements", url: "https://www.atlassian.com/agile/product-management/requirements" }] },
      { title: "Spreadsheets for analysis", description: "Clean data and build simple models.", skills: ["excel"], resources: [{ title: "Excel video training", url: "https://support.microsoft.com/en-us/office/excel-video-training-9bc05390-e94c-46af-a5b3-d7c22f6990bb" }] },
      { title: "SQL basics", description: "Pull the numbers you need yourself.", skills: ["sql"], resources: [{ title: "SQLBolt", url: "https://sqlbolt.com/" }] },
      { title: "Recommend and present", description: "One-page proposals with options and a clear choice.", skills: ["presentation"], resources: [] },
    ]),
  },
  {
    role: "financial-analyst",
    title: "Financial Analyst",
    summary: "Help a business understand its money and plan ahead.",
    steps: steps("fa", [
      { title: "Accounting basics", description: "Income, expenses, assets and the three statements.", skills: ["accounting"], resources: [{ title: "AccountingCoach", url: "https://www.accountingcoach.com/" }] },
      { title: "Costing", description: "Fixed and variable costs, unit cost and break-even.", skills: ["costing"], resources: [{ title: "Khan Academy: Core finance", url: "https://www.khanacademy.org/economics-finance-domain/core-finance" }] },
      { title: "Spreadsheet modelling", description: "Build a clean model others can follow.", skills: ["excel", "financial modelling"], resources: [{ title: "CFI: Financial modelling guide", url: "https://corporatefinanceinstitute.com/resources/financial-modeling/" }] },
      { title: "GST and small business compliance", description: "What a small business must file and when.", skills: ["gst"], resources: [{ title: "CBIC GST portal", url: "https://cbic-gst.gov.in/" }] },
      { title: "Pricing", description: "Set prices that cover costs and still sell.", skills: ["pricing"], resources: [] },
      { title: "Present the numbers", description: "Explain findings in plain words with one chart.", skills: ["presentation"], resources: [] },
    ]),
  },
  {
    role: "journalist",
    title: "Journalist",
    summary: "Find true stories, check them, and tell them well.",
    steps: steps("jn", [
      { title: "News writing", description: "The inverted pyramid, leads and attribution.", skills: ["writing"], resources: [{ title: "Google News Initiative training", url: "https://newsinitiative.withgoogle.com/resources/trainings/" }] },
      { title: "Interviewing", description: "Prepare, listen, follow up, and record accurately.", skills: ["interview"], resources: [] },
      { title: "Fact-checking", description: "Verify claims, photos and numbers.", skills: ["fact-check"], resources: [{ title: "IFCN at Poynter", url: "https://www.poynter.org/ifcn/" }] },
      { title: "Data journalism", description: "Find stories in spreadsheets and public data.", skills: ["data", "excel"], resources: [{ title: "Data Journalism Handbook", url: "https://datajournalism.com/read/handbook/one" }] },
      { title: "Ethics and law", description: "Consent, privacy, defamation basics.", skills: ["media ethics"], resources: [] },
      { title: "Publish a story", description: "Report a local story end to end.", skills: ["reporting"], resources: [] },
    ]),
  },
];

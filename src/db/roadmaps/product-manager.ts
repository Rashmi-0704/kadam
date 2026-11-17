import type { RoadmapData } from "../roadmaps-data.ts";
import { art, course, find, guide, sub, tool, topic, vid } from "./_kit.ts";

const productManager: RoadmapData = {
  role: "product-manager",
  title: "Product Manager",
  summary: "Decide what to build and why, then help designers and engineers ship it and check that it actually helped.",
  rsh: ["product-manager"],
  intro: {
    does: "A product manager finds the most important problem users have, decides what the team should build to solve it, and makes sure it ships and works. PMs do not usually code or design; they talk to users, write clear plans, set priorities and measure results.",
    firstJobs: ["Associate Product Manager (APM)", "Product Analyst", "Business Analyst moving into product", "Product Operations Associate", "Founder's office / Chief of Staff associate at a startup"],
    kadam: "APM roles are hard to get without proof that you can find a real problem and drive a solution. A Kadam problem lets you interview a real owner, scope a fix, work with a builder and show a business-verified outcome — the exact story PM interviewers ask for.",
  },
  sections: [
    {
      title: "Understand the job",
      topics: [
        topic("pm-role", "What a PM actually does", "A PM owns the 'what' and the 'why'; engineers and designers own the 'how'. Day to day that means talking to users, reading data, writing specs, running meetings and saying no to many good ideas. Your output is a better product, not documents.", {
          why: "Knowing the real job helps you build the right skills and answer 'why product?' in interviews.",
          time: "2–3 days",
          practice: "Pick an app you use daily (say, a food delivery app). Write one page on a problem it solved for you and how they probably measured it.",
          skills: ["product thinking"],
          resources: [guide("Atlassian: Product management guide", "https://www.atlassian.com/agile/product-management"), vid("what does a product manager do")],
        }),
        topic("pm-business", "How businesses make money", "Products exist to help users and keep the business alive. Learn the basics: revenue, costs, margin, customer acquisition cost and how long customers stay. A kirana, an edtech app and an NGO each 'win' in different ways.", {
          why: "Good PMs make trade-offs that help users and the business at the same time.",
          time: "1 week",
          practice: "For a local tiffin service, sketch how it makes money: price per meal, cost per meal, customers per day, and what would raise profit.",
          problemTypes: ["finance", "research"],
          skills: ["business models", "unit economics"],
          resources: [course("Khan Academy: Core finance", "https://www.khanacademy.org/economics-finance-domain/core-finance"), art("Investopedia: Key performance indicators", "https://www.investopedia.com/terms/k/kpi.asp"), vid("unit economics explained")],
        }),
      ],
    },
    {
      title: "Discover the problem",
      topics: [
        topic("pm-interviews", "User interviews", "Talk to real users about what they do today, not what they would like. Ask about the last time they faced the problem, listen more than you speak, and avoid leading questions. Five good interviews will teach you more than a 500-person survey.", {
          why: "Every product decision should trace back to something a real user did or said.",
          time: "1 week",
          practice: "Interview three shopkeepers about how they track udhaar (credit). Note exact quotes and what they use today.",
          problemTypes: ["research"],
          skills: ["user interviews", "user research"],
          resources: [art("NN/g: User interviews 101", "https://www.nngroup.com/articles/user-interviews/"), guide("Y Combinator library (search 'talk to users')", "https://www.ycombinator.com/library"), vid("the mom test customer interviews")],
          children: [
            sub("pm-int-questions", "Asking good questions", "Ask about past behaviour ('last time you…'), not opinions about the future.", "2 days"),
            sub("pm-int-notes", "Notes and synthesis", "Group quotes into themes and count how often each pain comes up.", "2 days"),
          ],
        }),
        topic("pm-problem", "Framing the problem", "Write the problem in one or two sentences: who has it, what they are trying to do, and what gets in the way. Personas, journey maps and 'jobs to be done' are tools to sharpen that statement. If you cannot state it simply, you are not ready to build.", {
          why: "A clear problem statement keeps the whole team pointed the same way.",
          time: "3–5 days",
          practice: "Turn your shopkeeper interviews into a one-line problem statement and a simple journey map of a credit sale.",
          problemTypes: ["research", "design_ux"],
          skills: ["problem framing", "personas"],
          resources: [art("NN/g: Personas", "https://www.nngroup.com/articles/persona/"), art("NN/g: Journey mapping 101", "https://www.nngroup.com/articles/journey-mapping-101/"), vid("jobs to be done framework explained")],
        }),
        topic("pm-market", "Market and competitor research", "Find out who else solves this problem, how they price it and what users say about them. App store reviews, Google Maps reviews and Reddit threads are free gold. Look for gaps, not features to copy.", {
          why: "You need to know why your product deserves to exist next to the alternatives.",
          time: "3–5 days",
          practice: "Compare three billing apps used by Indian kiranas. Read 20 Play Store reviews of each and list the top complaints.",
          problemTypes: ["research", "marketing"],
          skills: ["market research", "competitor analysis"],
          resources: [art("Investopedia: SWOT analysis", "https://www.investopedia.com/terms/s/swot.asp"), vid("competitor analysis for product managers")],
        }),
      ],
    },
    {
      title: "Decide what to build",
      topics: [
        topic("pm-prioritise", "Prioritising", "There are always more ideas than time. Use simple frameworks like RICE (reach, impact, confidence, effort) or impact vs effort to compare them, but remember the framework only helps you think; you still decide. Saying no clearly and kindly is part of the job.", {
          why: "Picking the right next thing is the PM's biggest lever.",
          time: "3–4 days",
          practice: "List eight feature ideas for a college canteen ordering app and rank them with RICE. Explain your top pick in three lines.",
          problemTypes: ["research", "operations"],
          skills: ["prioritisation", "rice"],
          resources: [art("Intercom: RICE prioritisation", "https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/"), vid("product prioritization frameworks")],
        }),
        topic("pm-mvp", "MVPs and experiments", "A minimum viable product is the smallest thing that tests whether your idea works. Often it is not software at all: a Google Form, a WhatsApp group or a paper sign-up sheet. Test the riskiest assumption first.", {
          why: "Small tests save weeks of building the wrong thing.",
          time: "3–5 days",
          practice: "Before building a canteen pre-order app, run a two-day test with a Google Form and count how many students use it.",
          problemTypes: ["research", "operations"],
          skills: ["mvp", "experimentation"],
          resources: [course("Y Combinator Startup School", "https://www.startupschool.org/"), vid("what is an mvp minimum viable product")],
        }),
        topic("pm-roadmap", "Roadmaps and goals", "A product roadmap shows what the team plans to work on and why, usually as Now / Next / Later. Tie each item to a goal such as an OKR. Keep it honest: a roadmap is a plan, not a promise.", {
          why: "Roadmaps help leaders, sales and engineers know what is coming and why.",
          time: "2–3 days",
          practice: "Make a Now / Next / Later roadmap for a small NGO's volunteer app, with one goal per column.",
          skills: ["roadmapping", "okrs"],
          resources: [guide("Atlassian: Product roadmaps", "https://www.atlassian.com/agile/product-management/product-roadmaps"), guide("Google re:Work: Set goals with OKRs", "https://rework.withgoogle.com/guides/set-goals-with-okrs/steps/introduction/")],
        }),
      ],
    },
    {
      title: "Shape and ship",
      topics: [
        topic("pm-spec", "Writing specs and user stories", "A spec (or PRD) explains the problem, who it is for, what success looks like, and what is in and out of scope. User stories break it into small pieces: 'As a shop owner, I want to… so that…'. Short and clear beats long and complete.", {
          why: "Clear writing is how a PM turns decisions into work others can do without guessing.",
          time: "1 week",
          practice: "Write a one-page spec for 'send a WhatsApp reminder to customers with unpaid udhaar', with three user stories and acceptance criteria.",
          problemTypes: ["tech_build", "content"],
          skills: ["prd", "user stories", "writing"],
          resources: [guide("Atlassian: Product requirements", "https://www.atlassian.com/agile/product-management/requirements"), guide("Atlassian: User stories", "https://www.atlassian.com/agile/project-management/user-stories"), course("Google: Technical writing one", "https://developers.google.com/tech-writing/one")],
        }),
        topic("pm-design", "Working with design", "You do not need to be a designer, but you should sketch flows, read wireframes and spot usability problems. Learn basic Figma and the common usability rules so you can give useful feedback.", {
          why: "PMs and designers work side by side; shared language makes reviews faster.",
          time: "1 week",
          practice: "Sketch the three screens of your udhaar reminder feature on paper, then test them with one shopkeeper.",
          problemTypes: ["design_ux"],
          skills: ["wireframing", "figma", "usability"],
          resources: [art("NN/g: 10 usability heuristics", "https://www.nngroup.com/articles/ten-usability-heuristics/"), art("NN/g: Usability testing 101", "https://www.nngroup.com/articles/usability-testing-101/"), guide("Figma help centre", "https://help.figma.com/hc/en-us")],
        }),
        topic("pm-agile", "Working with engineers (Agile)", "Most teams work in short cycles called sprints, with a backlog of tasks, a daily check-in and a review at the end. Learn the basics of Scrum and Kanban, how to break work down, and enough tech vocabulary (API, database, frontend) to follow the conversation.", {
          why: "You will run or join these rituals every week.",
          time: "1 week",
          practice: "Set up a Trello board for your Kadam project with a backlog, this week, doing and done, and run it for two weeks.",
          problemTypes: ["operations", "tech_build"],
          skills: ["agile", "scrum", "jira"],
          resources: [guide("Atlassian: Agile guide", "https://www.atlassian.com/agile"), guide("The Scrum Guide", "https://scrumguides.org/scrum-guide.html"), tool("Trello guide", "https://trello.com/guide")],
          children: [
            sub("pm-agile-tech", "Tech basics for PMs", "What frontend, backend, API and database mean, so you can follow trade-offs.", "1 week", "recommended", [guide("MDN: How the web works", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works")]),
          ],
        }),
        topic("pm-launch", "Launching", "A launch is more than switching a feature on. Plan who needs to know (users, support, sales), how you will explain it, and what you will watch in the first week. Small launches to a few users first reduce risk.", {
          why: "A great feature nobody knows about has zero impact.",
          time: "2–3 days",
          level: "optional",
          practice: "Write a launch plan for your Kadam solution: a WhatsApp message for the owner's customers and a check-in after 7 days.",
          problemTypes: ["marketing", "operations"],
          skills: ["go-to-market"],
          resources: [vid("product launch checklist"), find("product launch plan template")],
        }),
      ],
    },
    {
      title: "Measure and learn",
      topics: [
        topic("pm-metrics", "Product metrics", "Decide what number tells you the product is working: daily users, orders per week, repeat customers, time saved. Pick one main metric and a few supporting ones, and write them down before you launch.", {
          why: "Without a metric you cannot tell if your work helped.",
          time: "3–5 days",
          practice: "Define the main metric and two supporting metrics for your Kadam solution, and how the owner will record them each week.",
          problemTypes: ["data"],
          skills: ["metrics", "kpis"],
          resources: [art("Investopedia: KPIs", "https://www.investopedia.com/terms/k/kpi.asp"), vid("product metrics for product managers")],
        }),
        topic("pm-data", "Data skills: Sheets, SQL, analytics", "PMs pull their own numbers. Get comfortable with spreadsheets and pivot tables, learn basic SQL, and understand a tool like Google Analytics. Basic statistics stops you from celebrating a change that was just luck.", {
          why: "PMs who can answer their own data questions move much faster.",
          time: "3–4 weeks",
          practice: "Take a month of a shop's sales in Google Sheets and find the busiest day, best-selling item and repeat-customer rate.",
          problemTypes: ["data"],
          skills: ["sql", "google sheets", "google analytics"],
          resources: [course("SQLBolt", "https://sqlbolt.com/"), guide("Google Sheets help", "https://support.google.com/docs/topic/9054603"), course("Google Skillshop (Analytics)", "https://skillshop.withgoogle.com/"), course("Khan Academy: Statistics", "https://www.khanacademy.org/math/statistics-probability")],
          children: [
            sub("pm-data-ab", "A/B tests", "Show two versions to similar users and compare. Needs enough users to be trustworthy.", "3–4 days", "optional", [vid("a/b testing explained")]),
          ],
        }),
        topic("pm-story", "Telling the story", "Present what you learned and decided in a short, clear way: problem, what you did, result, next step. Use one chart per point. Leaders remember stories with numbers, not slide counts.", {
          why: "Your ideas only move forward if you can convince others.",
          time: "Ongoing",
          practice: "Present your Kadam project in five slides to a friend in five minutes: problem, users, solution, result, what's next.",
          problemTypes: ["content"],
          skills: ["communication", "presentation"],
          resources: [vid("how to present product updates to stakeholders"), find("product case study presentation structure")],
        }),
      ],
    },
  ],
};

export default productManager;

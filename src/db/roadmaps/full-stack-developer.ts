import type { RoadmapData } from "../roadmaps-data.ts";
import { course, find, guide, sub, tool, topic, vid } from "./_kit.ts";

const fullStackDeveloper: RoadmapData = {
  role: "full-stack-developer",
  title: "Full Stack Developer",
  summary: "Build a whole product yourself: the screens people tap, the server behind them, and the database that remembers everything.",
  rsh: ["full-stack"],
  intro: {
    does: "A full stack developer builds both the frontend (what users see in the browser or phone) and the backend (servers, APIs and databases). In small teams and startups, one full stack developer often takes a feature from idea to live link.",
    firstJobs: ["Full Stack Developer (fresher)", "Software Engineer (MERN / Next.js)", "Associate Software Engineer", "Web Developer at a startup or agency", "Freelance web developer for small businesses"],
    kadam: "Kadam problems are often 'we need a simple app for this', which is exactly full stack work: a stock tracker, a booking page, an order form. Shipping one end to end, with the business confirming it works, is the strongest portfolio piece you can show.",
  },
  sections: [
    {
      title: "Web foundations",
      topics: [
        topic("fs-html-css", "HTML and CSS", "HTML gives a page its structure and CSS makes it look right on every screen. Learn semantic tags, forms, Flexbox, Grid and mobile-first layouts. Most Indian users are on phones, so design for a small screen first.", {
          why: "Every web app, however fancy, ends up as HTML and CSS in the browser.",
          time: "3–4 weeks",
          practice: "Build a one-page site for a kirana store: shop timings, a product list and a 'Order on WhatsApp' button that looks good on a phone.",
          problemTypes: ["tech_build", "design_ux"],
          skills: ["html", "css", "responsive design"],
          resources: [
            course("freeCodeCamp: Responsive web design", "https://www.freecodecamp.org/learn/2022/responsive-web-design"),
            guide("MDN: Learn web development", "https://developer.mozilla.org/en-US/docs/Learn_web_development"),
            course("web.dev: Learn", "https://web.dev/learn"),
          ],
          children: [
            sub("fs-html-forms", "Forms", "Inputs, labels and validation: how users send you data.", "2–3 days", "recommended", [course("web.dev: Learn forms", "https://web.dev/learn/forms")]),
            sub("fs-css-layout", "Flexbox and Grid", "The two layout tools you will use every day.", "1 week"),
            sub("fs-css-tailwind", "Tailwind CSS", "Utility classes that speed up styling. Common in startups.", "3–4 days", "optional", [guide("Tailwind CSS docs", "https://tailwindcss.com/docs")]),
          ],
        }),
        topic("fs-js", "JavaScript", "JavaScript makes pages interactive and also runs on the server with Node.js, so one language covers both ends. Learn variables, functions, arrays and objects, the DOM, events, and fetching data with async/await.", {
          why: "It is the one language a full stack developer cannot skip.",
          time: "4–6 weeks",
          practice: "Add a live search box to your kirana page that filters the product list as you type.",
          problemTypes: ["tech_build"],
          skills: ["javascript"],
          resources: [
            guide("The Modern JavaScript Tutorial", "https://javascript.info/"),
            course("freeCodeCamp: JavaScript", "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8"),
            guide("MDN: Using the Fetch API", "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"),
          ],
          children: [
            sub("fs-js-async", "async / await", "Wait for data from a server without freezing the page.", "3–4 days"),
            sub("fs-js-ts", "TypeScript", "JavaScript with types. Catches many bugs before you run the code; most new projects use it.", "1–2 weeks", "recommended", [guide("TypeScript handbook", "https://www.typescriptlang.org/docs/handbook/intro.html")], ["typescript"]),
          ],
        }),
        topic("fs-git", "Git, GitHub and the terminal", "Git tracks every change to your code and GitHub shares it. Learn to commit, branch, merge and open a pull request, and get comfortable running commands in a terminal.", {
          why: "Teams review your work through pull requests; employers read your GitHub.",
          time: "3–5 days",
          practice: "Push your kirana site to GitHub and publish it free with GitHub Pages.",
          skills: ["git", "github"],
          resources: [course("GitHub Skills", "https://skills.github.com/"), guide("GitHub Pages docs", "https://docs.github.com/en/pages"), guide("Pro Git book", "https://git-scm.com/book/en/v2")],
        }),
      ],
    },
    {
      title: "Frontend framework",
      topics: [
        topic("fs-react", "React", "React builds screens out of small reusable components that update when your data changes. Learn components, props, state, effects and forms. It is the most hired-for frontend skill in India.", {
          why: "Most full stack job posts in India ask for React.",
          time: "3–4 weeks",
          practice: "Rebuild a college fest registration page in React: event cards, a sign-up form and a 'registered' confirmation.",
          problemTypes: ["tech_build"],
          skills: ["react"],
          resources: [guide("React: Learn", "https://react.dev/learn"), vid("react tutorial for beginners"), course("The Odin Project", "https://www.theodinproject.com/")],
          children: [
            sub("fs-react-state", "State and props", "How data flows down and events flow up.", "1 week"),
            sub("fs-react-forms", "Forms in React", "Controlled inputs, validation and showing errors kindly.", "3–4 days"),
            sub("fs-react-vue", "Vue or Svelte", "Good alternatives. Learn one framework well before trying another.", "2–3 weeks", "alternative"),
          ],
        }),
        topic("fs-next", "A full stack framework (Next.js)", "Next.js puts React pages and server code in one project, with routing, data loading and deployment built in. It lets one person ship a complete product quickly, which is why many startups use it.", {
          why: "It is the fastest way for one developer to ship a whole product.",
          time: "2–3 weeks",
          practice: "Turn your fest page into a Next.js app with a page per event and a server action that saves registrations.",
          problemTypes: ["tech_build"],
          skills: ["next.js"],
          resources: [course("Next.js Learn (free course)", "https://nextjs.org/learn"), guide("Next.js docs", "https://nextjs.org/docs")],
        }),
        topic("fs-a11y", "Accessibility and performance", "Make your app usable with a screen reader, a keyboard and a slow 4G connection on a cheap phone. Use proper labels, enough contrast, small images and fewer scripts. Lighthouse will score you and show what to fix.", {
          why: "Real users in India often have older phones and patchy data.",
          time: "1 week",
          practice: "Run Lighthouse on your Kadam project and raise the performance and accessibility scores above 90.",
          problemTypes: ["tech_build", "design_ux"],
          skills: ["accessibility", "performance"],
          resources: [course("web.dev: Learn accessibility", "https://web.dev/learn/accessibility"), course("web.dev: Learn performance", "https://web.dev/learn/performance"), tool("Lighthouse", "https://developer.chrome.com/docs/lighthouse/overview")],
        }),
      ],
    },
    {
      title: "Backend and data",
      topics: [
        topic("fs-node", "Node.js and APIs", "On the server you receive requests, check them, talk to the database and send back JSON. Learn to build REST endpoints, validate input and return clear errors. Express or Next.js route handlers are both fine.", {
          why: "Your frontend is only as good as the API feeding it data.",
          time: "2–3 weeks",
          practice: "Build an API for a small NGO's donation log: add a donation, list donations by month, and total them.",
          problemTypes: ["tech_build"],
          skills: ["node.js", "rest api"],
          resources: [
            guide("Node.js: Introduction", "https://nodejs.org/learn/getting-started/introduction-to-nodejs"),
            guide("MDN: Express tutorial", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs"),
            course("freeCodeCamp: Back end development and APIs", "https://www.freecodecamp.org/learn/back-end-development-and-apis"),
          ],
          children: [
            sub("fs-node-validate", "Input validation", "Check every field the client sends before saving it.", "2 days", "recommended", [tool("Zod", "https://zod.dev/")]),
            sub("fs-node-http", "HTTP methods and status codes", "Use GET, POST, PATCH, DELETE and the right codes.", "1–2 days", "recommended", [guide("MDN: HTTP status codes", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status")]),
          ],
        }),
        topic("fs-db", "Databases", "Store your data in a relational database like PostgreSQL and learn enough SQL to design tables and write joins. An ORM such as Prisma or Drizzle makes it easier to use from TypeScript.", {
          why: "Every useful app remembers things; the database is where it does.",
          time: "2–3 weeks",
          practice: "Design tables for a tailor shop: customers, measurements and orders with due dates. Query 'orders due this week'.",
          problemTypes: ["tech_build", "data"],
          skills: ["sql", "postgresql", "orm"],
          resources: [course("SQLBolt", "https://sqlbolt.com/"), guide("PostgreSQL tutorial", "https://www.postgresql.org/docs/current/tutorial.html"), guide("Prisma docs", "https://www.prisma.io/docs"), guide("Drizzle ORM docs", "https://orm.drizzle.team/docs/overview")],
          children: [
            sub("fs-db-mongo", "MongoDB", "A document database used in the MERN stack. Fine to learn after SQL.", "1 week", "alternative", [course("MongoDB University", "https://learn.mongodb.com/")]),
            sub("fs-db-baas", "Supabase or Firebase", "Hosted database plus auth and storage. Great for shipping small-business apps fast.", "3–5 days", "optional", [guide("Supabase docs", "https://supabase.com/docs"), guide("Firebase docs", "https://firebase.google.com/docs")]),
          ],
        }),
        topic("fs-auth", "Login and permissions", "Let people sign in safely and make sure each person only sees what they should. Use a tested library rather than writing your own password handling. Check permissions on the server, never only in the browser.", {
          why: "Getting auth wrong is the fastest way to leak a business's customer data.",
          time: "1 week",
          practice: "Add owner and staff logins to your tailor app; staff can add orders but cannot see monthly revenue.",
          problemTypes: ["tech_build"],
          skills: ["authentication"],
          resources: [guide("Auth.js docs", "https://authjs.dev/"), guide("Supabase Auth", "https://supabase.com/docs/guides/auth"), guide("OWASP: Authentication cheat sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html")],
        }),
      ],
    },
    {
      title: "Ship, test and maintain",
      topics: [
        topic("fs-deploy", "Deploying", "Put your app online with a platform like Vercel or Render and a hosted database. Learn environment variables for secrets, custom domains, and how to roll back a bad release.", {
          why: "The business can only use what is live, and a live link impresses recruiters.",
          time: "2–3 days",
          practice: "Deploy your Kadam project, connect a free hosted database and send the owner the link with a one-page 'how to use' note.",
          problemTypes: ["tech_build"],
          skills: ["deployment", "vercel"],
          resources: [guide("Vercel docs", "https://vercel.com/docs"), guide("Render docs", "https://render.com/docs"), vid("deploy next.js app to vercel")],
        }),
        topic("fs-testing", "Testing", "Write a few unit tests for tricky logic and one or two end-to-end tests that click through your main flow. Run them automatically before each deploy so you catch breakages early.", {
          why: "Tests let you keep improving an app without breaking what the owner relies on.",
          time: "1 week",
          practice: "Write a Playwright test that registers a student for a fest event and checks the confirmation message.",
          skills: ["testing", "playwright", "vitest"],
          resources: [guide("Playwright: Getting started", "https://playwright.dev/docs/intro"), guide("Vitest guide", "https://vitest.dev/guide/")],
        }),
        topic("fs-ci", "CI/CD with GitHub Actions", "Continuous integration runs your tests and checks on every push; continuous deployment ships the code when they pass. GitHub Actions does both for free on small projects.", {
          why: "Teams expect code to be checked automatically before it is merged.",
          time: "2–3 days",
          level: "optional",
          practice: "Add a GitHub Action that runs your type check and tests on every pull request.",
          skills: ["ci/cd", "github actions"],
          resources: [guide("GitHub Actions docs", "https://docs.github.com/en/actions"), vid("github actions tutorial")],
        }),
        topic("fs-pwa", "Offline-friendly and installable apps", "A Progressive Web App can be added to the home screen and keep working with a weak signal. This suits shopkeepers and field workers who will not install a big app.", {
          why: "Many small-business users have low storage and patchy internet.",
          time: "1 week",
          level: "optional",
          practice: "Make your stock tracker installable and let it show the last-loaded list when offline.",
          problemTypes: ["tech_build"],
          skills: ["pwa"],
          resources: [course("web.dev: Learn PWA", "https://web.dev/learn/pwa"), vid("progressive web app tutorial for beginners")],
        }),
      ],
    },
    {
      title: "Think like a product builder",
      topics: [
        topic("fs-users", "Understand the user first", "Before you code, sit with the person who will use the app. Watch how they do the task today on paper or WhatsApp, and build the smallest thing that saves them time. Fewer features that work beat many that confuse.", {
          why: "Full stack developers in small teams decide what to build, not just how.",
          time: "Ongoing",
          practice: "Spend 30 minutes with a shop owner watching how they track stock. List three pain points before writing any code.",
          problemTypes: ["research", "design_ux"],
          skills: ["user research"],
          resources: [find("how to talk to users before building", "Search: talking to users before building"), vid("how to talk to users startup")],
        }),
        topic("fs-design", "System design basics", "Learn how apps grow: caching, background jobs, file storage and splitting work across servers. You do not need this for a small-business app, but interviews will ask.", {
          why: "Product-company interviews include a design round.",
          time: "2–3 weeks",
          level: "optional",
          skills: ["system design"],
          resources: [guide("The System Design Primer", "https://github.com/donnemartin/system-design-primer"), vid("system design basics for beginners")],
        }),
      ],
    },
  ],
};

export default fullStackDeveloper;

import type { RoadmapData } from "../roadmaps-data.ts";
import { art, course, find, guide, sub, tool, topic, vid } from "./_kit.ts";

const backendDeveloper: RoadmapData = {
  role: "backend-developer",
  title: "Backend Developer",
  summary: "Build the servers, databases and APIs that keep an app's data safe and its features working.",
  rsh: ["backend"],
  intro: {
    does: "A backend developer writes the code that runs on the server: it stores data, checks who is allowed to do what, and answers requests from the website or phone app. When a customer places an order, the backend saves it, updates stock and sends the receipt.",
    firstJobs: ["Backend Developer (fresher)", "Software Engineer – Backend", "Associate Software Engineer", "API / Integration Developer", "Node.js or Python Developer"],
    kadam: "Small businesses on Kadam often need a simple order system, a stock database or a WhatsApp/UPI integration. Building one that the owner actually uses gives you a verified, real-world backend project instead of another tutorial clone.",
  },
  sections: [
    {
      title: "How the web works",
      topics: [
        topic("be-web", "Requests, responses and HTTP", "Every app talks to a server by sending a request and getting a response back. HTTP defines how: a method (GET, POST), a URL, headers, a body and a status code. Once this clicks, every backend framework looks familiar.", {
          why: "All backend work is answering HTTP requests correctly and safely.",
          time: "3–5 days",
          practice: "Open your browser's Network tab on any shopping site and write down five requests: method, URL, status code and what each one did.",
          problemTypes: ["tech_build"],
          skills: ["http", "web basics"],
          resources: [
            guide("MDN: How the web works", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works"),
            guide("MDN: An overview of HTTP", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview"),
            vid("how HTTP works for beginners"),
          ],
          children: [
            sub("be-web-methods", "HTTP methods", "GET reads, POST creates, PUT/PATCH update, DELETE removes. Use each for its meaning.", "1 day", "recommended", [guide("MDN: HTTP request methods", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods")]),
            sub("be-web-status", "Status codes", "200 OK, 201 Created, 400 bad input, 401/403 not allowed, 404 not found, 500 server error.", "1 day", "recommended", [guide("MDN: HTTP status codes", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status")]),
            sub("be-web-dns", "DNS and HTTPS", "How a name like shop.in becomes a server address, and why the padlock matters.", "1 day", "recommended", [art("Cloudflare: What is DNS?", "https://www.cloudflare.com/learning/dns/what-is-dns/"), art("Cloudflare: What is HTTPS?", "https://www.cloudflare.com/learning/ssl/what-is-https/")]),
          ],
        }),
        topic("be-terminal", "Terminal and Linux basics", "Most servers run Linux and you will manage them from a terminal. Learn to move around folders, read logs, set environment variables and run programs. You do not need to be an expert, just comfortable.", {
          why: "Deploying, debugging and reading server logs all happen in a terminal.",
          time: "1 week",
          practice: "Using only the terminal, create a project folder, write a small script, run it and save its output to a log file.",
          skills: ["linux", "command line"],
          resources: [
            vid("linux command line basics for beginners"),
            find("linux command line tutorial for beginners"),
          ],
        }),
        topic("be-git", "Git and GitHub", "Git saves snapshots of your code so you can undo mistakes and work with others. GitHub hosts your code online and is where reviewers and employers will look at your work.", {
          why: "Every team uses Git; a clean GitHub profile is your backend portfolio.",
          time: "3–5 days",
          practice: "Put your Kadam project on GitHub with a README that explains how to run it in three steps.",
          skills: ["git", "github"],
          resources: [
            guide("Pro Git book (free)", "https://git-scm.com/book/en/v2"),
            course("GitHub Skills", "https://skills.github.com/"),
            vid("git and github for beginners"),
          ],
        }),
      ],
    },
    {
      title: "A language and a framework",
      topics: [
        topic("be-lang", "Pick one server language", "Choose one language and get good at it before touching another. JavaScript (Node.js) and Python are the easiest starts and are widely hired for in India; Java is common in large companies and banks. Learn variables, functions, loops, error handling and how to split code into files.", {
          why: "Depth in one language beats a little of five when you face a coding interview.",
          time: "4–6 weeks",
          practice: "Write a small command-line program that reads a CSV of a kirana store's sales and prints the top five items.",
          problemTypes: ["tech_build"],
          skills: ["javascript", "python", "java"],
          resources: [
            guide("Node.js: Introduction", "https://nodejs.org/learn/getting-started/introduction-to-nodejs"),
            guide("The Python tutorial", "https://docs.python.org/3/tutorial/"),
            course("freeCodeCamp: JavaScript algorithms and data structures", "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8"),
          ],
          children: [
            sub("be-lang-node", "Node.js", "JavaScript on the server. Same language as the frontend, huge package ecosystem.", "4–6 weeks", "recommended", [guide("Node.js learn", "https://nodejs.org/learn/getting-started/introduction-to-nodejs")], ["node.js"]),
            sub("be-lang-python", "Python", "Clean syntax, great for APIs and data-heavy apps.", "4–6 weeks", "alternative", [guide("The Python tutorial", "https://docs.python.org/3/tutorial/")], ["python"]),
            sub("be-lang-java", "Java", "Verbose but very common in service companies and banks.", "6–8 weeks", "alternative", [vid("java for beginners full course")], ["java"]),
          ],
        }),
        topic("be-framework", "A web framework", "A framework handles the boring parts of a server: routing URLs to your code, reading request bodies and sending responses. Pick the one that matches your language: Express for Node, Django or FastAPI for Python, Spring Boot for Java.", {
          why: "Real jobs use a framework; it is how you ship features quickly.",
          time: "2–3 weeks",
          practice: "Build a tiny server with three routes for a college fest: list events, register a student, and show one event.",
          problemTypes: ["tech_build"],
          skills: ["express", "django", "fastapi"],
          resources: [
            guide("MDN: Server-side website programming", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side"),
            guide("Express: Hello world", "https://expressjs.com/en/starter/hello-world/"),
            guide("FastAPI tutorial", "https://fastapi.tiangolo.com/tutorial/"),
            guide("Django tutorial", "https://docs.djangoproject.com/en/stable/intro/tutorial01/"),
          ],
          children: [
            sub("be-fw-express", "Express (Node.js)", "Minimal and popular. You add pieces as you need them.", "1–2 weeks", "recommended", [guide("MDN: Express tutorial", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs")]),
            sub("be-fw-django", "Django (Python)", "Comes with an admin panel, ORM and auth built in. Great for business apps.", "2–3 weeks", "alternative", [guide("MDN: Django tutorial", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Django")]),
            sub("be-fw-spring", "Spring Boot (Java)", "The standard in many large Indian IT companies.", "3–4 weeks", "alternative", [guide("Spring: Building an app with Spring Boot", "https://spring.io/guides/gs/spring-boot/")]),
          ],
        }),
      ],
    },
    {
      title: "Data and databases",
      topics: [
        topic("be-sql", "SQL and relational databases", "Most business data fits neatly into tables: customers, products, orders. SQL lets you create those tables and ask questions of them. PostgreSQL and MySQL are the usual choices; SQLite is perfect for learning.", {
          why: "Nearly every backend stores its important data in a relational database.",
          time: "2–3 weeks",
          practice: "Design tables for a kirana's udhaar (credit) book: customers, entries and payments. Write a query for 'who owes more than ₹500?'.",
          problemTypes: ["tech_build", "data"],
          skills: ["sql", "postgresql"],
          resources: [
            course("SQLBolt interactive lessons", "https://sqlbolt.com/"),
            guide("PostgreSQL tutorial", "https://www.postgresql.org/docs/current/tutorial.html"),
            course("freeCodeCamp: Relational databases", "https://www.freecodecamp.org/learn/relational-database"),
          ],
          children: [
            sub("be-sql-design", "Designing tables", "Primary keys, foreign keys, and keeping each fact in one place.", "3–4 days"),
            sub("be-sql-joins", "JOINs", "Combine orders with customers and products in one query.", "2–3 days"),
            sub("be-sql-index", "Indexes", "Make common lookups fast. Add them for columns you search or join on.", "1–2 days", "recommended", [guide("PostgreSQL: Indexes", "https://www.postgresql.org/docs/current/indexes.html")]),
            sub("be-sql-tx", "Transactions", "Make sure 'deduct stock' and 'save order' both happen, or neither does.", "1–2 days"),
          ],
        }),
        topic("be-orm", "ORMs and migrations", "An ORM lets you work with database rows as objects in your language, and migrations keep track of every change to your tables. They save time, but you should still understand the SQL they write for you.", {
          why: "Teams change their database every week; migrations keep everyone's copy in sync.",
          time: "1 week",
          practice: "Add a 'phone number' column to your udhaar app using a migration, without losing existing data.",
          skills: ["orm", "prisma", "django orm"],
          resources: [
            guide("Prisma docs", "https://www.prisma.io/docs"),
            guide("Drizzle ORM docs", "https://orm.drizzle.team/docs/overview"),
            vid("database migrations explained"),
          ],
        }),
        topic("be-nosql", "NoSQL databases", "Document databases like MongoDB and key-value stores like Firebase store data more loosely than tables. They suit some apps well, such as chat or flexible forms, but they are not a replacement for learning SQL.", {
          why: "Many startups use MongoDB or Firebase, so you should know when they fit.",
          time: "1 week",
          level: "optional",
          practice: "Store a college fest's feedback forms (each with different questions) in MongoDB and count responses per event.",
          skills: ["mongodb", "firebase"],
          resources: [
            course("MongoDB University (free)", "https://learn.mongodb.com/"),
            guide("Firebase docs", "https://firebase.google.com/docs"),
          ],
        }),
        topic("be-cache", "Caching with Redis", "A cache keeps answers you computed recently so you do not hit the database every time. Redis is the common tool. Learn it once your app has real traffic, not before.", {
          why: "Caching is the first fix when an app slows down under load.",
          time: "3–5 days",
          level: "optional",
          practice: "Cache the 'today's menu' response of a canteen API for 5 minutes and measure the speed difference.",
          skills: ["redis", "caching"],
          resources: [guide("Redis docs", "https://redis.io/docs/latest/"), vid("redis caching tutorial")],
        }),
      ],
    },
    {
      title: "Building APIs",
      topics: [
        topic("be-rest", "REST API design", "An API is the menu your frontend or partner apps order from. Good REST APIs use clear resource names (/orders, /orders/42), the right methods and status codes, and return consistent JSON. Write it down so others can use it without asking you.", {
          why: "Your API is the contract between you, the frontend team and any app that integrates with you.",
          time: "1–2 weeks",
          practice: "Design and document the API for a local NGO's volunteer sign-up: list drives, sign up, cancel, and see my sign-ups.",
          problemTypes: ["tech_build"],
          skills: ["rest api", "json"],
          resources: [
            course("freeCodeCamp: Back end development and APIs", "https://www.freecodecamp.org/learn/back-end-development-and-apis"),
            guide("OpenAPI: Getting started", "https://learn.openapis.org/"),
            tool("Postman learning centre", "https://learning.postman.com/docs/getting-started/overview/"),
          ],
          children: [
            sub("be-rest-validate", "Validating input", "Never trust what the client sends. Check types, lengths and required fields.", "2–3 days", "recommended", [tool("Zod (TypeScript validation)", "https://zod.dev/")]),
            sub("be-rest-errors", "Error responses", "Return a clear message and the right status code, never a stack trace.", "1 day"),
            sub("be-rest-paging", "Pagination and filters", "Return 20 orders at a time, filter by date or status.", "1–2 days"),
          ],
        }),
        topic("be-integrations", "Third-party integrations", "Indian small businesses run on UPI, WhatsApp and SMS. Learn to call another company's API safely: read their docs, keep keys secret, handle failures and use webhooks to hear back when something happens, like a payment succeeding.", {
          why: "Connecting payments and messaging is where a backend creates obvious value for a small business.",
          time: "1–2 weeks",
          practice: "In test mode, send a WhatsApp or email order confirmation when a new order is saved in your app.",
          problemTypes: ["tech_build", "operations"],
          skills: ["webhooks", "payments api"],
          resources: [
            guide("Razorpay docs", "https://razorpay.com/docs/"),
            guide("WhatsApp Business Platform docs", "https://developers.facebook.com/docs/whatsapp/cloud-api"),
            vid("webhooks explained"),
          ],
        }),
        topic("be-graphql", "GraphQL", "GraphQL lets the client ask for exactly the fields it needs in one request. It is useful for complex apps with many screens, but REST is enough for most small-business work.", {
          why: "Some product companies use it, so it is good to recognise.",
          time: "1 week",
          level: "alternative",
          skills: ["graphql"],
          resources: [vid("graphql explained for beginners"), find("graphql introduction official learn")],
        }),
      ],
    },
    {
      title: "Security and quality",
      topics: [
        topic("be-auth", "Authentication and authorisation", "Authentication checks who someone is (login); authorisation checks what they may do (a shop owner sees all orders, a customer only theirs). Store passwords only as strong hashes, use sessions or tokens correctly, and check permissions on every request.", {
          why: "A single missing permission check can leak every customer's data.",
          time: "1–2 weeks",
          practice: "Add owner and staff roles to a shop app so staff can add sales but cannot delete them.",
          problemTypes: ["tech_build"],
          skills: ["authentication", "jwt", "sessions"],
          resources: [
            guide("OWASP: Authentication cheat sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html"),
            guide("OWASP: Password storage cheat sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"),
            art("Introduction to JSON Web Tokens", "https://www.jwt.io/introduction"),
            guide("MDN: Using HTTP cookies", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies"),
          ],
        }),
        topic("be-security", "Common security mistakes", "Most attacks use a short list of well-known mistakes: SQL injection, broken access control, exposed secrets, missing rate limits. Learn the list and check your own code against it before every release.", {
          why: "Businesses trust you with customer phone numbers and money; you must not leak them.",
          time: "1 week",
          practice: "Review your Kadam project against the OWASP Top 10 and fix at least two issues you find.",
          skills: ["security", "owasp"],
          resources: [
            guide("OWASP Top 10", "https://owasp.org/projects/top-ten"),
            art("Cloudflare: What is API security?", "https://www.cloudflare.com/learning/security/api/what-is-api-security/"),
            guide("MDN: Web security", "https://developer.mozilla.org/en-US/docs/Web/Security"),
          ],
        }),
        topic("be-testing", "Testing", "Tests are small programs that check your code still works after a change. Start with a few tests for the most important flows, like 'placing an order reduces stock', and run them before every deploy.", {
          why: "Tests let you change code with confidence and are expected in any code review.",
          time: "1 week",
          practice: "Write three tests for your API: a successful order, an order with missing fields, and an order for an out-of-stock item.",
          skills: ["testing", "jest", "pytest"],
          resources: [
            guide("Jest: Getting started", "https://jestjs.io/docs/getting-started"),
            guide("pytest: Get started", "https://docs.pytest.org/en/stable/getting-started.html"),
            vid("api testing for beginners"),
          ],
        }),
      ],
    },
    {
      title: "Ship and run it",
      topics: [
        topic("be-deploy", "Deploying your app", "Deploying means putting your server on the internet so real people can use it. Platforms like Render, Railway or Vercel make this easy, and Supabase or Neon give you a hosted database. Keep secrets in environment variables, never in your code.", {
          why: "An app that only runs on your laptop helps no one.",
          time: "3–5 days",
          practice: "Deploy your Kadam project with a free hosted database and share the live link with the business owner.",
          problemTypes: ["tech_build"],
          skills: ["deployment", "environment variables"],
          resources: [
            guide("Render docs", "https://render.com/docs"),
            guide("Supabase docs", "https://supabase.com/docs"),
            art("The Twelve-Factor App", "https://12factor.net/"),
          ],
        }),
        topic("be-docker", "Docker", "Docker packs your app and everything it needs into a container that runs the same everywhere. It ends the 'works on my machine' problem and is standard in most companies.", {
          why: "Most backend job descriptions in India list Docker.",
          time: "1 week",
          level: "optional",
          practice: "Write a Dockerfile for your API and run it locally with one command.",
          skills: ["docker"],
          resources: [guide("Docker: Get started", "https://docs.docker.com/get-started/"), vid("docker tutorial for beginners")],
        }),
        topic("be-logs", "Logs and monitoring", "Once your app is live, logs tell you what happened and monitoring tells you when something breaks. Log useful events (order saved, payment failed) without logging passwords or phone numbers.", {
          why: "You cannot fix a bug you cannot see.",
          time: "2–3 days",
          practice: "Add logs for every failed request in your app and check them after the owner uses it for a day.",
          skills: ["logging", "monitoring"],
          resources: [vid("logging best practices backend"), find("structured logging best practices")],
        }),
        topic("be-scale", "Scaling and system design basics", "System design is how you plan an app for many users: load balancers, caches, queues, read replicas. You will mostly meet it in interviews at first. Learn the vocabulary and the trade-offs, not every tool.", {
          why: "Product-company interviews include a system design round, even for juniors.",
          time: "2–3 weeks",
          level: "optional",
          skills: ["system design"],
          resources: [
            art("The System Design Primer", "https://github.com/donnemartin/system-design-primer"),
            vid("system design for beginners"),
          ],
        }),
        topic("be-cloud", "Cloud basics", "AWS, Google Cloud and Azure rent you servers, databases and storage by the hour. Learn what the main services do and how billing works, so a free-tier experiment does not become a surprise bill.", {
          why: "Most companies host on a cloud provider; knowing the basics makes you useful from day one.",
          time: "2 weeks",
          level: "optional",
          skills: ["aws", "gcp", "cloud"],
          resources: [course("AWS Skill Builder (free courses)", "https://skillbuilder.aws/"), course("Google Cloud Skills Boost", "https://www.skills.google/"), course("Microsoft Learn", "https://learn.microsoft.com/en-us/training/")],
        }),
      ],
    },
  ],
};

export default backendDeveloper;

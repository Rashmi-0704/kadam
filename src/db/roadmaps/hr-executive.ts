import type { RoadmapData } from "../roadmaps-data.ts";
import { art, course, find, guide, sub, topic, vid } from "./_kit.ts";

// Slug "hr-executive" is reused from the catalogue; the title covers HR and people operations.
const hrExecutive: RoadmapData = {
  role: "hr-executive",
  title: "HR / People Operations",
  summary: "Help a business find good people, treat them fairly, pay them right and help them grow.",
  intro: {
    does: "HR and people operations look after everything to do with people at work: hiring, onboarding, attendance and payroll, policies, legal compliance, engagement and growth. In a small business or NGO, one person often does all of it, using sheets, WhatsApp and a lot of conversations.",
    firstJobs: ["HR Executive / HR Associate", "Talent Acquisition (Recruitment) Associate", "HR Operations / Payroll Associate", "People Operations Associate at a startup", "Volunteer Coordinator at an NGO"],
    kadam: "Small businesses and NGOs on Kadam often struggle to hire, keep staff or manage volunteers. Designing a better hiring process, onboarding kit or volunteer system — and having the organisation confirm it worked — gives you a real HR case study at a stage when most applicants only have coursework.",
  },
  sections: [
    {
      title: "Foundations",
      topics: [
        topic("hr-basics", "What HR does", "HR covers the whole employee journey: attract, hire, onboard, pay, develop, retain and, sometimes, exit. In big companies these are separate teams; in a small business they are one person's job. Learn the journey first, then go deep where you enjoy it.", {
          why: "Seeing the whole journey helps you pick a first role and talk about HR clearly.",
          time: "2–3 days",
          practice: "Ask a local shop or NGO how they hired, trained and paid their last new person. Map each step on the employee journey.",
          problemTypes: ["research", "operations"],
          skills: ["hr basics"],
          resources: [vid("what does an hr executive do"), find("employee lifecycle stages explained")],
        }),
        topic("hr-comms", "Communication and confidentiality", "HR is trusted with salaries, health issues and complaints. Listen carefully, write clearly, and keep private things private. Learn to have hard conversations calmly and to put decisions in writing.", {
          why: "Trust is HR's most important tool; one leak can break it.",
          time: "Ongoing",
          practice: "Draft a polite email telling a candidate they were not selected, and a WhatsApp message reminding staff about a policy change.",
          problemTypes: ["content"],
          skills: ["communication", "confidentiality"],
          resources: [course("Google: Technical writing one", "https://developers.google.com/tech-writing/one"), vid("difficult conversations at work hr")],
        }),
      ],
    },
    {
      title: "Hiring",
      topics: [
        topic("hr-jd", "Role design and job descriptions", "A good job description says what the person will actually do, what skills they need on day one, pay range if possible, and how to apply. Write it for the candidate, not for the boss. Avoid biased words and unnecessary degree requirements.", {
          why: "A clear JD brings the right applicants and saves hours of screening.",
          time: "2–3 days",
          practice: "Write a job description for a counter assistant at a pharmacy, in English and the local language, in under 200 words.",
          problemTypes: ["content", "operations"],
          skills: ["job descriptions"],
          resources: [vid("how to write a job description"), find("inclusive job description writing tips")],
        }),
        topic("hr-sourcing", "Sourcing candidates", "Find candidates where they already are: job portals, LinkedIn, college placement cells, referrals, local WhatsApp groups and Facebook groups for blue-collar roles. Track where your best hires come from.", {
          why: "Recruitment roles are judged by how fast they fill positions with good people.",
          time: "1 week",
          practice: "Find 20 possible candidates for a café's barista role from three different sources, and note which source looks best.",
          problemTypes: ["marketing", "research"],
          skills: ["sourcing", "recruitment"],
          resources: [guide("LinkedIn help", "https://www.linkedin.com/help/linkedin"), vid("recruitment sourcing strategies")],
        }),
        topic("hr-interview", "Screening and structured interviews", "Structured interviews ask every candidate the same job-related questions and score answers on a simple scale. This is fairer and predicts job performance better than casual chats. Add a short work sample or trial task when you can.", {
          why: "Good interviews are the difference between a great hire and an expensive mistake.",
          time: "1 week",
          practice: "Design five structured questions and a 1–5 scoring guide for hiring a delivery person for a grocery store.",
          problemTypes: ["research", "operations"],
          skills: ["interviewing", "structured interviews"],
          resources: [guide("Google re:Work: Use structured interviewing", "https://rework.withgoogle.com/guides/hiring-use-structured-interviewing/steps/introduction/"), vid("structured interview questions examples")],
          children: [
            sub("hr-int-bias", "Reducing bias", "Score before discussing, use the same questions, avoid 'culture fit' as a reason.", "2 days"),
            sub("hr-int-offer", "Offers and references", "Check references, make a clear written offer, confirm joining date.", "2 days"),
          ],
        }),
        topic("hr-ats", "Tracking candidates", "Keep every applicant, stage and decision in one place, even if it is just a Google Sheet. Reply to every candidate; silence hurts the employer's name.", {
          why: "Organised hiring is faster and gives candidates a good experience.",
          time: "2 days",
          level: "optional",
          practice: "Build a candidate tracker sheet with stages and a dropdown for status, and use it for a real Kadam hiring problem.",
          problemTypes: ["operations", "data"],
          skills: ["applicant tracking", "google sheets"],
          resources: [guide("Google Sheets help", "https://support.google.com/docs/topic/9054603"), find("candidate tracker google sheets template")],
        }),
      ],
    },
    {
      title: "Onboarding and HR operations",
      topics: [
        topic("hr-onboard", "Onboarding", "The first week decides whether a new person stays. Prepare their documents, workspace and first tasks before day one, give them a buddy, and check in at day 7 and day 30. A simple checklist makes it repeatable.", {
          why: "Good onboarding cuts early quitting, a big cost for small businesses.",
          time: "3–4 days",
          practice: "Create a first-week onboarding checklist and a one-page welcome note for new volunteers at a local NGO.",
          problemTypes: ["operations", "content"],
          skills: ["onboarding"],
          resources: [guide("Google re:Work", "https://rework.withgoogle.com/"), vid("employee onboarding process best practices")],
        }),
        topic("hr-records", "Attendance, leave and records", "Keep accurate records of who joined when, attendance, leave and documents. For small teams a well-designed sheet works; larger ones use HR software. Records protect both the employer and the employee.", {
          why: "Payroll, compliance and disputes all depend on clean records.",
          time: "3–4 days",
          practice: "Build an attendance and leave sheet for a 10-person shop that calculates leave balance automatically.",
          problemTypes: ["operations", "data"],
          skills: ["hr operations", "excel"],
          resources: [guide("Excel help and learning", "https://support.microsoft.com/en-us/excel"), vid("attendance sheet in excel with leave tracker")],
        }),
        topic("hr-payroll", "Payroll basics", "Payroll turns salary, attendance and deductions into the amount paid each month. Learn salary structure (basic, HRA, allowances), PF and ESI deductions, professional tax and TDS at a basic level, and payslips. Accuracy and timing matter more than anything.", {
          why: "Late or wrong pay is the fastest way to lose staff trust.",
          time: "1–2 weeks",
          practice: "Make a payroll sheet for five staff with basic pay, days present, PF deduction and net pay.",
          problemTypes: ["finance", "operations"],
          skills: ["payroll", "pf", "esi"],
          resources: [guide("EPFO (Employees' Provident Fund)", "https://www.epfindia.gov.in/"), guide("ESIC", "https://www.esic.gov.in/"), vid("salary structure and payroll basics india")],
          children: [
            sub("hr-pay-tally", "Payroll in Tally", "Many small firms run payroll in Tally alongside accounts.", "1 week", "optional", [guide("Tally help", "https://help.tallysolutions.com/")]),
          ],
        }),
      ],
    },
    {
      title: "Law and policy",
      topics: [
        topic("hr-law", "Labour law basics", "India's labour laws cover wages, working hours, PF and ESI, bonus, gratuity and maternity benefit, and are being brought together under new labour codes. You do not need to be a lawyer; know which rules apply to a business of a given size and where to check.", {
          why: "Small mistakes in compliance can lead to fines and unfair treatment of workers.",
          time: "1–2 weeks",
          practice: "For a 15-person restaurant, list which of PF, ESI, minimum wages and maternity benefit apply, with a source for each.",
          problemTypes: ["research"],
          skills: ["labour law", "compliance"],
          resources: [guide("Ministry of Labour and Employment", "https://www.labour.gov.in/"), vid("labour codes india explained"), find("minimum wages india state wise official")],
        }),
        topic("hr-posh", "POSH and a safe workplace", "The POSH Act requires employers to prevent and address sexual harassment, including an internal committee where applicable. HR also owns safety, anti-discrimination and grievance processes. Everyone should know how to raise a concern safely.", {
          why: "A safe, fair workplace is a legal duty and the base of trust.",
          time: "3–5 days",
          practice: "Draft a one-page 'how to raise a concern' poster for a small office, in simple language.",
          problemTypes: ["content", "research"],
          skills: ["posh", "grievance handling"],
          resources: [guide("SHe-Box (Government of India)", "https://shebox.wcd.gov.in/"), vid("posh act explained for employees")],
        }),
        topic("hr-policy", "Writing HR policies", "Policies set clear rules on leave, timings, conduct, reimbursements and so on. Keep them short, fair and consistent with the law, and make sure everyone has read them.", {
          why: "Clear policies prevent arguments and favouritism.",
          time: "3–4 days",
          level: "optional",
          practice: "Write a one-page leave policy for a 10-person startup.",
          problemTypes: ["content", "operations"],
          skills: ["policy writing"],
          resources: [find("simple leave policy template small business india"), guide("Ministry of Labour and Employment", "https://www.labour.gov.in/")],
        }),
      ],
    },
    {
      title: "Engagement and growth",
      topics: [
        topic("hr-engage", "Employee engagement and retention", "People stay where they feel respected, fairly paid, and able to grow. Run short pulse surveys, have regular one-to-ones, and act on what you hear. Track why people leave with simple exit conversations.", {
          why: "Replacing a person costs far more than keeping one.",
          time: "1 week",
          practice: "Run a 5-question anonymous Google Form survey for a café's staff and present three findings to the owner.",
          problemTypes: ["research", "data"],
          skills: ["employee engagement", "surveys"],
          resources: [art("Gallup: Q12 employee engagement", "https://www.gallup.com/q12-employee-engagement-survey/"), guide("Google Forms: Create a form", "https://support.google.com/docs/answer/6281888")],
        }),
        topic("hr-perf", "Performance and goals", "Help people know what good work looks like: clear goals, regular feedback and a simple review. OKRs or a few measurable targets work for most teams. Feedback should be specific, timely and kind.", {
          why: "Fair performance processes help people grow and support pay decisions.",
          time: "1 week",
          practice: "Set three measurable goals for a sales assistant at a clothing store and write a short feedback note for one month.",
          problemTypes: ["operations"],
          skills: ["performance management", "okrs", "feedback"],
          resources: [guide("Google re:Work: Set goals with OKRs", "https://rework.withgoogle.com/guides/set-goals-with-okrs/steps/introduction/"), vid("how to give constructive feedback")],
        }),
        topic("hr-ld", "Training and development", "Plan short, practical trainings that solve a real problem: customer handling, a new billing tool, safety. Check whether behaviour changed afterwards, not just whether people attended.", {
          why: "Learning and development is a common HR specialisation.",
          time: "1 week",
          level: "optional",
          practice: "Design a 30-minute training for shop staff on using a new UPI billing app, with a 3-question check at the end.",
          problemTypes: ["content", "operations"],
          skills: ["training", "learning and development"],
          resources: [vid("training needs analysis explained"), guide("Google Forms: Create a form", "https://support.google.com/docs/answer/6281888")],
        }),
        topic("hr-volunteers", "Volunteer management", "NGOs rely on volunteers who are not paid, so motivation, clear roles and recognition matter even more. Recruit for specific tasks, train briefly, schedule well and thank people publicly.", {
          why: "NGO and community roles often begin with volunteer coordination.",
          time: "3–5 days",
          level: "optional",
          practice: "Design a volunteer sign-up form, a schedule and a thank-you message for a weekend food drive.",
          problemTypes: ["operations"],
          skills: ["volunteer management"],
          resources: [vid("volunteer management for nonprofits"), find("volunteer management guide for NGOs")],
        }),
        topic("hr-data", "HR data and tools", "Track a few people numbers: time to hire, joining rate, attrition, absenteeism. Spreadsheets are enough for small teams; HRMS tools handle larger ones. Use data to back up what you recommend.", {
          why: "Data makes HR's advice harder to ignore.",
          time: "1 week",
          level: "optional",
          practice: "From a year of joining and leaving dates, calculate a small company's attrition rate and average tenure.",
          problemTypes: ["data"],
          skills: ["hr analytics", "excel"],
          resources: [guide("Excel help and learning", "https://support.microsoft.com/en-us/excel"), vid("hr analytics in excel for beginners")],
        }),
      ],
    },
  ],
};

export default hrExecutive;

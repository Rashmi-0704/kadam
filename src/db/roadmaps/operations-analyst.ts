import type { RoadmapData } from "../roadmaps-data.ts";
import { art, course, find, guide, sub, tool, topic, vid } from "./_kit.ts";

// Slug "operations-analyst" is reused from the catalogue and taxonomy so matching, catalogue and roadmap line up.
const operationsAnalyst: RoadmapData = {
  role: "operations-analyst",
  title: "Operations Associate / Analyst",
  summary: "Make the daily work of a business run faster, cheaper and with fewer mistakes.",
  intro: {
    does: "An operations associate keeps the everyday machine of a business running: orders, stock, deliveries, staff schedules and suppliers. An operations analyst also measures that machine and finds where time and money leak, then fixes it with better processes, sheets or simple tools.",
    firstJobs: ["Operations Associate / Executive", "Operations Analyst", "Business Operations Trainee", "Supply Chain or Warehouse Associate", "Founder's office associate at a startup"],
    kadam: "Small businesses on Kadam often lose money to messy stock, missed orders or slow billing. Fixing one of these, and having the owner confirm the time or money saved, gives you exactly the before-and-after story operations interviews look for.",
  },
  sections: [
    {
      title: "See how the business runs",
      topics: [
        topic("op-basics", "How a business operates", "Every business turns inputs (stock, staff time, money) into something customers pay for. Operations is the set of steps in between. Learn to ask: what are the steps, who does each one, how long does it take, and what goes wrong?", {
          why: "You cannot improve a process you do not understand end to end.",
          time: "3–4 days",
          practice: "Spend an hour at a local shop or canteen. Write down every step from 'customer walks in' to 'money in the drawer'.",
          problemTypes: ["operations", "research"],
          skills: ["operations basics"],
          resources: [vid("what is operations management"), find("operations management basics for beginners")],
        }),
        topic("op-mapping", "Process mapping", "A process map is a simple drawing of each step, decision and hand-off in a task. Drawing it usually reveals the problem straight away: a step done twice, a person waiting, a paper that gets lost. Keep maps simple enough that the owner can read them.", {
          why: "Maps make invisible problems visible and get everyone to agree on how work really happens.",
          time: "3–5 days",
          practice: "Map how a tiffin service takes, cooks, packs and delivers orders. Circle the two steps where things go wrong most.",
          problemTypes: ["operations"],
          skills: ["process mapping", "flowcharts"],
          resources: [tool("draw.io (free diagrams)", "https://www.drawio.com/"), vid("process mapping tutorial for beginners"), find("swimlane process map examples")],
          children: [
            sub("op-map-swim", "Swimlane maps", "One lane per person or team, so hand-offs are clear.", "1–2 days"),
            sub("op-map-value", "Value stream thinking", "Mark which steps add value for the customer and which are only waiting or rework.", "2 days", "optional"),
          ],
        }),
        topic("op-observe", "Observing and interviewing staff", "The people doing the work know where it breaks. Watch them work, ask what annoys them, and time the slow steps. Be respectful: you are there to make their day easier, not to judge them.", {
          why: "Good fixes come from the people closest to the problem.",
          time: "Ongoing",
          practice: "Interview two staff at a pharmacy about their busiest hour. Note three things that slow them down.",
          problemTypes: ["research", "operations"],
          skills: ["interviewing", "observation"],
          resources: [art("NN/g: User interviews 101", "https://www.nngroup.com/articles/user-interviews/"), vid("gemba walk explained")],
        }),
      ],
    },
    {
      title: "Spreadsheets and data",
      topics: [
        topic("op-sheets", "Spreadsheets for operations", "Most operations work lives in Excel or Google Sheets: stock lists, order logs, staff rosters, delivery trackers. Learn clean table layout, formulas, lookups, filters, pivot tables, and data validation so others enter data correctly.", {
          why: "A well-built sheet is often the whole fix for a small business.",
          time: "2–3 weeks",
          practice: "Build a stock sheet for a kirana with item, quantity, reorder level and a column that turns red when stock is low.",
          problemTypes: ["operations", "data"],
          skills: ["excel", "google sheets", "pivot tables"],
          resources: [guide("Google Sheets help", "https://support.google.com/docs/topic/9054603"), guide("Excel help and learning", "https://support.microsoft.com/en-us/excel"), vid("google sheets for inventory management")],
          children: [
            sub("op-sheets-lookup", "Lookups", "XLOOKUP or VLOOKUP to pull prices or supplier names from another table.", "2 days"),
            sub("op-sheets-pivot", "Pivot tables", "Summarise orders by day, item or delivery area in seconds.", "2 days"),
            sub("op-sheets-valid", "Data validation and conditional formatting", "Dropdowns stop typos; colours flag problems.", "1–2 days"),
          ],
        }),
        topic("op-forms", "Collecting data with forms", "Google Forms or simple apps let staff log orders, complaints or deliveries from a phone, straight into a sheet. Clean data at the start saves hours of cleaning later.", {
          why: "Small businesses often have no data at all until you set up a simple way to collect it.",
          time: "2–3 days",
          practice: "Make a Google Form for a delivery boy to log each delivery (time, area, paid or not) that feeds a sheet.",
          problemTypes: ["operations", "data", "tech_build"],
          skills: ["google forms"],
          resources: [guide("Google Forms: Create a form", "https://support.google.com/docs/answer/6281888"), vid("google forms to google sheets tutorial")],
        }),
        topic("op-kpis", "Measuring time, cost and quality", "Pick a few numbers that show how well operations run: orders per hour, delivery time, stock-outs per week, wastage, error rate. Measure them before and after any change so you can prove the fix worked.", {
          why: "Before-and-after numbers are how you prove impact.",
          time: "3–5 days",
          practice: "Measure how long a canteen takes to serve an order at lunch for three days, before suggesting any change.",
          problemTypes: ["data", "operations"],
          skills: ["kpis", "measurement"],
          resources: [art("Investopedia: KPIs", "https://www.investopedia.com/terms/k/kpi.asp"), course("Khan Academy: Statistics", "https://www.khanacademy.org/math/statistics-probability")],
        }),
        topic("op-dash", "Simple dashboards", "A dashboard puts the key numbers on one screen the owner can check on a phone. Looker Studio is free and reads straight from Google Sheets.", {
          why: "Owners act on numbers they can see every day.",
          time: "3–4 days",
          level: "optional",
          practice: "Build a one-screen dashboard for a shop: today's sales, low-stock items and pending deliveries.",
          problemTypes: ["data"],
          skills: ["looker studio", "dashboards"],
          resources: [guide("Looker Studio help", "https://support.google.com/looker-studio"), vid("looker studio tutorial for beginners")],
        }),
      ],
    },
    {
      title: "Stock, suppliers and delivery",
      topics: [
        topic("op-inventory", "Inventory basics", "Too little stock loses sales; too much ties up cash and spoils. Learn reorder levels, safety stock, first-in-first-out, and ABC analysis (focus on the few items that matter most). For perishables, wastage tracking is as important as stock.", {
          why: "Stock is often a small business's biggest cash problem.",
          time: "1 week",
          practice: "Do an ABC analysis of a kirana's top 50 items and set reorder levels for the 'A' items.",
          problemTypes: ["operations", "data"],
          skills: ["inventory management"],
          resources: [art("Investopedia: ABC analysis", "https://www.investopedia.com/terms/a/abc.asp"), art("Investopedia: Economic order quantity", "https://www.investopedia.com/terms/e/economicorderquantity.asp"), vid("inventory management basics small business")],
        }),
        topic("op-suppliers", "Suppliers and purchasing", "Keep a list of suppliers with prices, lead times and payment terms. Compare at least two for important items, and track late or wrong deliveries. A good supplier relationship can matter more than a slightly lower price.", {
          why: "Reliable supply keeps the business open; better terms protect cash.",
          time: "3–4 days",
          level: "optional",
          practice: "Build a supplier sheet for a restaurant: item, supplier, price, lead time, and last three delivery issues.",
          problemTypes: ["operations", "finance"],
          skills: ["purchasing", "vendor management"],
          resources: [vid("vendor management basics"), find("supplier comparison template small business")],
        }),
        topic("op-delivery", "Delivery and logistics", "Getting goods to customers on time means planning routes, batching orders by area and tracking who has been paid. Even a simple area-wise schedule can cut delivery time a lot.", {
          why: "Late or wrong deliveries lose repeat customers.",
          time: "3–5 days",
          level: "optional",
          practice: "Group a week of a water-can supplier's orders by area and design a fixed daily route.",
          problemTypes: ["operations"],
          skills: ["logistics", "route planning"],
          resources: [vid("last mile delivery explained"), find("delivery route planning small business")],
        }),
      ],
    },
    {
      title: "Improve the process",
      topics: [
        topic("op-rootcause", "Finding root causes", "Fix the cause, not the symptom. Ask 'why?' five times, draw a fishbone diagram of possible causes, and use a Pareto chart to find the few causes behind most problems. Check your guess with data before fixing.", {
          why: "Fixing symptoms means the same problem comes back next month.",
          time: "3–5 days",
          practice: "A bakery throws away 15% of bread daily. Use 5 Whys and a fishbone to list causes, then pick the biggest one to test.",
          problemTypes: ["operations", "research"],
          skills: ["root cause analysis", "5 whys", "pareto"],
          resources: [vid("5 whys root cause analysis"), vid("fishbone diagram explained"), find("pareto chart in google sheets")],
        }),
        topic("op-lean", "Lean and continuous improvement", "Lean is a way of removing waste: waiting, extra movement, overstock, rework and defects. Kaizen means small improvements every week. 5S (sort, set in order, shine, standardise, sustain) is an easy start for any shop or store room.", {
          why: "These ideas are used in every factory, warehouse and well-run shop.",
          time: "1 week",
          practice: "Apply 5S to a shop's store room. Take before and after photos and time how long it takes to find five items.",
          problemTypes: ["operations"],
          skills: ["lean", "kaizen", "5s"],
          resources: [art("Investopedia: Kaizen", "https://www.investopedia.com/terms/k/kaizen.asp"), art("Investopedia: Just in time", "https://www.investopedia.com/terms/j/jit.asp"), vid("lean manufacturing 7 wastes explained")],
        }),
        topic("op-sop", "SOPs and checklists", "A standard operating procedure (SOP) writes down the best way to do a task so anyone can repeat it. Keep it short, with numbered steps and photos. Checklists catch forgotten steps during busy hours.", {
          why: "SOPs make good work repeatable even when staff change.",
          time: "2–3 days",
          practice: "Write a one-page opening and closing checklist for a café, in English and the staff's language.",
          problemTypes: ["operations", "content"],
          skills: ["sop writing", "documentation"],
          resources: [vid("how to write an SOP"), find("standard operating procedure template")],
        }),
        topic("op-automation", "Simple automation", "Many repetitive tasks can be automated without coding: form responses that send an email, a sheet that sends a daily WhatsApp summary, a no-code app for stock counts. Automate only after the manual process is clear.", {
          why: "Automation frees owners and staff from boring, error-prone tasks.",
          time: "1–2 weeks",
          level: "optional",
          practice: "Build an AppSheet app from your stock sheet so the shop assistant can update counts from a phone.",
          problemTypes: ["tech_build", "operations"],
          skills: ["no-code", "appsheet", "zapier"],
          resources: [tool("AppSheet", "https://about.appsheet.com/home/"), guide("Zapier guides", "https://zapier.com/resources/guides"), vid("google apps script for beginners")],
        }),
      ],
    },
    {
      title: "Work with people",
      topics: [
        topic("op-change", "Making change stick", "The hardest part of operations is getting people to use the new way. Involve staff early, test the change small, train them, and check in after a week. If people go back to the old way, find out why.", {
          why: "A great process that nobody follows has zero impact.",
          time: "Ongoing",
          practice: "Roll out your new stock sheet with one staff member first, collect feedback for a week, then adjust.",
          problemTypes: ["operations"],
          skills: ["change management", "training"],
          resources: [vid("change management basics"), find("how to get staff to adopt a new process")],
        }),
        topic("op-pm", "Project and task tracking", "Operations work involves many small tasks across people. A Kanban board (to do, doing, done) or a shared sheet with owners and deadlines keeps things from slipping.", {
          why: "Ops roles juggle many moving parts; tracking keeps you reliable.",
          time: "2 days",
          practice: "Set up a Trello board for your Kadam project and update it twice a week until you finish.",
          problemTypes: ["operations"],
          skills: ["kanban", "project management"],
          resources: [guide("Atlassian: Kanban", "https://www.atlassian.com/agile/kanban"), tool("Trello guide", "https://trello.com/guide")],
        }),
        topic("op-gst", "Billing and GST basics", "Many operations roles touch invoices, payments and GST. Learn what a GST invoice must contain, how input credit works at a high level, and why matching bills to payments matters.", {
          why: "Billing errors cost small businesses money and trouble with tax filings.",
          time: "1 week",
          level: "optional",
          practice: "Check ten invoices from a shop for missing GST details and list what needs fixing.",
          problemTypes: ["finance", "operations"],
          skills: ["gst", "invoicing"],
          resources: [guide("GST portal", "https://www.gst.gov.in/"), guide("GST portal tutorials", "https://tutorial.gst.gov.in/"), vid("gst basics for small business india")],
        }),
      ],
    },
  ],
};

export default operationsAnalyst;

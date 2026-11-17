import type { RoadmapData } from "../roadmaps-data.ts";
import { art, course, find, guide, sub, topic, vid } from "./_kit.ts";

// Slug "sales-executive" is reused from the catalogue; the title covers sales and business development.
const salesExecutive: RoadmapData = {
  role: "sales-executive",
  title: "Sales & Business Development",
  summary: "Find the right customers, understand what they need, and help them say yes — then keep them coming back.",
  intro: {
    does: "Sales and business development people find potential customers or partners, understand their problems, show how a product helps, and close the deal. In India this ranges from selling software to shop owners, to signing up restaurants for a delivery app, to finding corporate partners for an NGO.",
    firstJobs: ["Business Development Associate / Executive", "Inside Sales Representative", "Sales Development Representative (SDR)", "Key Account Associate", "Partnerships Associate at a startup or NGO"],
    kadam: "Sales hiring looks for proof that you can talk to strangers and move numbers. A Kadam problem like 'get more bulk orders' or 'find CSR partners' lets you run real outreach, track a real pipeline, and have the business verify the leads or revenue you brought in.",
  },
  sections: [
    {
      title: "Sales foundations",
      topics: [
        topic("sl-basics", "How selling works", "Selling is helping someone make a decision that is good for them. Most sales follow the same path: find a prospect, start a conversation, understand the need, show the fit, handle doubts, agree, and follow up. Learn the words B2B, B2C, lead, pipeline and conversion rate.", {
          why: "A shared vocabulary lets you plan and report like a professional.",
          time: "3–4 days",
          practice: "Watch how a phone shop salesperson sells to three customers. Write down each step they followed.",
          problemTypes: ["marketing", "research"],
          skills: ["sales basics"],
          resources: [course("HubSpot Academy: Inbound sales", "https://academy.hubspot.com/courses/inbound-sales"), vid("sales process steps explained")],
        }),
        topic("sl-customer", "Understanding the customer", "Before selling, know who buys, why they buy, and who else has a say. A kirana owner cares about margin and credit; a college cares about approvals and dates; an NGO donor cares about impact. Write a simple ideal customer profile.", {
          why: "You sell faster when you talk about the customer's problem, not your product.",
          time: "3–5 days",
          practice: "Write an ideal customer profile for a bakery that wants bulk orders from offices: company size, who decides, budget, and pain.",
          problemTypes: ["research", "marketing"],
          skills: ["customer research", "icp"],
          resources: [art("NN/g: Personas", "https://www.nngroup.com/articles/persona/"), vid("ideal customer profile b2b explained")],
        }),
        topic("sl-product", "Knowing what you sell", "Know the product's benefits, price, limits and competitors well enough to answer most questions on the spot. Turn features into outcomes: not 'online billing', but 'close the shop 20 minutes earlier'.", {
          why: "Customers trust people who know their stuff and are honest about limits.",
          time: "2–3 days",
          practice: "For your Kadam business, write five features and turn each into a one-line customer benefit.",
          problemTypes: ["marketing", "content"],
          skills: ["product knowledge", "value proposition"],
          resources: [vid("features vs benefits in sales"), find("value proposition examples")],
        }),
      ],
    },
    {
      title: "Find and reach prospects",
      topics: [
        topic("sl-prospect", "Prospecting", "Prospecting is building a list of people likely to buy. Use Google Maps, JustDial-style listings, LinkedIn, college directories, trade associations and referrals. Note name, contact, why they fit, and the source.", {
          why: "No list, no sales; a good list makes everything after it easier.",
          time: "1 week",
          practice: "Build a list of 30 offices within 3 km of a bakery that might order snacks for meetings, with a contact for each.",
          problemTypes: ["marketing", "research"],
          skills: ["prospecting", "lead generation"],
          resources: [guide("LinkedIn help", "https://www.linkedin.com/help/linkedin"), vid("b2b prospecting for beginners")],
        }),
        topic("sl-outreach", "Calls, WhatsApp and email outreach", "First messages should be short, personal and about them: who you are, why you are reaching out, one clear ask. On calls, prepare an opening line and two questions. Follow up politely; most replies come after the second or third touch.", {
          why: "Outreach is where most of a junior salesperson's day goes.",
          time: "1–2 weeks",
          practice: "Write a cold WhatsApp message, an email and a 30-second call opener for the bakery's office-order offer. Test them on five real offices.",
          problemTypes: ["marketing", "content"],
          skills: ["cold calling", "cold email", "whatsapp business"],
          resources: [guide("WhatsApp Business", "https://business.whatsapp.com/"), vid("cold calling tips for beginners"), vid("how to write a cold email that gets replies")],
          children: [
            sub("sl-out-call", "Cold calling", "Smile, say why you called in one line, ask a question, listen.", "1 week"),
            sub("sl-out-email", "Cold email", "Short subject, personal first line, one ask.", "3 days"),
            sub("sl-out-linkedin", "LinkedIn outreach", "Useful for B2B and partnerships; keep notes short and genuine.", "3 days", "optional"),
          ],
        }),
        topic("sl-referral", "Referrals and networks", "Happy customers and local associations bring the warmest leads. Ask for referrals after a good experience, join trader or alumni groups, and show up at local events.", {
          why: "Referred leads close much faster than cold ones.",
          time: "Ongoing",
          level: "optional",
          practice: "Ask three of a business's happiest customers for one referral each, and track what happens.",
          problemTypes: ["marketing"],
          skills: ["networking", "referrals"],
          resources: [vid("how to ask for referrals in sales"), find("referral program ideas for small business")],
        }),
      ],
    },
    {
      title: "Conversations that close",
      topics: [
        topic("sl-discovery", "Discovery questions", "A discovery call is mostly listening. Ask about the situation today, the problem, what it costs them, and what a good result looks like. Frameworks like SPIN help you remember the order.", {
          why: "The better you understand the need, the easier the pitch.",
          time: "1 week",
          practice: "Write eight discovery questions for a school that might buy a fee-reminder service, then role-play with a friend.",
          problemTypes: ["research", "marketing"],
          skills: ["discovery", "spin selling", "listening"],
          resources: [vid("spin selling questions explained"), vid("sales discovery call example")],
        }),
        topic("sl-pitch", "Pitching and demos", "Tie every point to what they told you in discovery. Show, don't tell: a quick demo, a sample or a before-and-after example. Keep it short and end with a clear next step.", {
          why: "A focused pitch respects the customer's time and wins more yeses.",
          time: "1 week",
          practice: "Prepare a 3-minute pitch of your Kadam solution for another shop owner in the same area, with one live demo.",
          problemTypes: ["marketing", "content"],
          skills: ["pitching", "presentation", "demo"],
          resources: [vid("how to give a sales demo"), vid("elevator pitch examples")],
        }),
        topic("sl-objections", "Handling objections", "'Too expensive', 'not now', 'we already use something' are normal. Listen fully, ask what is behind it, answer honestly, and check if you have addressed it. Never argue or pressure.", {
          why: "Most deals are won or lost at the objection stage.",
          time: "1 week",
          practice: "List the five most common objections for your Kadam offer and write a calm, honest reply to each.",
          problemTypes: ["marketing"],
          skills: ["objection handling"],
          resources: [vid("objection handling techniques in sales"), find("common sales objections and responses")],
        }),
        topic("sl-negotiate", "Negotiation and closing", "Know your walk-away point before you start, trade rather than give discounts, and write down what was agreed. Closing is just asking clearly for the decision.", {
          why: "Good negotiation protects margin and builds long-term trust.",
          time: "1 week",
          practice: "Role-play a bulk-order negotiation for a sweet shop with a friend: you may offer delivery or credit terms, not a price cut.",
          problemTypes: ["marketing", "finance"],
          skills: ["negotiation", "closing"],
          resources: [art("Harvard PON: Negotiation daily blog", "https://www.pon.harvard.edu/category/daily/"), vid("negotiation skills basics")],
        }),
      ],
    },
    {
      title: "Pipeline and numbers",
      topics: [
        topic("sl-crm", "CRM and pipeline tracking", "A CRM keeps every lead, conversation and next step in one place, so nothing falls through the cracks. A Google Sheet is fine to start; HubSpot and Zoho have free plans. Move each lead through stages: new, contacted, interested, proposal, won or lost.", {
          why: "Managers judge salespeople by their pipeline; a clean CRM is your scoreboard.",
          time: "3–5 days",
          practice: "Set up a pipeline sheet for your Kadam outreach with stages, next action and date, and update it every day for two weeks.",
          problemTypes: ["data", "operations"],
          skills: ["crm", "hubspot", "zoho crm", "pipeline management"],
          resources: [course("HubSpot Academy: HubSpot CRM", "https://academy.hubspot.com/courses/hubspot-crm"), guide("Zoho CRM help", "https://help.zoho.com/portal/en/kb/crm"), guide("Google Sheets help", "https://support.google.com/docs/topic/9054603")],
        }),
        topic("sl-metrics", "Sales metrics and targets", "Know your numbers: calls made, replies, meetings, proposals, deals and revenue. The conversion rate between stages tells you where to improve. Targets are usually monthly; plan backwards from them.", {
          why: "Numbers turn 'I worked hard' into 'I brought in ₹40,000'.",
          time: "3–4 days",
          practice: "From your pipeline sheet, calculate conversion from contacted to meeting to won, and say which stage to fix first.",
          problemTypes: ["data"],
          skills: ["sales metrics", "forecasting"],
          resources: [art("Investopedia: KPIs", "https://www.investopedia.com/terms/k/kpi.asp"), vid("sales funnel metrics explained")],
        }),
        topic("sl-pricing", "Pricing and proposals", "A proposal restates the customer's problem, your solution, price, timeline and terms on one or two pages. Learn the basics of margin and discounts so you never sell at a loss.", {
          why: "Clear proposals close faster and prevent disputes later.",
          time: "3–4 days",
          level: "optional",
          practice: "Write a one-page proposal for a caterer supplying a college fest: menu, per-plate price, advance, and cancellation terms.",
          problemTypes: ["finance", "content"],
          skills: ["proposals", "pricing"],
          resources: [art("Investopedia: Break-even analysis", "https://www.investopedia.com/terms/b/breakevenanalysis.asp"), find("simple sales proposal template")],
        }),
      ],
    },
    {
      title: "Grow accounts and partnerships",
      topics: [
        topic("sl-account", "Account management", "Keeping a customer is cheaper than finding a new one. Check in after the sale, solve problems fast, and look for ways to help them more. Repeat orders and referrals come from here.", {
          why: "Key account roles are a common next step after a first sales job.",
          time: "Ongoing",
          practice: "Call five past customers of a business, ask how it went, and log one request or complaint from each.",
          problemTypes: ["marketing", "operations"],
          skills: ["account management", "customer success"],
          resources: [vid("key account management basics"), course("HubSpot Academy: Inbound sales", "https://academy.hubspot.com/courses/inbound-sales")],
        }),
        topic("sl-partners", "Partnerships and CSR", "Business development often means partnerships: a café with a college, a startup with a distributor, an NGO with a company's CSR team. Find partners who gain something too, and write down who does what.", {
          why: "Partnerships can open many customers at once.",
          time: "1 week",
          level: "optional",
          practice: "Find three companies near a local NGO with CSR programmes and draft a one-page partnership note for each.",
          problemTypes: ["marketing", "research"],
          skills: ["partnerships", "csr", "business development"],
          resources: [vid("business development vs sales"), find("CSR partnership proposal for NGO India")],
        }),
        topic("sl-institutional", "Selling to institutions and government", "Colleges, hospitals and government buyers follow formal processes: quotations, approvals, tenders and portals like GeM. It is slower but the orders are larger.", {
          why: "Many Indian MSMEs grow by selling to institutions.",
          time: "1 week",
          level: "optional",
          practice: "Find out how your college buys stationery or catering, and list each approval step.",
          problemTypes: ["research", "operations"],
          skills: ["institutional sales", "tenders"],
          resources: [guide("Government e-Marketplace (GeM)", "https://gem.gov.in/"), vid("how to sell on gem portal")],
        }),
        topic("sl-mindset", "Resilience and habits", "Sales means hearing 'no' often. Good salespeople keep a daily routine, learn from each lost deal, and stay honest even under target pressure. Never promise what the business cannot deliver.", {
          why: "Consistency and honesty, not charm, decide long-term success.",
          time: "Ongoing",
          practice: "Keep a two-week log of every 'no', the reason, and one thing you will try differently.",
          skills: ["resilience", "ethics"],
          resources: [vid("how to handle rejection in sales"), find("daily routine for sales development representatives")],
        }),
      ],
    },
  ],
};

export default salesExecutive;

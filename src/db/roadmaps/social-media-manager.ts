import type { RoadmapData } from "../roadmaps-data.ts";
import { course, find, guide, sub, tool, topic, vid } from "./_kit.ts";

const socialMediaManager: RoadmapData = {
  role: "social-media-manager",
  title: "Social Media Manager",
  summary: "Run a brand's Instagram, WhatsApp, YouTube and Facebook so the right people notice it, trust it and come back.",
  intro: {
    does: "A social media manager plans, creates and posts content for a brand, replies to people, and checks what is working. For a small Indian business that usually means Instagram reels, WhatsApp Business broadcasts and a Google Business Profile, done on a tight budget.",
    firstJobs: ["Social Media Executive", "Social Media Intern-to-hire at an agency", "Content & Community Associate", "Digital Marketing Executive", "Freelance social media manager for local brands"],
    kadam: "Agencies hire people who can show real accounts they grew. A Kadam problem gives you a real business page to run for a few weeks, with the owner confirming the results (followers, enquiries, walk-ins) in your impact report.",
  },
  sections: [
    {
      title: "Foundations",
      topics: [
        topic("sm-audience", "Know the audience", "Before posting anything, know who you are talking to: their age, area, language, what they care about and when they are online. A college canteen and a bridal boutique need completely different content. Write a one-paragraph audience profile and keep it next to you.", {
          why: "Content only works when it fits the people who see it.",
          time: "3–4 days",
          practice: "Talk to five customers of a local bakery. Write who they are, which apps they use, and what would make them share a post.",
          problemTypes: ["marketing", "research"],
          skills: ["audience research"],
          resources: [course("HubSpot Academy: Social media marketing", "https://academy.hubspot.com/courses/social-media"), vid("how to find your target audience on instagram")],
        }),
        topic("sm-platforms", "How each platform works", "Instagram rewards reels and saves, WhatsApp is for direct, personal updates, YouTube is for search and longer videos, and Facebook still reaches older and smaller-town audiences. LinkedIn suits B2B and NGOs seeking partners. Learn what each is good for and what its feed favours.", {
          why: "Posting the same thing everywhere wastes effort; each platform has its own rules.",
          time: "1 week",
          practice: "For a local NGO, pick two platforms and explain in five lines why each one fits their donors or volunteers.",
          problemTypes: ["marketing"],
          skills: ["instagram", "whatsapp business", "youtube", "facebook"],
          resources: [guide("Instagram for Business", "https://business.instagram.com/"), guide("WhatsApp Business", "https://business.whatsapp.com/"), guide("YouTube Creators", "https://www.youtube.com/creators/"), course("Meta Blueprint (free)", "https://www.facebook.com/business/learn")],
          children: [
            sub("sm-plat-ig", "Instagram", "Reels, carousels, stories, highlights and a clear bio with a contact button.", "3 days", "recommended", [guide("Instagram creators hub", "https://creators.instagram.com/")]),
            sub("sm-plat-wa", "WhatsApp Business", "Catalogue, quick replies, labels and broadcast lists. Often the main sales channel for small shops.", "2 days", "recommended", [guide("WhatsApp Business help", "https://faq.whatsapp.com/")]),
            sub("sm-plat-gbp", "Google Business Profile", "Photos, hours and replies to reviews. Brings walk-ins from Maps searches.", "1–2 days", "recommended", [guide("Google Business Profile help", "https://support.google.com/business")]),
            sub("sm-plat-li", "LinkedIn", "For B2B brands, NGOs and founders building a public voice.", "2 days", "optional"),
          ],
        }),
        topic("sm-brand", "Brand voice and look", "A brand voice is how the business sounds: friendly, premium, funny, caring. Pick three words, a colour palette and two fonts, and stick to them. Consistency is what makes people recognise a page in a busy feed.", {
          why: "A consistent voice and look builds trust over time.",
          time: "3–4 days",
          practice: "Make a one-page brand guide for a kirana: three voice words, colours, fonts, and two do / don't examples.",
          problemTypes: ["marketing", "design_ux"],
          skills: ["branding", "tone of voice"],
          resources: [course("Canva Design School", "https://www.canva.com/designschool/"), vid("how to create a brand voice for social media")],
        }),
      ],
    },
    {
      title: "Plan content",
      topics: [
        topic("sm-calendar", "Content pillars and calendar", "Content pillars are the three to five themes a brand keeps posting about, such as products, behind the scenes, customer stories and tips. A content calendar puts them on dates, including festivals and local events. Planning a month ahead stops last-minute, random posts.", {
          why: "A calendar is how you post consistently without burning out.",
          time: "3–5 days",
          practice: "Build a one-month calendar in Google Sheets for a sweet shop, with Diwali or a local festival in it.",
          problemTypes: ["marketing", "operations"],
          skills: ["content calendar", "content strategy"],
          resources: [course("HubSpot Academy: Content marketing", "https://academy.hubspot.com/courses/content-marketing"), guide("Google Sheets help", "https://support.google.com/docs/topic/9054603"), vid("how to make a social media content calendar")],
        }),
        topic("sm-copy", "Writing captions and hooks", "The first line of a caption or the first second of a reel decides if people stop scrolling. Write short, clear lines in the language your audience uses, including Hinglish or the local language. End with one clear action: call, DM, visit, save.", {
          why: "Good words turn views into enquiries.",
          time: "1 week",
          practice: "Write ten hooks for a tiffin service reel, then pick the best three and say why.",
          problemTypes: ["content", "marketing"],
          skills: ["copywriting", "captions"],
          resources: [vid("how to write instagram captions that convert"), find("social media copywriting tips")],
        }),
        topic("sm-trends", "Trends and timing", "Trending audio, memes and festival moments can lift reach, but only if they fit the brand. Check what is trending, adapt it quickly, and skip trends that feel forced or could offend.", {
          why: "Timely posts reach far more people for the same effort.",
          time: "Ongoing",
          level: "optional",
          practice: "Each week for a month, adapt one trending reel format for a local business and note its reach.",
          problemTypes: ["marketing", "content"],
          skills: ["trend spotting"],
          resources: [guide("Instagram creators hub", "https://creators.instagram.com/"), vid("how to find trending audio on instagram reels")],
        }),
      ],
    },
    {
      title: "Create content",
      topics: [
        topic("sm-design", "Designing posts in Canva", "Most small brands live on Canva. Learn templates, brand kits, resizing for each platform, and simple layouts with plenty of space. One clear message per post beats a crowded flyer.", {
          why: "You will make several posts a week; speed and polish both matter.",
          time: "1 week",
          practice: "Design a carousel of five slides explaining a local NGO's work, using its brand colours.",
          problemTypes: ["design_ux", "marketing"],
          skills: ["canva", "graphic design"],
          resources: [course("Canva Design School", "https://www.canva.com/designschool/"), guide("Canva: Design principles", "https://www.canva.com/learn/design-elements-principles/")],
        }),
        topic("sm-video", "Short video and reels", "Short vertical video gets the most reach on Instagram and YouTube. Learn to plan a 15–30 second reel, shoot steady with good light on a phone, cut fast, add captions and use trending audio carefully.", {
          why: "Reels and Shorts are where most organic reach comes from today.",
          time: "2 weeks",
          practice: "Shoot and edit a 20-second 'a day at the shop' reel for a kirana using only a phone and a free editor.",
          problemTypes: ["content", "marketing"],
          skills: ["reels", "video editing", "capcut"],
          resources: [tool("CapCut", "https://www.capcut.com/"), vid("how to shoot reels with phone"), guide("YouTube Creators", "https://www.youtube.com/creators/")],
          children: [
            sub("sm-video-shoot", "Shooting on a phone", "Natural light, steady hands, clean background, clear audio.", "3 days"),
            sub("sm-video-edit", "Editing and captions", "Cut dead air, add text on screen; most people watch muted.", "4 days"),
          ],
        }),
        topic("sm-photo", "Product photos", "Clean, bright product photos sell more. A window, a white sheet and a phone are enough. Learn simple angles, backgrounds and editing.", {
          why: "Small businesses rarely have a photographer; you will be one.",
          time: "3–4 days",
          level: "optional",
          practice: "Shoot ten product photos for a boutique's WhatsApp catalogue on one plain background.",
          problemTypes: ["content", "design_ux"],
          skills: ["product photography"],
          resources: [vid("product photography with phone at home"), course("Canva Design School", "https://www.canva.com/designschool/")],
        }),
        topic("sm-ugc", "Customer stories and UGC", "User-generated content is posts made by customers: reviews, unboxings, tagged photos. Ask for it, reshare it with permission, and turn happy customers into the brand's best voice.", {
          why: "People trust other customers more than the brand itself.",
          time: "3 days",
          level: "optional",
          practice: "Collect three customer quotes for a café and turn them into a story highlight called 'Love notes'.",
          problemTypes: ["marketing", "content"],
          skills: ["ugc", "testimonials"],
          resources: [vid("user generated content strategy small business"), guide("Instagram creators hub", "https://creators.instagram.com/")],
        }),
      ],
    },
    {
      title: "Community and growth",
      topics: [
        topic("sm-community", "Replies and community", "Social media is a conversation. Reply to comments and DMs quickly and politely, handle complaints in private, and use WhatsApp quick replies for common questions. A page that answers gets more trust and more sales.", {
          why: "For small businesses, DMs and comments are often where sales happen.",
          time: "3–4 days",
          practice: "Write quick replies for the ten most common questions a cake shop gets (price, delivery, eggless?), in English and Hindi.",
          problemTypes: ["marketing", "operations"],
          skills: ["community management", "customer service"],
          resources: [guide("WhatsApp Business help", "https://faq.whatsapp.com/"), guide("Meta Business help centre", "https://www.facebook.com/business/help")],
        }),
        topic("sm-collab", "Collaborations and local influencers", "Partnering with local creators, colleges or nearby businesses can reach new people cheaply. Pick partners whose followers match your audience, agree clearly on what each side does, and make sure paid posts are labelled as ads.", {
          why: "Small budgets go further with the right partner than with ads.",
          time: "3–5 days",
          level: "optional",
          practice: "Shortlist three local food creators for a new café. Compare followers, engagement and fit, and draft a polite outreach DM.",
          problemTypes: ["marketing"],
          skills: ["influencer marketing", "partnerships"],
          resources: [guide("ASCI (Advertising Standards Council of India)", "https://www.ascionline.in/"), find("ASCI influencer advertising guidelines")],
        }),
        topic("sm-ads", "Paid ads basics", "A small, well-targeted boost can bring real enquiries. Learn Meta Ads Manager basics: objective, audience by area and age, budget, and a clear creative. Start with ₹100–200 a day and stop what does not work.", {
          why: "Most brands spend some money on ads; you must spend it wisely.",
          time: "1 week",
          level: "optional",
          practice: "Plan a ₹1,000 Instagram campaign for a coaching centre's admissions: audience, two creatives and what you will measure.",
          problemTypes: ["marketing"],
          skills: ["meta ads", "paid social"],
          resources: [course("Meta Blueprint (free)", "https://www.facebook.com/business/learn"), guide("Meta: Advertise on Facebook and Instagram", "https://www.facebook.com/business/ads")],
        }),
      ],
    },
    {
      title: "Measure and report",
      topics: [
        topic("sm-analytics", "Analytics that matter", "Followers are not the goal; enquiries, visits and sales are. Learn to read reach, saves, shares, profile visits and link clicks in Instagram Insights and Meta Business Suite. Track a few numbers weekly in a sheet.", {
          why: "Numbers tell you what to make more of, and prove your value to the owner.",
          time: "3–5 days",
          practice: "Track a page for four weeks in Google Sheets: posts, reach, saves, DMs and enquiries. Find the best post type.",
          problemTypes: ["data", "marketing"],
          skills: ["social media analytics", "instagram insights"],
          resources: [guide("Instagram help: Insights", "https://help.instagram.com/"), guide("Meta Business help centre", "https://www.facebook.com/business/help"), vid("instagram insights explained")],
        }),
        topic("sm-report", "Monthly reports", "A simple monthly report shows what you posted, what worked, what did not and what you will try next. Keep it to one page with three or four charts. Owners want to know: did it bring customers?", {
          why: "Clear reports keep clients and turn a project into a reference.",
          time: "2 days",
          practice: "Write a one-page monthly report for your Kadam business with three numbers and one recommendation.",
          problemTypes: ["data", "content"],
          skills: ["reporting"],
          resources: [find("social media monthly report template"), course("Google Skillshop", "https://skillshop.withgoogle.com/")],
        }),
        topic("sm-tools", "Scheduling and tools", "Meta Business Suite lets you schedule Instagram and Facebook posts for free. A shared Google Drive keeps files organised. Tools save time, but only after you have a plan.", {
          why: "Scheduling lets you post at the right time without being online all day.",
          time: "1–2 days",
          level: "optional",
          practice: "Schedule a week of posts in Meta Business Suite for your Kadam business.",
          skills: ["meta business suite", "scheduling"],
          resources: [guide("Meta Business help centre", "https://www.facebook.com/business/help"), vid("how to schedule posts meta business suite")],
        }),
      ],
    },
  ],
};

export default socialMediaManager;

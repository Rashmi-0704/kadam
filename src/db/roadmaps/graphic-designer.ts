import type { RoadmapData } from "../roadmaps-data.ts";
import { art, course, find, guide, sub, tool, topic, vid } from "./_kit.ts";

const graphicDesigner: RoadmapData = {
  role: "graphic-designer",
  title: "Graphic Designer",
  summary: "Make posters, logos, social posts and packaging that look good and get the message across at a glance.",
  intro: {
    does: "A graphic designer turns a message into visuals: logos, posters, social media posts, menus, packaging, banners and brochures. The job is less about decoration and more about clarity — helping people notice, understand and remember a brand.",
    firstJobs: ["Junior Graphic Designer", "Social Media / Creative Designer at an agency", "Visualiser", "In-house designer at a D2C brand or startup", "Freelance designer for local businesses"],
    kadam: "Design hiring is portfolio-first. Kadam problems — a kirana's new signboard, an NGO's donation poster, a café's menu — give you real briefs with real clients, and the business's verification shows your work was actually used, not just a mock-up.",
  },
  sections: [
    {
      title: "Design basics",
      topics: [
        topic("gd-principles", "Principles of design", "A few principles make most designs work: hierarchy (what to see first), alignment, contrast, repetition, proximity and white space. Learn to spot them in good and bad posters around you. Most beginner designs fail because they try to say everything at once.", {
          why: "These principles are what clients and art directors judge, even if they don't name them.",
          time: "1–2 weeks",
          practice: "Photograph five shop signboards in your area. For each, say what you see first and redesign one on paper to fix its hierarchy.",
          problemTypes: ["design_ux"],
          skills: ["design principles", "layout"],
          resources: [course("GCFGlobal: Beginning graphic design", "https://www.learnfree.org/series/beginning-graphic-design"), art("Canva: Design elements and principles", "https://www.canva.com/learn/design-elements-principles/"), guide("Figma: Design basics", "https://www.figma.com/resource-library/design-basics/")],
          children: [
            sub("gd-pr-hierarchy", "Hierarchy", "Size, weight and colour tell the eye where to go first.", "2–3 days"),
            sub("gd-pr-grid", "Grids and alignment", "Line things up so the design feels calm and planned.", "2–3 days"),
            sub("gd-pr-space", "White space", "Empty space is not wasted; it makes the important part stand out.", "1–2 days"),
          ],
        }),
        topic("gd-type", "Typography", "Type is most of what people read in a design. Learn to pair at most two fonts, set clear sizes for headings and body, and keep enough spacing between lines. For Indian audiences, learn fonts that support Devanagari and other scripts well.", {
          why: "Bad type makes a design look cheap and hard to read, no matter the colours.",
          time: "1–2 weeks",
          practice: "Design the same 'Grand opening' poster for a sweet shop with three different font pairings, including one Hindi or regional version.",
          problemTypes: ["design_ux"],
          skills: ["typography", "fonts"],
          resources: [guide("Google Fonts Knowledge", "https://fonts.google.com/knowledge"), art("Butterick's Practical Typography", "https://practicaltypography.com/"), vid("typography basics for graphic design")],
        }),
        topic("gd-colour", "Colour", "Colour sets mood and builds recognition. Learn the colour wheel, simple palettes (one main colour, one accent, neutrals), and contrast so text stays readable. Remember colours print differently from how they look on screen.", {
          why: "Colour is the first thing people remember about a brand.",
          time: "1 week",
          practice: "Create two palettes for a children's NGO and check that text on each passes a contrast checker.",
          problemTypes: ["design_ux"],
          skills: ["colour theory"],
          resources: [tool("Adobe Color", "https://color.adobe.com/"), tool("Canva colour wheel", "https://www.canva.com/colors/color-wheel/"), tool("WebAIM contrast checker", "https://webaim.org/resources/contrastchecker/")],
        }),
        topic("gd-images", "Images, icons and composition", "Choose images that support the message, crop them with intention, and keep icons in one consistent style. Learn the rule of thirds and how to lead the eye with lines and faces.", {
          why: "The right image does half the work of a design.",
          time: "1 week",
          practice: "Make a donation poster for a food bank with one strong photo, one headline and one call to action.",
          problemTypes: ["design_ux", "content"],
          skills: ["composition", "image selection"],
          resources: [vid("composition in graphic design rule of thirds"), guide("Pexels license", "https://www.pexels.com/license/")],
        }),
      ],
    },
    {
      title: "Tools",
      topics: [
        topic("gd-canva", "Canva", "Canva is where most small Indian businesses and NGOs make their designs, so you should be fast in it. Learn templates without looking templated, brand kits, resizing, and exporting correctly for print and social.", {
          why: "Clients often want files they can edit themselves in Canva.",
          time: "1 week",
          practice: "Set up a Canva brand kit for a local café and make three editable post templates the owner can reuse.",
          problemTypes: ["design_ux", "marketing"],
          skills: ["canva"],
          resources: [course("Canva Design School", "https://www.canva.com/designschool/"), vid("canva tutorial for beginners")],
        }),
        topic("gd-pro", "Professional tools: Photoshop, Illustrator or free alternatives", "Agencies expect Adobe Photoshop (photos) and Illustrator (logos and vector art). If you cannot afford them, learn the same ideas in free tools: Photopea or GIMP for photos, Inkscape or Figma for vectors. The skills carry over.", {
          why: "Most design job posts in India still list Photoshop and Illustrator.",
          time: "4–6 weeks",
          practice: "Recreate a simple logo you like as a vector, then design an original logo for a tea stall in the same tool.",
          problemTypes: ["design_ux"],
          skills: ["photoshop", "illustrator", "gimp", "inkscape"],
          resources: [tool("Photopea (free, in browser)", "https://www.photopea.com/"), guide("GIMP tutorials", "https://www.gimp.org/tutorials/"), vid("illustrator for beginners"), vid("photoshop for beginners")],
          children: [
            sub("gd-pro-raster", "Raster vs vector", "Photos are pixels; logos should be vectors so they scale to a hoarding.", "1 day"),
            sub("gd-pro-layers", "Layers and masks", "Edit without destroying the original.", "3–4 days"),
            sub("gd-pro-pen", "The pen tool", "The key skill for clean logos and icons. Practise daily.", "1–2 weeks"),
          ],
        }),
        topic("gd-figma", "Figma", "Figma is free for students, works in the browser, and is great for social posts, presentations and UI. Learn frames, auto layout and components to make reusable templates.", {
          why: "Startups often use Figma for both brand and product design.",
          time: "1–2 weeks",
          level: "optional",
          practice: "Build a set of Instagram post templates in Figma with components for headline, image and logo.",
          problemTypes: ["design_ux"],
          skills: ["figma"],
          resources: [guide("Figma help centre", "https://help.figma.com/hc/en-us"), vid("figma for graphic designers")],
        }),
      ],
    },
    {
      title: "Common work",
      topics: [
        topic("gd-social", "Social media creatives", "Posts, carousels, stories and thumbnails make up much of a junior designer's work. Design for a small phone screen: big text, one message, brand colours. Learn the sizes for each platform.", {
          why: "This is the most common paid design work for small brands.",
          time: "1–2 weeks",
          practice: "Design a 5-slide Instagram carousel for a local gym's new batch timings, plus a matching story.",
          problemTypes: ["design_ux", "marketing"],
          skills: ["social media design"],
          resources: [course("Canva Design School", "https://www.canva.com/designschool/"), vid("instagram post design tips")],
        }),
        topic("gd-brand", "Logos and brand identity", "A brand identity is a logo plus the rules around it: colours, fonts, spacing and tone. A good small-business logo is simple, works in one colour and is readable on a WhatsApp profile picture.", {
          why: "Identity projects are high-value work and great portfolio pieces.",
          time: "2–3 weeks",
          practice: "Create a logo and one-page brand guide for a home bakery: logo versions, colours, fonts and two usage examples.",
          problemTypes: ["design_ux", "marketing"],
          skills: ["logo design", "branding"],
          resources: [vid("logo design process for beginners"), vid("how to make a brand style guide")],
        }),
        topic("gd-print", "Print design", "Menus, flyers, banners, visiting cards and packaging still matter a lot for Indian small businesses. Learn CMYK vs RGB, bleed and margins, resolution, and how to talk to a local printer so the result matches your screen.", {
          why: "A file that prints wrong costs the client money.",
          time: "1 week",
          practice: "Design a two-sided menu card for a dhaba, export a print-ready PDF with bleed, and get one copy printed locally.",
          problemTypes: ["design_ux"],
          skills: ["print design", "cmyk"],
          resources: [vid("print design basics bleed cmyk"), find("how to prepare print ready pdf")],
        }),
        topic("gd-motion", "Simple motion graphics", "Short animated posts and reel intros get more attention than static ones. Start with simple animations in Canva or CapCut before learning After Effects.", {
          why: "Brands increasingly ask designers for short motion pieces.",
          time: "2 weeks",
          level: "optional",
          practice: "Animate your gym carousel into a 10-second reel with moving text.",
          problemTypes: ["design_ux", "content"],
          skills: ["motion graphics"],
          resources: [tool("CapCut", "https://www.capcut.com/"), vid("motion graphics for beginners canva")],
        }),
        topic("gd-presentations", "Presentations and documents", "Pitch decks, reports and brochures need clear layouts and consistent styles across many pages. NGOs and startups often need this more than logos.", {
          why: "Well-designed reports and decks are in steady demand.",
          time: "1 week",
          level: "optional",
          practice: "Redesign a local NGO's annual report summary as a clean 4-page PDF.",
          problemTypes: ["design_ux", "content"],
          skills: ["presentation design", "layout"],
          resources: [vid("presentation design tips"), course("Canva Design School", "https://www.canva.com/designschool/")],
        }),
      ],
    },
    {
      title: "Working with clients",
      topics: [
        topic("gd-brief", "Briefs and feedback", "Start every job with a brief: the goal, audience, message, sizes, deadline and what 'done' means. Show two or three directions, ask for specific feedback, and agree the number of revision rounds up front.", {
          why: "Most design disputes come from an unclear brief, not bad design.",
          time: "3–4 days",
          practice: "Write a one-page brief with your Kadam business owner before starting, and get them to agree to it on WhatsApp.",
          problemTypes: ["design_ux", "operations"],
          skills: ["creative briefs", "client communication"],
          resources: [vid("how to write a design brief"), vid("how to handle client feedback as a designer")],
        }),
        topic("gd-copyright", "Copyright and licences", "You cannot use any image or font you find on Google. Use your own photos, licence-free sources, or properly licensed assets, and check font licences for commercial use. Give clients the final files they paid for.", {
          why: "Using someone else's work can get your client into legal trouble.",
          time: "1–2 days",
          practice: "Audit one of your past designs: list every image and font and confirm each one is allowed for commercial use.",
          problemTypes: ["research"],
          skills: ["copyright", "licensing"],
          resources: [guide("Pexels license", "https://www.pexels.com/license/"), guide("Google Fonts (open licences)", "https://fonts.google.com/knowledge"), find("font license commercial use explained")],
        }),
        topic("gd-files", "Files and handover", "Name files clearly, keep editable source files, and export in the right formats: PNG for social, PDF for print, SVG for logos. A tidy handover folder makes clients come back.", {
          why: "Professional handover is what separates freelancers who get repeat work.",
          time: "1 day",
          practice: "Prepare a handover folder for your Kadam project: source files, exports by use, and a readme.",
          problemTypes: ["operations"],
          skills: ["file management"],
          resources: [vid("png vs jpg vs svg vs pdf when to use"), find("design file handover checklist")],
        }),
      ],
    },
    {
      title: "Portfolio and career",
      topics: [
        topic("gd-portfolio", "Building a portfolio", "Show five to eight of your best projects, each with the brief, your process and the result. Real client work, even small, beats imaginary rebrands of big companies. Put it on Behance or a simple website and keep a PDF version for applications.", {
          why: "Designers are hired on their portfolio, not their marks.",
          time: "2 weeks",
          practice: "Write up your Kadam project as a case study: the problem, three sketches, the final design and the owner's verified result.",
          problemTypes: ["design_ux", "content"],
          skills: ["portfolio"],
          resources: [vid("graphic design portfolio tips"), find("graphic design case study portfolio examples")],
        }),
        topic("gd-ux", "Moving towards UI/UX", "Many graphic designers move into UI and UX design, which pays well and is in demand. Your visual skills carry over; add user research, wireframes and prototyping.", {
          why: "It is a common next step with strong demand in India.",
          time: "1–2 months",
          level: "optional",
          skills: ["ui design", "ux"],
          resources: [art("NN/g: 10 usability heuristics", "https://www.nngroup.com/articles/ten-usability-heuristics/"), guide("Figma help centre", "https://help.figma.com/hc/en-us")],
        }),
      ],
    },
  ],
};

export default graphicDesigner;

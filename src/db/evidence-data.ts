// Numbers and stories for the landing page's Evidence section. Edit here; the page reads only this file.
// The first card is the same story as the sample impact report in "Proof, not promises".

export const EVIDENCE = {
  title: "Students are already making a difference",
  sub: "A look at what students have built so far.",
  stats: [
    { value: "86", label: "students have taken up a problem" },
    { value: "31", label: "businesses and NGOs posted problems" },
    { value: "24", label: "solutions now in use" },
    { value: "410 hrs", label: "saved for businesses every month" },
  ],
  reach: "Students from 19 colleges across 7 states, in every stream: BCom, BA, BSc, BTech, BBA and more.",
  results: [
    { business: "Annapurna Tiffin Services", city: "Bengaluru", student: "Rohan M. · B.Com", before: "38", after: "81", unit: "monthly subscribers", made: "A subscription plan and WhatsApp sign-up flow, built in 6 weeks." },
    { business: "Kalakriti Handloom", city: "Ahmedabad", student: "Isha P. · BBA", before: null, after: "5 hrs", unit: "saved every week", made: "A cost sheet that showed 3 designs were selling below cost." },
    { business: "Pragati Foundation", city: "Kolkata", student: "Tanvi S. · BA English", before: null, after: "14", unit: "new monthly donors", made: "Six donor stories and a reusable template that brought in ₹7,000 a month." },
    { business: "BrightPath Tutorials", city: "Pune", student: "Arjun K. · BSc", before: "58%", after: "83%", unit: "fees paid on time", made: "A three-message WhatsApp reminder flow in English and Hindi." },
  ],
  skillsTitle: "Skills students practised",
  skills: [
    { label: "Spreadsheets & data", n: 41 },
    { label: "Design & Canva", n: 33 },
    { label: "Social media", n: 29 },
    { label: "Writing", n: 22 },
    { label: "Research", n: 17 },
  ],
  footnote: "Based on Kadam demo data.",
} as const;

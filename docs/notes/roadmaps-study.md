# roadmap.sh: structure study (for Kadam roadmaps)

Studied 17 Nov 2026: roadmap.sh /frontend, /backend, /full-stack, /product-manager, /data-analyst, /ux-design, and the public repo's contributing guide (github.com/nilbuild/developer-roadmap, formerly kamranahmedse/developer-roadmap). We took **structure only**. No text, topic lists or resource lists were copied, because the content licence allows personal use only. We link to roadmap.sh with credit.

## What we learned

- **The page above the map.** Each roadmap page has a title, a one-line subtitle and tabs: Roadmap, Projects and AI Tutor. Below the map are long intro sections ("What is a X?", "What does a X do?", "Skills required") and an FAQ covering salary, time to learn, and X vs Y. Our version is the short **intro block** (what the role does, first jobs, salary with a source, how Kadam helps).
- **Order.** Sections run top to bottom along one spine. Each main topic sits on the spine, and its sub-topics branch off to the left or right. You read the spine in order, and the branches are a "go deeper" list for that topic.
- **Legend.** Nodes have three marks: "Personal recommendation / opinion" (purple check), "Alternative option: pick this or the purple one" (green) and "Order not strict / learn anytime" (grey). Our matching levels are **recommended / alternative / optional**, drawn in our own style: solid border, a double border with a ⇄ mark, and a dashed border.
- **Topic drawer.** Clicking a node opens a side drawer. It has the title, one short paragraph (their contributing guide asks for a single concise paragraph), a progress control, and then "Free resources".
- **Resource tags.** Every link carries a type tag: official, opensource, article, course, podcast, video or book. Links are listed in that type order, with at most 8 per topic. Paid partner courses appear separately under a "Premium" label. Our types are Article, Video, Course, Guide (shown for `docs`) and Tool, grouped by type, every one marked **Free**, with no premium links.
- **Progress.** Each topic is Done, In progress or Skip, and skipped topics count towards completion. Right-click marks a topic done, Shift-click marks it in progress, and Alt-click skips it. We already have Done, Learning and Skip with the same shortcuts.
- **Projects tab.** A separate list of practice projects is graded by difficulty. Kadam's version is real business problems: the "Real problems" tab, plus "Practise on a real problem" inside each drawer, filtered by problem type.
- **Role-based vs skill-based.** The /roadmaps index splits roadmaps into role-based ones (Frontend, Data Analyst, Product Manager…) and skill-based ones (SQL, Python, React, Git…). Our browser already uses this split.
- **Personalise / AI tutor.** Readers can hide topics and ask an AI about a topic. We leave this out. Static roadmaps never call AI, and AI roadmaps are generated once and cached.
- **What they don't give.** There is no "why this matters for this role", no time estimates, and no practice task per topic. That is where Kadam adds value for college students.
- **Salary.** It appears only as a heading in their FAQ, so they show no figures. We show a range only when we can cite a public source with a URL.
- **Their curation rule.** "Adding everything is not the goal": keep what is most useful today. We follow this too, with 4–7 sections per roadmap and only the topics that matter for a first job.

## Confirmed roadmap.sh slugs (curl, HTTP status, 17 Nov 2026)

Return **200**: frontend, backend, full-stack, product-manager, data-analyst, ux-design, bi-analyst, technical-writer, devrel, ai-data-scientist, computer-science, qa, sql, python, javascript, react, git-github, prompt-engineering, android, devops, cyber-security, ai-engineer, engineering-manager.

Return **404**: business-analyst, digital-marketing, marketing, content-writer, journalist, financial-analyst.

Links used on Kadam's 8 base roadmaps:

| Kadam role | `rsh` |
|---|---|
| data-analyst | data-analyst, sql |
| frontend-developer | frontend, javascript, react |
| ux-designer | ux-design |
| business-analyst | bi-analyst |
| content-writer | technical-writer (related, not the same role) |
| digital-marketer, financial-analyst, journalist | none (no roadmap.sh page) |

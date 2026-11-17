# New hand-written roadmaps + richer catalogue (build-log notes)

## What was added
- `src/db/roadmaps/_kit.ts`: helpers (`art`, `guide` = "docs"/Guide, `course`, `tool`, `vid` = YouTube search, `find` = Google search, `topic`, `sub`). Imports types only.
- Eight roadmaps, one file each, registered in `src/db/roadmaps/index.ts` → `EXTRA_ROADMAPS`:
  | File | role slug | id prefix | rsh |
  |---|---|---|---|
  | backend-developer.ts | backend-developer | be- | backend |
  | full-stack-developer.ts | full-stack-developer | fs- | full-stack |
  | product-manager.ts | product-manager | pm- | product-manager |
  | social-media-manager.ts | social-media-manager | sm- | – |
  | operations-analyst.ts | operations-analyst | op- | – |
  | sales-executive.ts | sales-executive | sl- | – |
  | hr-executive.ts | hr-executive | hr- | – |
  | graphic-designer.ts | graphic-designer | gd- | – |
- Each has an intro (does, firstJobs, kadam), 5–6 sections, 15–20 main topics with explainer, why, level, time, practice, problemTypes and 2–4 resources, plus lighter sub-topics.

## Decisions
- **Slugs reuse existing catalogue/taxonomy slugs** so progress, matching and the catalogue line up: "Operations Associate" uses `operations-analyst` (title "Operations Associate / Analyst"), "Sales & Business Development" uses `sales-executive`, "HR / People Operations" uses `hr-executive`.
- `backend-developer`, `full-stack-developer`, `sales-executive` and `hr-executive` are not in `taxonomy.ts` `ROLES` (not my file). `roleTitle()` falls back to title-casing the slug ("Hr Executive", "Sales Executive"). Suggest adding them to `ROLES` with titles matching the catalogue.
- **No salary ranges.** No public source could be confirmed from here (salary sites block automated checks), so `intro.salary` is omitted everywhere, as the spec allows.
- **Resources:** only well-known sites. Every direct URL (151) was checked with curl and returns 200; redirected URLs were replaced with their final address. Where no single page fit, a YouTube or Google search URL is used with `search` set. Sites that block bots (Adobe helpx, Behance, ASQ, Inkscape, Coolors) were left out in favour of verified alternatives (Photopea, GIMP, draw.io, Investopedia).
- **roadmap.sh:** checked with curl. 200: backend, full-stack, product-manager, frontend, android, data-analyst, ai-data-scientist, ai-engineer, devops, cyber-security, computer-science, qa, ux-design, git-github, python, sql, javascript, react, prompt-engineering (plus nodejs, api-design, system-design, design-system, data-engineer, machine-learning, linux, docker, typescript, postgresql-dba, mongodb, bi-analyst, technical-writer, kotlin, java, software-design-architecture, mlops, html, css, engineering-manager, devrel). 404: graphic-design, marketing. Every `rsh` already in the catalogue exists; none were removed. No roadmap.sh content was copied.
- Non-recommended topics also set the old `optional: true` flag so older UI paths still dim them.

## Catalogue (`src/db/roadmap-catalog.ts`)
New optional fields on `CatalogItem` (`topics` kept and still filled, flattened from sections):
- `sections?: { title: string; topics: string[] }[]`: ordered outline for the AI prompt.
- `optional?: string[]`: topic names (exact strings from `topics`) that are nice-to-have; everything else is core.
- `level?: "beginner" | "intermediate" | "advanced"`: how hard the role/skill is to start from zero (matches `DIFFICULTIES`).
In the source a topic ending in `?` inside a section is optional; the `build()` helper strips the `?` and fills `optional`.
All 32 entries without a hand-written roadmap now have 3–4 sections and 7–14 topics; all 48 entries have `level`. Entries with a hand-written roadmap keep a short `topics` list only.

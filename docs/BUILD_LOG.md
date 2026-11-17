# Kadam build log

Running log of decisions, conflicts and setup steps. If work is interrupted, resume from **Current stage**.

## Current stage
Round 2 (17 Nov): indigo + coral light theme, tagline "Take your first step.", hero role trail and word rows, email + password login with no auth emails, richer roadmaps (16 hand-written), Gemini calls cut and metered. See "Round 2" below.

Done: stages 1–5 (scaffold, schema, auth, seed, deploy; business side; student side; engagement + impact reports; roadmaps, notifications, admin queue, student dashboard).

## Setup status
| Item | Status | Notes |
|---|---|---|
| Next.js 16.4 (App Router) + Tailwind 4 | Done | `kadam/` |
| Vercel project | Done | `mesa-90a8/kadam` → https://kadam-virid.vercel.app. Linked and deployed with the Vercel CLI (no Vercel connector was available in this session). Env vars set: `SESSION_SECRET`, `DEMO_MODE=true`, `GEMINI_MODEL`, `SARVAM_STT_MODEL` (production, preview, development). |
| Supabase project | **Done** (15 Nov) | Created through the Vercel Marketplace (`kadam-db`, connected to the `kadam` project) after the terms were accepted. Env vars synced to Vercel and `.env.local`. On first connection the app created the schema, five private storage buckets and the demo data. |
| Database until then | Partial (fallback) | With no `POSTGRES_URL`/`DATABASE_URL`, the app runs on an embedded Postgres (PGlite) with the same schema and seed. Locally it persists in `.data/` and the whole demo path works. **On Vercel it is per-instance and temporary**: seeded pages read fine, but a multi-step write (e.g. creating a problem, then answering follow-ups) can land on a different instance and lose the draft. Verified on 15 Nov: the Hindi problem draft disappeared mid-intake. The deployed demo path needs Supabase connected. |
| Supabase auto-setup | Done | On first connection to an empty Postgres, the app creates the schema, the five private storage buckets and the demo data by itself. The SQL is also in `supabase/migrations/20261115000000_init.sql`. |
| Email OTP | Replaced (round 2) | Email + password, no auth emails (decision 58). Old notes: | Uses Supabase Auth (`signInWithOtp` + `verifyOtp` type `email`). Without Supabase the sign-in page shows a friendly "couldn't send a code" message; everyone can still sign in through `/demo`. |
| Gemini key | **Done** (15 Nov) | Added to `.env.local` and Vercel (production, preview, development). Model `gemini-3.5-flash-lite`: tested with structured JSON (~0.5–4 s per call). Rule-based answers remain as the fallback if a call fails. |
| Sarvam key | Missing | Voice input falls back to the browser's own speech recognition (Chrome, Edge, Android Chrome) when the key is missing. |
| Impeccable skill | Not installed | Designed by hand instead. |

## Decisions made on my own
1. **Own session cookie on top of Supabase OTP.** Supabase Auth sends and checks the 6-digit code; then Kadam sets its own signed, httpOnly session cookie (`jose`). All database access stays on the server, `/demo` can sign in seeded accounts without email, and it works the same with or without Supabase.
2. **Server-only database access through a direct Postgres connection.** RLS is enabled on every table with no policies, so the public anon key can read nothing.
3. **Embedded Postgres fallback (PGlite)** so the product runs and deploys before Supabase exists.
4. **File storage**: Supabase Storage private buckets with 10-minute signed URLs when configured; otherwise a private `blobs` table served through `/api/files`, which re-checks access on every request (student IDs: admin only; CVs and problem files: owner only; chat and submission files: the two people in that engagement).
5. **Gemini model** read from `GEMINI_MODEL`, default `gemini-3.5-flash-lite` (current Flash-Lite in Google's model list on 15 Nov 2026; Flash-Lite has the most generous free-tier limits). Google's rate-limit page did not list free-tier models clearly, so this may need changing. Calls use `responseMimeType: application/json` + `responseJsonSchema`, and every result is validated with zod.
6. **Sarvam STT**: `POST https://api.sarvam.ai/speech-to-text`, header `api-subscription-key`, model `saaras:v4` (from `SARVAM_STT_MODEL`), `language_code` from the UI language (e.g. `hi-IN`).
7. **Next.js 16 Cache Components turned off** (the scaffold turned them on). Every page here is per-user and dynamic.
8. **Demo accounts use `@kadam.example` emails** (a reserved domain), so a stray sign-in attempt can never email a real person.
9. **Three seeded students** instead of two: Ananya (verified, empty profile, for the live demo), Rohan (full profile; one engagement In use with 3 impact updates and report v3; one submitted and waiting), and Meera (ID upload waiting in the admin queue so that screen isn't empty).
10. **`/demo` has a "Reset accounts" button** that deletes only `@kadam.example` accounts (and everything that cascades from them) and re-seeds, so the demo can be rehearsed again and again.
11. **The seeded kirana problem is about restocking**, not credit tracking, so the live demo (the owner speaks about udhaar/credit in Hindi) creates a genuinely new problem.
12. **Problem statements are drafted in simple English** when Gemini is available (so students across India can read them) while the follow-up questions are asked in the business's UI language. Without Gemini, the statement keeps the owner's own words (user content stays in its original language).
13. **Intake chats (student and business) are stored with i18n keys** for the rule-based questions, so they show in whatever language the UI is in.
14. **Matching**: Gemini ranks all live problems in one call; the ranking is cached per student and recomputed only when the approved profile or the set of live problems changes. Problems live for under 3 days get a small boost so new problems find their first takers. Without Gemini a transparent rule-based score is used (pathway role match + skill overlap).
15. **Impact report regeneration**: every business update (receipt confirmed, status change, impact update, written feedback) creates a new report version. If Gemini is configured but a call fails, the previous version is kept and a "Try again" button appears; without Gemini a template report is built from the real data (no invented numbers).
16. **Written feedback** is its own small table (`feedback`) because the data model had no place for it, and the context file lists it as a trigger for the report.
17. **"Received" is a required step before setting a status**, matching the lifecycle in 6.5. A business can move Accepted → In use later.
18. **Resubmission**: after "Needs changes" the student can submit again (the engagement goes back to Submitted); the newest submission is the one shown.
19. **Taker count** is derived from engagements (excluding withdrawn), never stored.
20. **Student can re-take a problem after withdrawing** (the same engagement row is reopened).
21. **Job links**: fetched server-side with an 8-second timeout and private-network addresses blocked; results cached in `ai_cache`. If the fetch fails, the link and the student's words are used.
22. **CV reading without Gemini**: a small built-in PDF text extractor (Node's zlib, no extra library) plus a skill lexicon, so the demo CV still produces real skills and pathways.
23. **A sample CV for the live demo** is at `docs/demo/Ananya_Das_CV.pdf` and also downloadable from `/samples/ananya-das-cv.pdf` so the presenter can upload it from a phone.
24. **Admin reviews** show a 72-hour countdown per ID.
25. **Print stylesheet** keeps the report's colours; "Download PDF" opens the browser's print dialog.

26. **Phones**: the Take up card appears right under the fit reason on small screens.
27. **UI translations** (hi, kn, ta, or, bn, gu) written for all 581 interface strings; placeholders and keys validated against English.
28. **Meera (ID check pending) is on the `/demo` list**, so the ID upload and admin review flow can be shown end to end (admin rejects with a note → Meera re-uploads → admin approves).
29. **Roadmaps rebuilt in the style of roadmap.sh** (on request): each roadmap is a visual map with sections, main topics on a central spine and sub-topics branching off; recommended vs optional topics; a drawer per topic with an explainer, free resources tagged Article / Video / Course / Guide / Tool, and Learning / Done / Skip status; a progress bar counting each status; shortcuts (right-click = done, Shift-click = learning, Alt-click = skip); deep links (`#topic-id`); prev/next topic navigation. Kadam's version of roadmap.sh's "Projects" tab is **Real problems**: live Kadam problems for that role, plus "Practise on a real problem" inside each topic. All roadmap content is original. Progress is stored per topic in `roadmap_progress.statuses` (added with a safe `alter table ... if not exists` on start-up). AI-generated roadmaps (for roles without a seeded one) use the same sections → topics → sub-topics shape.
30. **Welcome screen asks "student or business?"** (on request). `/` is a full-screen animated welcome with two choices; the choice is remembered (`kadam_audience` cookie via `/start/student|business`) and leads to a role-specific homepage (`/students`, `/businesses`) and sign-up.
31. **GSAP animation** (`gsap` + `@gsap/react`): an original SVG scene — a lane of small Indian businesses at dawn, a career city behind, Kadam's steps with a student climbing them, glowing lines from shops to the student, floating outcome tags. Pointer parallax on desktop; static for reduced-motion users; floating tags hidden on phones. Scroll reveals, count-up numbers, a scrolling strip of live problems, and a voice-to-draft demo on the business page.
32. **Students use Kadam in English only** (on request). No language switch for students anywhere (homepage, sign-in, app, settings); businesses keep the switch. Enforced on the server: a signed-in student, or a visitor who chose "student", always gets English.

## Test pass (15 Nov, local build)
Verified: take up → chat with a file attachment (download works) → taken_up becomes in_progress on first message → withdraw (chat locks, business notified, taker count drops) · submit → receipt → needs changes with a reason → student sees the reason → resubmit · admin reject with note → student sees it → ID re-upload → pending · admin approve · roadmap for an unseeded role (template, upgraded to AI once a key is set) · roadmap step progress persists · filters + search · close to new students blocks take-up · notifications list and links · settings · server refuses a rejection without a reason.
Fixed: take-up notice no longer shows after withdrawing; chat hides the Live dot when closed.
33. **Fixed: JSON stored as strings on Supabase.** postgres.js JSON-encodes values bound to `jsonb`, so pre-stringified values were stored as JSON strings (the embedded fallback didn't show this). The Postgres adapter now parses parameters the SQL casts to `::jsonb`. Tables were dropped and rebuilt once to fix the stored demo data.
34. **Sign-in asks "Who are you?" first** (student or business), then email, code and name. The role can be changed at any step.
35. **Roadmap catalogue** (`src/db/roadmap-catalog.ts`): about 50 role-based (by stream) and skill-based roadmaps with search, each built from its own key topics; Gemini writes richer ones when the key is set. **roadmap.sh content is not copied** — its license allows personal use only — instead each roadmap links to the matching roadmap.sh page with credit.
36. **Relevant roadmaps on every problem** (student and business problem pages), from the problem's career roles and skills.
37. **Dashboard insights**: large count-up tiles on both dashboards.

## Live demo walk (15 Nov, kadam-virid.vercel.app on Supabase, phone size)
Sharma Kirana types the problem in Hindi → 6 Hindi follow-ups → review (timeline "2 हफ्ते में", retail / tech build / 1–4 weeks) → live. Ananya uploads the sample CV → skills read → 4-question chat → Now: Frontend Developer, Data Analyst · Pivot: UX Designer, Journalist · Stretch: Product Manager → approve. Suggested for you lists the new kirana problem 2nd with a fit reason; skills to brush up and relevant roadmaps show; take up → chat → submit. Sharma confirms receipt → In use → impact update → public report v3 with resume bullets, no email or college shown. Accounts reset afterwards.
38. **Real sign-up fixed and proven live (no demo accounts).** Supabase's Site URL was `http://localhost:3000`, so every email link would have sent real users to a dead page. Set Site URL to `https://kadam-virid.vercel.app` and allowed `https://kadam-virid.vercel.app/**` as a redirect (Supabase dashboard → Authentication → URL Configuration).
39. **Emails carry a link, not a code.** Supabase's built-in sender does not allow template edits (needs custom SMTP), so `{{ .Token }}` cannot be added. The app now treats the link as the main path: sign-in (`/auth/callback`, keeps the chosen role) and college-email verification (`/auth/college`, verifies the signed-in student without logging them in as the college address). The 6-digit code box remains under "Have a code instead?" for when SMTP is added.
40. **Offline categoriser rebuilt** (`src/lib/ai/heuristics.ts`) after a live test mis-labelled "sell pickles online on Instagram" as Tech build. Stem keywords in English and Hindi, problem/outcome weighted over context, a second area adds roles and skills, titles taken from the sentence stating the need. `node scripts/test-heuristics.ts` checks four realistic cases (all pass).
41. **Count-up numbers can't stall**: they fall back to the real value after 2.5 s if the animation didn't run.
42. **QA tooling**: `scripts/qa-link.mjs` creates the exact sign-in link Supabase would email (no email sent) for end-to-end testing; `scripts/qa-cleanup.mjs` removes `qa.*` accounts.

## Real-account walk (15 Nov, live, no /demo)
New student (non-college email) → email link → role kept → name + consent → college details → college-email verification by link → verified. New business → email link → name + consent → business details → dashboard → posts "pickles online" problem → 6 follow-ups → categorised Marketing & growth → live. Real student takes it up (relevant roadmaps: Digital Marketer, Financial Analyst, Social Media Manager, Excel) → chat → submit → business dashboard shows "Priya Nayak sent a solution" → receipt → In use → impact update → public report v3 with resume bullets. All QA accounts deleted afterwards.
43. **Gemini live.** Each call logs `[gemini] ok|failed · <feature>` so live logs show whether a screen got a real AI answer (fallbacks are otherwise silent). "Thought" parts are skipped; output limit raised to 8,192 tokens so long roadmaps aren't cut off.
44. **CV reading made fast**: sending the PDF file took ~30 s; when text can be extracted locally it is sent as text instead (file only for photos/scans). AI pages get `maxDuration = 60`.
45. **Prompt fixes from live testing**: the intake guide must not repeat a question; pathway reasons address the student as "you"; report skills come from what the student actually did, not the problem's wish list.

## Live AI walk (15 Nov, after adding the key)
Hindi kirana problem → Gemini asked 4 relevant Hindi follow-ups (current method, desired outcome, phone/budget/timeline, data to share) → drafted an English statement "Build a Simple Digital Khata App for Kirana Store" (tech build; Software Developer, Frontend Developer, Business Analyst). Ananya's CV read accurately → adaptive intake → pathways with evidence (fest sales analysis, canteen app, newsletter) → the new problem ranked #1 in Suggested with an AI reason → AI skill gaps (Android, quick-entry UI, Hindi/Odia, storage) → take up → submit → In use → AI impact report v3 (summary, 4 measurable outcomes, 4 resume bullets). AI roadmap for DevOps Engineer: 3 sections, 16 topics, real resources. All Gemini calls in the window succeeded. Accounts reset afterwards.

## Conflicts resolved
1. **Connectors**: the prompt said Supabase and Vercel connectors were available; neither was attached to this session. Used the Vercel CLI (logged in) for Vercel, and built a self-bootstrapping Supabase path plus an embedded-Postgres fallback for the database.
2. **"Two student profiles" (section 9) vs. a non-empty admin queue**: seeded a third student whose only data is a pending ID upload.

## Manual steps for the team
See the final report (and README) — Supabase connection, OTP email template, Gemini and Sarvam keys.

## Visual restyle (16 Nov): tactile, friendly design system
Design inspiration from brilliant.org's interaction style (tokens read from its public CSS: palette structure, radii, spacing, and the "solid darker edge" pressable button). Nothing copied: no text, images, icons, fonts or brand colours. Kadam keeps its own identity (saffron primary, warm paper, Nunito headings). Full spec in `DESIGN.md`.
- Visual changes only: `globals.css` tokens and utilities (`btn-*` with a 4 px solid edge that presses down, `card` with 2 px border and bottom edge, 52 px inputs, chips), Nunito for headings, saffron tuned to `#f5a025`, darker `ink-3` and `leaf` for AA contrast, Welcome cards given the same pressable edge, eyebrow colour now overridable on dark sections.
- No routes, behaviour, copy or i18n strings changed.
- Checks: `tsc --noEmit` and `eslint` clean; walked student and business screens at 375 px and 1280 px; business dashboard, new problem and settings checked at 360 px in all seven languages with no horizontal overflow.
- Note: `docs/Kadam_Build_Prompt.md` is not in the repo; the demo path in `docs/Kadam_Context_Final.md` (section 10) was used.


## Round 2 (17 Nov): update brief, sections 0–12

Pulled 4 teammate commits first (restyle and DESIGN.md, second Gemini key, intake fix, demo fallback). Line endings in `src/` were normalised to LF (several files had mixed CRLF/LF).

### Decisions made on my own (round 2)
46. **Tagline is "Take your first step."** and the brand line is "Kadam. Take your first step." It replaces the old tagline in the page title, Open Graph metadata, both homepages, the welcome screen, footers, README and the context file. Translated for the seven business-facing languages (Hindi: "अपना पहला कदम उठाइए।"). The `<LockUp>` component in `src/components/Logo.tsx` pairs the logo and tagline, with the tagline in `<Highlight>`.
47. **Indigo + coral palette, semantic token names.** `saffron` became `primary` (indigo #4338CA, white text, edge #2E2690, text shade #3730A3). `paper` became `canvas`, `sand` became `mist`, `clay` became `alert`, `leaf` became `success` (with `success-ink` #15803D for text and solid fills), and `indigo` became `info`. New tokens: `highlight` (coral #FF6B4A, fills and borders only), `highlight-deep` (#B4321A, coral text that passes AA), `highlight-soft`, `glow` (#818CF8) and `amber`. The eyebrow accent is the darker coral. A one-off script renamed every class; nothing named "saffron" turned coral. Contrast pairs were checked numerically (see DESIGN.md).
48. **No dark backgrounds anywhere.** The welcome screen, both homepage heroes, the "How it works" and "What students can help with" sections, the final CTAs, footers, the report header, the student "next step" card, the workspace report teaser and the dashboard insight tiles are all light now. Small dark fills (selected pills, chat bubbles, avatars, step numbers) became indigo with white text. The GSAP scene was recoloured to a daytime palette: a pale sky, white shops with coloured awnings, indigo steps with a coral top step, and periwinkle links.
49. **`<RoleTrail>`** (`src/components/motion/RoleTrail.tsx`) runs on `/`, `/students` and `/businesses`, built exactly to the brief:
    - **Spawn rule:** a pill appears only after 90 px of movement and 80 ms since the last one, with at most one check per animation frame.
    - **Pool and look:** a pool of 12 elements, with the oldest recycled when needed. Every 4th pill is coral. Each pill gets a random tilt of ±8°.
    - **Animation:** in 150 ms, hold 400 ms, fade out 900 ms, using the Web Animations API with transform and opacity only.
    - **Input:** passive listeners that never call preventDefault. A tap creates one pill. Listeners detach while the hero is off-screen.
    - **Reduced motion:** four still pills at the edges.
    - **Measured locally:** at most 12 pills on screen, all gone 1.6 s after the pointer stops, and `pointer-events: none` on the layer.
    - **Role names:** from `taxonomy.ts` plus the 8 new roadmap roles, shuffled with no repeats until the list is used up.
50. **`<WordMarquee>`** (`src/components/motion/WordMarquee.tsx`) uses CSS keyframes only.
    - **Loop:** each row holds two identical halves, each built from 4 repeats of its words (at 128 px that is wider than two screens). The track animates `translateX(0 → -50%)`, so the loop is seamless. The rows run left, right, left at 40 s, 50 s and 45 s.
    - **Hover:** slows a row to a quarter speed using `playbackRate`, on hover-capable devices only.
    - **Accessibility:** the band is `aria-hidden`, and an `sr-only` sentence carries the same messages.
    - **Copy:** the `/businesses` words are translated into all seven languages.
51. **`<MotionPauser>`** (in the root layout) pauses every CSS animation that is off-screen by adding `.anim-off` through an IntersectionObserver. Hidden tabs are already paused by the browser. The GSAP scene pauses its own loops with an IntersectionObserver.
52. **Floating role tags** reuse the scene's outcome chips: 4 tilted role pills (Data Analyst, UX Designer, Content Writer, Operations), down from 5 outcome chips.
53. **`<Highlight>` and `<HighlightPill>`** (`src/components/motion/Highlight.tsx`):
    - **Look:** an indigo → violet → dark-coral gradient (the dark end keeps contrast), a shimmer pseudo-element that moves with transform only, a soft periwinkle drop-shadow glow, and three sparkles on hover.
    - **Where it's used:** the tagline lock-up, "Suggested for you", AI fit reasons (role pill), the first two outcome numbers in the impact report, and the final CTAs. That keeps to one or two per screen.
54. **Fit reasons are split into parts, not string-matched** (`src/lib/reason.ts`).
    - **Rule-based reasons:** `now|role|skills`. The translated template is split at its `{role}` placeholder.
    - **AI reasons:** `matchProblems` now also returns `tier` and `role`, stored as `ai|tier|role|sentence`. The match cache key moved to `:v4`.
    - **Display:** both kinds show a coloured path chip (Now green, Pivot indigo, Stretch coral) and the role as a highlighted pill with a step-path icon.
55. **"New" badge**: problems that went live within 7 days, with a coral pulse. It shows on student problem cards, the student and business problem pages, and the business dashboard. There is also a "New this week (n)" filter chip.
    - Publishing already sets `live_at`. An upgrade statement backfills `live_at` for any live or closed problem that lacks one.
    - The seed puts 4 problems inside the window (1, 2, 4 and 6 days before seeding), relative to seed or reset time.
56. **Taker dot.** 0 takers shows a pulsing green dot with "Be the first". 1–2 show amber and 3 or more show red, each next to the existing count label and avatars (indigo, periwinkle, coral). The label always states the count.
57. **Animated card glow** (`.glow-card`) on problem cards, pathway cards, roadmap tiles, dashboard insight tiles, the business problem list, the welcome cards and the impact report header and summary.
    - **How it works:** a blurred indigo, periwinkle and coral wash, moved with transform only and offset per card through `--glow-delay`. It is stronger on hover or tap.
    - **Readability:** the wash sits under the content inside an isolated stacking context, so text is never covered.
58. **Login is email + password; Kadam sends no auth emails** (this replaces decisions 38–39 for sign-in).
    - **Sign-up:** `auth.admin.createUser({ email_confirm: true })` with the service key, then `signInWithPassword`, then Kadam's own session cookie (decision 1). The "Who are you?" and name + consent steps are kept.
    - **Removed:** `/auth/callback` and `/auth/college` and the code/link UI. "Forgot password" is hidden.
    - **Existing email:** an address that already exists gets a friendly "sign in instead" with a one-tap switch.
    - **Old link-only accounts:** a wrong password on a known address explains that link-only accounts have no password yet.
    - **To switch email flows back on later:**
      1. Add custom SMTP in Supabase (Authentication → Emails → SMTP settings).
      2. Edit the templates.
      3. Add a "Forgot password" link that calls `resetPasswordForEmail` with a redirect to a `/auth/reset` page that calls `updateUser({ password })`.
      4. Optionally re-add email confirmation by switching `email_confirm` to false.
59. **Student verification:** any properly formatted email entered as the college email verifies the student at once. No email is sent and the `isAcademicEmail` rejection is gone. ID upload stays as an optional alternative, so the admin queue still works. The banner and the take-up lock now say "Add your college email".
60. **Admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.** These are set in `.env.local` and on Vercel for Production, Preview and Development. `ensureAdmin()` (`src/lib/admin-account.ts`) creates or updates the Supabase user and the `users` row with role `admin`. It runs once per server instance, on the first sign-in attempt with that email. The values exist only in environment variables, never in code, seed data, docs or logs.
61. **First impact report builds at once.** The Gemini work below bundles business updates into one regeneration every 2 minutes. To keep the live demo snappy, the first version (when no report exists yet) is generated straight away (leading edge). Later updates in the window are bundled (trailing edge).
62. **FAQ tabs** (Students / Businesses) on both homepages, with our own 10 Q&As from the context file in all seven languages. The **"Pick what you enjoy → see your paths"** widget on `/students` uses a fixed local mapping with no AI call.
63. **Top strips** above the navigation: "Are you a business? Post a real problem →" on `/students` and "Are you a student? Find a real problem →" on `/businesses` (translated).
64. **New taxonomy roles** so role titles resolve: Backend Developer, Full Stack Developer, Sales & Business Development (`sales-executive`) and HR / People Operations (`hr-executive`). The four heuristic tests still pass.
65. **i18n patches** go through `scripts/merge-i18n.mjs`, which merges `docs/notes/i18n-*.json`, checks placeholders against English and fills any missing key with English. 85 keys were merged with 0 problems. Student-only text is English only (decision 32).

### Verified locally (17 Nov, laptop 1440×900 and phone 390×844)
- **Light theme:** the welcome and both homepages have no dark backgrounds (checked by script) and no horizontal scroll on the phone.
- **Hindi:** the business page shows the tagline, word rows, FAQ and strip in Hindi.
- **Role trail:** limits measured as in decision 49.
- **Word rows:** the three rows slide left, right, left.
- **Real QA sign-up:** create account → name and consent → onboarding → college details → a gmail address verifies instantly, and no email is sent.
- **Errors:** a duplicate email shows the friendly message.
- **Admin:** signs in and lands on the ID queue with the Gemini usage counter.
- **Rohan's problem list:** shows New badges, taker dots and AI reasons with path chips and role pills.
- **Roadmaps:** the new backend roadmap renders with its intro and level legend.

### roadmap.sh study
Studied 17 Nov 2026: roadmap.sh /frontend, /backend, /full-stack, /product-manager, /data-analyst, /ux-design, and the public repo's contributing guide (github.com/nilbuild/developer-roadmap, formerly kamranahmedse/developer-roadmap). We took **structure only**. No text, topic lists or resource lists were copied, because the content licence allows personal use only. We link to roadmap.sh with credit.

#### What we learned

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

#### Confirmed roadmap.sh slugs (curl, HTTP status, 17 Nov 2026)

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

### Roadmaps: model, UI and the 8 rewritten roadmaps
Notes for the build log. Numbering is local, so renumber when merging.

1. **Studied roadmap.sh for structure only** (`docs/notes/roadmaps-study.md`). Nothing was copied, because its content licence allows personal use only. We kept the ideas of a spine of ordered sections, branching sub-topics, a three-level legend, a drawer with typed free resources, Done / In progress / Skip, and the role vs skill split. We added three things roadmap.sh doesn't have: why each topic matters, time estimates, and a small practice task per topic.
2. **roadmap.sh credit links only for slugs that return 200.** Checked with curl on 17 Nov 2026. The list is in `CONFIRMED_RSH` (`src/db/roadmaps-data.ts`). Links show at the end of each roadmap under "Learn more on roadmap.sh". The `rsh` from code, the catalogue or an AI roadmap is filtered through this list, so a made-up slug never becomes a link. The old link at the top of the page was removed.
3. **Levels: recommended, optional, alternative.** On the map, recommended topics have a solid border, optional ones a dashed border plus an "opt" tag, and alternatives a double border plus a coral "⇄ alt" tag. Because of the tags, the level can be read without relying on the border style. A legend with one-line hints sits above the map. Older data with only `optional: true` still renders through `levelOf`. Non-recommended topics also set `optional: true` so older code keeps working.
4. **Drawer content.** The drawer shows the level and time chips, the explainer, a "Why it matters" box, sub-topics with their time and level, free resources grouped by type (Course, Video, Article, Guide, Tool) with a "Free" label, a "Try this" practice task, and "Practise on a real problem". That last block has problem-type chips linking to `/student/problems?tab=all&type=<type>` (the list already supports `type`) and the matching live problems. Sub-topics use their parent's problem types when they have none.
5. **Resource links: real pages or search URLs only.** Every fixed URL was checked with curl. 200 for most; a few well-known sites refuse bots with 400/403 or timed out, such as Meta Blueprint, WhatsApp Business and the otexts forecasting book, and we kept those. When no single page fits, the link is a YouTube or Google search (`vid()` / `web()`) with `search` set. The drawer then says "Search results for …".
6. **Salary only with a cited source.** We used AmbitionBox's public profile pages and their experience-bucket averages, read 17 Nov 2026. Where AmbitionBox doesn't publish a 0–1 year figure (UX, BA, financial analyst, journalist), we show the 1–3 year average and say so. Each figure links to its page with a note that pay varies by city, company and skills.
7. **The 8 base roadmaps were rewritten** to 4–6 sections each, each with an intro block. Every top-level topic has an explainer, why it matters, a level, a time estimate, 2–4 free resources, a practice task and problem types. Every sub-topic has an explainer, a level and a time. **All earlier topic ids were kept**, so saved progress and the seeded demo progress still match. New topics have new ids, for example `da-metrics`, `fe-web`, `dm-copy`, `ux-journey`, `cw-research`, `ba-root`, `fa-ratios` and `jn-sources`.
8. **Hand-written roadmaps are read from code, not the database.** `getRoadmap` checks `seededRoadmap(role)` first and never calls AI for those roles. Edits to the data therefore show up without a reseed, along with the new `intro` and `rsh` fields. The roadmap list and the "relevant roadmaps" cards also count topics from code for these roles.
9. **AI roadmaps are cached permanently.** A stored row (any source except `template`) is always returned as it is. Old flat-list rows are no longer regenerated; they are upgraded on read by `normalizeSections`. The insert is `on conflict do nothing`, so the first cached version is never overwritten. Template fallbacks (when there's no AI key or AI fails) are still not stored, so the AI version can replace them later. If a generated roadmap carries the new optional `intro` / `rsh`, they are stored inside `steps` and read back.
10. **UI text on roadmap pages is plain English.** These pages are for students only, and students use English (decision 32). Strings shared with business pages are unchanged, so no new i18n keys were needed.
11. **Accessibility and motion.** Node labels state the status, level and time. External links say "(opens in a new tab)" to screen readers. Hover lift and the pulse dot respect `prefers-reduced-motion`. The tab pills moved from `bg-ink` to `bg-primary`. Colours are tokens only, on the light theme.

### Roadmaps: 8 new roadmaps and richer catalogue
#### What was added
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

#### Decisions
- **Slugs reuse existing catalogue/taxonomy slugs** so progress, matching and the catalogue line up: "Operations Associate" uses `operations-analyst` (title "Operations Associate / Analyst"), "Sales & Business Development" uses `sales-executive`, "HR / People Operations" uses `hr-executive`.
- `backend-developer`, `full-stack-developer`, `sales-executive` and `hr-executive` are not in `taxonomy.ts` `ROLES` (not my file). `roleTitle()` falls back to title-casing the slug ("Hr Executive", "Sales Executive"). Suggest adding them to `ROLES` with titles matching the catalogue.
- **No salary ranges.** No public source could be confirmed from here (salary sites block automated checks), so `intro.salary` is omitted everywhere, as the spec allows.
- **Resources:** only well-known sites. Every direct URL (151) was checked with curl and returns 200; redirected URLs were replaced with their final address. Where no single page fit, a YouTube or Google search URL is used with `search` set. Sites that block bots (Adobe helpx, Behance, ASQ, Inkscape, Coolors) were left out in favour of verified alternatives (Photopea, GIMP, draw.io, Investopedia).
- **roadmap.sh:** checked with curl. 200: backend, full-stack, product-manager, frontend, android, data-analyst, ai-data-scientist, ai-engineer, devops, cyber-security, computer-science, qa, ux-design, git-github, python, sql, javascript, react, prompt-engineering (plus nodejs, api-design, system-design, design-system, data-engineer, machine-learning, linux, docker, typescript, postgresql-dba, mongodb, bi-analyst, technical-writer, kotlin, java, software-design-architecture, mlops, html, css, engineering-manager, devrel). 404: graphic-design, marketing. Every `rsh` already in the catalogue exists; none were removed. No roadmap.sh content was copied.
- Non-recommended topics also set the old `optional: true` flag so older UI paths still dim them.

#### Catalogue (`src/db/roadmap-catalog.ts`)
New optional fields on `CatalogItem` (`topics` kept and still filled, flattened from sections):
- `sections?: { title: string; topics: string[] }[]`: ordered outline for the AI prompt.
- `optional?: string[]`: topic names (exact strings from `topics`) that are nice-to-have; everything else is core.
- `level?: "beginner" | "intermediate" | "advanced"`: how hard the role/skill is to start from zero (matches `DIFFICULTIES`).
In the source a topic ending in `?` inside a section is optional; the `build()` helper strips the `?` and fills `optional`.
All 32 entries without a hand-written roadmap now have 3–4 sections and 7–14 topics; all 48 entries have `level`. Entries with a hand-written roadmap keep a short `topics` list only.

### Gemini: calls cut to the minimum (see docs/GEMINI_USAGE.md)
Numbered so they can be merged into docs/BUILD_LOG.md after decision 45.

1. **Model stays `gemini-3.5-flash-lite`.**
   - Google's models page lists it as Stable and recommends "Gemini 4 Hydrogen or 3.5 Flash-Lite" for new projects.
   - The pricing page shows it free on the Standard tier, and `gemini-2.5-flash` routes to it from 1 Dec 2026.
   - Per-model free RPD is no longer printed on the public rate-limit page (it points to AI Studio). Public summaries give 3.5 and 3.1 Flash-Lite the same RPD, so no other Lite model has a higher free limit.
2. **`GEMINI_API_KEY_2` helps only from another Google Cloud project.** "Rate limits are applied per project, not per API key."
3. **One gateway: `geminiCall()`.** Every request takes a slot from a shared limiter. The default is 8 per minute, set with `GEMINI_RPM`.
   - The limiter is a per-minute row in the new `ai_usage` table. One atomic upsert takes the slot and adds 1 to the feature's daily counter, so it holds across Vercel instances at one database round trip per call.
   - A call over the limit waits up to about 12 s and then counts as busy.
   - If the database errors, an in-memory counter is used.
4. **429 or 503: try the second key, then wait (Google's `retryDelay`, 1.5–8 s) and retry once, then report busy.**
   - A schema mismatch is no longer retried without the schema.
   - The business intake's extra retry runs only after a bad answer, not after a rate limit.
5. **Busy fallbacks are friendly.**
   - Pathways, skill gaps, the impact report and roadmaps show "AI is busy, showing your last result. Try again in a minute." with **Try again** (`src/components/AiBusyNotice.tsx`, `src/app/actions/ai.ts`).
   - Chat actions return `aiBusy: true` when the reply came from the fixed question list because of a rate limit.
6. **The CV reading writes the first intake question in the same call** (`readCv`). Local text extraction still comes first; the file is sent only for photos and scans.
7. **Student intake: at most 4 questions in total**, and a question may ask two related things.
   - The model can mark a question `final`. After the 4th answer, or a `final` one, the question call is skipped.
   - `finishIntake()` writes the summary **and** the pathways in one call.
   - "Build my profile now" does nothing if pathways already exist (and takes a lock). Pathways are built exactly once per finished intake.
8. **Business intake: at most 4 follow-ups.** The model must stop as soon as the problem, current process, desired outcome and timeline are known.
   - A question marked `final` (or the 4th) sends the next answer straight to the draft.
   - The rule-based list is not cut short once it has started (it costs no AI calls).
   - The attached file goes with the first question and the draft only.
9. **Skill gaps are cached per student–problem pair** (`gap:<user>:<problem>`) and reused on every later visit. They are recomputed only if the CV skills or the problem's skills change.
   - A rule-based list caused by a busy AI is marked and retried after 2 minutes or with **Try again**.
10. **Matching recomputes at most once an hour** (`match:<user>:v2`), even when problems go live often.
    - It recomputes immediately only when the approved profile changes.
    - New problems in between are scored by rules and merged in, so they show up at once (with the "new" boost).
11. **Impact reports are coalesced over 2 minutes** without timers.
    - Updates write `report_pending:<id>` (`since` = first update, `last` = latest). Reads of the workspace or the public report show "Updating…" and, once the window has passed, schedule one regeneration with `after()`.
    - A client timer refreshes the page when the window ends.
    - The claim is atomic. The marker is cleared only if no update arrived after the data snapshot, so every update ends up in a report.
    - "Try again" skips the window. Without a key the template report is written at once.
    - Trade-off: the first report version now appears about 2 minutes after the receipt is confirmed, not at once.
12. **Double taps can't double-call.**
    - `SubmitButton` ignores a second click within 1 s or while pending.
    - Server actions take short `lock:` keys in `ai_cache`: CV upload; each intake answer, keyed by turn and text hash; start problem; "Write it up now"; "Build my profile now"; retry pathways.
13. **Smaller prompts.**
    - CV brief instead of the full parsed CV; chats keep the first turn plus the last 8 to 12, trimmed.
    - Job pages are cut to 800 characters; matching sends role slugs and only a problem's type, skills and roles.
    - Report input is trimmed, with `YYYY-MM-DD` dates.
    - Per-call `maxOutputTokens`.
14. **Usage counter on the admin page.** `/admin/verifications` shows today's calls, rate-limited and failed counts per feature, this minute's limiter use, and the last 7 days. Days are Pacific days, because Google's RPD resets at midnight Pacific.
15. **The roadmap generator's output is richer:** per-topic `level`, `why`, `time`, `practice`, `problemTypes` (checked against PROBLEM_TYPES), sub-topic levels, and `intro` (`does`, `firstJobs`, `kadam`).
    - Catalogue `sections`, `optional` and `level` are read defensively from `catalogItem()` when present. They are not there yet.
    - The template fallback keeps catalogue sections when they exist.
16. **Demo walkthrough:** 19 Gemini calls before, 13 worst case and about 10 typical after (counted in docs/GEMINI_USAGE.md).
17. **`scripts/test-ai-limiter.ts`** checks the limiter, the daily counter and the report-coalescing SQL against an in-memory PGlite (13 checks, all pass).

### Chat animations
- Shared keyframes + reduced-motion hook + `tr()` (t() with English fallback until keys merged) in src/components/chat/motion.tsx. Transform/opacity only; reduced motion = fade only, no typewriter.
- AiChatPanel: wrapped action (catches thrown errors -> friendly retry bubble, rethrows NEXT_* redirects), optimistic user bubble, typing dots + pulsing avatar, word-by-word typing for the newest AI turn that arrived after mount, quick-reply chips only if `state.suggestions` is returned (no action returns it yet), `aiBusy` note, send disabled while pending.
- ChatThread: slide-in for messages that appear after first load, optimistic "Sending…"/"Sent" bubble, own bubble now bg-primary.
- New i18n keys in docs/notes/i18n-chat.json (chat.error_friendly, chat.ai_busy, chat.quick_replies, chat.sending, chat.sent); English fallbacks used until merged.

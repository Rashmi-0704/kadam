# Kadam build log

Running log of decisions, conflicts and setup steps. If work is interrupted, resume from **Current stage**.

## Current stage
Build complete and running on Supabase. Full demo path verified on the live URL (phone size). Remaining manual step: switch the Supabase sign-in email template to show the 6-digit code.

Done: stages 1–5 (scaffold, schema, auth, seed, deploy; business side; student side; engagement + impact reports; roadmaps, notifications, admin queue, student dashboard).

## Setup status
| Item | Status | Notes |
|---|---|---|
| Next.js 16.4 (App Router) + Tailwind 4 | Done | `kadam/` |
| Vercel project | Done | `mesa-90a8/kadam` → https://kadam-virid.vercel.app. Linked and deployed with the Vercel CLI (no Vercel connector was available in this session). Env vars set: `SESSION_SECRET`, `DEMO_MODE=true`, `GEMINI_MODEL`, `SARVAM_STT_MODEL` (production, preview, development). |
| Supabase project | **Done** (15 Nov) | Created through the Vercel Marketplace (`kadam-db`, connected to the `kadam` project) after the terms were accepted. Env vars synced to Vercel and `.env.local`. On first connection the app created the schema, five private storage buckets and the demo data. |
| Database until then | Partial (fallback) | With no `POSTGRES_URL`/`DATABASE_URL`, the app runs on an embedded Postgres (PGlite) with the same schema and seed. Locally it persists in `.data/` and the whole demo path works. **On Vercel it is per-instance and temporary**: seeded pages read fine, but a multi-step write (e.g. creating a problem, then answering follow-ups) can land on a different instance and lose the draft. Verified on 15 Nov: the Hindi problem draft disappeared mid-intake. The deployed demo path needs Supabase connected. |
| Supabase auto-setup | Done | On first connection to an empty Postgres, the app creates the schema, the five private storage buckets and the demo data by itself. The SQL is also in `supabase/migrations/20261115000000_init.sql`. |
| Email OTP | Built, not live | Uses Supabase Auth (`signInWithOtp` + `verifyOtp` type `email`). Without Supabase the sign-in page shows a friendly "couldn't send a code" message; everyone can still sign in through `/demo`. |
| Gemini key | Missing | Not in the environment. Every AI feature falls back to saved seed outputs or rule-based answers, so the demo works without it. |
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

## Conflicts resolved
1. **Connectors**: the prompt said Supabase and Vercel connectors were available; neither was attached to this session. Used the Vercel CLI (logged in) for Vercel, and built a self-bootstrapping Supabase path plus an embedded-Postgres fallback for the database.
2. **"Two student profiles" (section 9) vs. a non-empty admin queue**: seeded a third student whose only data is a pending ID upload.

## Manual steps for the team
See the final report (and README) — Supabase connection, OTP email template, Gemini and Sarvam keys.

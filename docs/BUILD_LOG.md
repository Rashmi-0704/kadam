# Kadam build log

Running log of decisions, conflicts and setup steps. If work is interrupted, resume from **Current stage**.

## Current stage
Build complete. Remaining blocker: connect Supabase (one manual click on the Supabase terms, see Manual steps). All 7 UI languages done.

Done: stages 1–5 (scaffold, schema, auth, seed, deploy; business side; student side; engagement + impact reports; roadmaps, notifications, admin queue, student dashboard).

## Setup status
| Item | Status | Notes |
|---|---|---|
| Next.js 16.4 (App Router) + Tailwind 4 | Done | `kadam/` |
| Vercel project | Done | `mesa-90a8/kadam` → https://kadam-virid.vercel.app. Linked and deployed with the Vercel CLI (no Vercel connector was available in this session). Env vars set: `SESSION_SECRET`, `DEMO_MODE=true`, `GEMINI_MODEL`, `SARVAM_STT_MODEL` (production, preview, development). |
| Supabase project | **Blocked — needs one click from a person** | No Supabase connector was available, and the Supabase CLI is not logged in. Provisioning through the Vercel Marketplace (`vercel integration add supabase`) stops at "accept Supabase terms in the browser". See Manual steps. |
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

## Test pass (15 Nov, local build)
Verified: take up → chat with a file attachment (download works) → taken_up becomes in_progress on first message → withdraw (chat locks, business notified, taker count drops) · submit → receipt → needs changes with a reason → student sees the reason → resubmit · admin reject with note → student sees it → ID re-upload → pending · admin approve · roadmap for an unseeded role (template, upgraded to AI once a key is set) · roadmap step progress persists · filters + search · close to new students blocks take-up · notifications list and links · settings · server refuses a rejection without a reason.
Fixed: take-up notice no longer shows after withdrawing; chat hides the Live dot when closed.

## Conflicts resolved
1. **Connectors**: the prompt said Supabase and Vercel connectors were available; neither was attached to this session. Used the Vercel CLI (logged in) for Vercel, and built a self-bootstrapping Supabase path plus an embedded-Postgres fallback for the database.
2. **"Two student profiles" (section 9) vs. a non-empty admin queue**: seeded a third student whose only data is a pending ID upload.

## Manual steps for the team
See the final report (and README) — Supabase connection, OTP email template, Gemini and Sarvam keys.

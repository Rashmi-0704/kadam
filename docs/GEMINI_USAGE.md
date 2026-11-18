# Gemini usage in Kadam

Kadam uses one Gemini model on the free tier and keeps the number of calls as low as it can without losing a feature.
Every call goes through `geminiCall()` in `src/lib/ai/gemini.ts`, which handles the shared limiter, the usage counter, the retry after a rate limit and the fallback.

## Model

- **Model:** `gemini-3.5-flash-lite` (the default in `src/lib/env.ts`; you can override it with `GEMINI_MODEL`).
- **Why this model (checked 17 Nov 2026):**
  - Google's models page lists `gemini-3.5-flash-lite` as **Stable**.
  - The same page says "For any new projects, use our latest models: Gemini 4 Hydrogen or 3.5 Flash-Lite", so 3.5 Flash-Lite is the recommended Lite model.
  - The pricing page marks it "Free of charge" on the Standard tier.
  - `gemini-2.5-flash` will route to `gemini-3.5-flash-lite` from 1 Dec 2026.
  - The other Lite models: `gemini-3.1-flash-lite` is also stable and free. `gemini-2.5-flash-lite` is available only to users who used 2.5 before. `gemini-3.1-flash-lite-preview` has been shut down.
- **Free-tier daily limits:** Google's public rate-limit page no longer prints free-tier RPM/RPD per model. It points to AI Studio ("View your active rate limits in AI Studio"). Third-party summaries give the same RPD for 3.5 and 3.1 Flash-Lite, so no other Lite model has a higher free daily limit. To see the exact numbers for this project, open AI Studio → Rate limits.
- **Daily reset:** "Requests per day (RPD) quotas reset at midnight Pacific time." The admin counter uses the Pacific day for the same reason.
- **No non-Lite models and no other provider.**

### GEMINI_API_KEY_2

Google's rate-limit page says: "Rate limits are applied per project, not per API key." So a second key gives more quota **only if it was created in a different Google Cloud project**. A second key from the same project shares the same RPM and RPD and only helps when the first key itself is rejected (for example, revoked).

When the first key gets a 401, 403, 429, 500 or 503, the second key is tried. Each try takes its own limiter slot and counts as a call.

## Shared limiter, retry and fallback

- **Limiter:** at most `GEMINI_RPM` calls per clock minute across the whole app (default **8**). The counter is one row in the `ai_usage` table (`bucket = 'm:<UTC minute>'`, `feature = '*'`).
  - One atomic `INSERT … ON CONFLICT DO UPDATE … WHERE calls < limit`, so all Vercel instances share it.
  - The same query also adds 1 to the feature's daily count, so the limiter costs one database round trip per Gemini call.
  - A call over the limit waits in 2.5-second steps for up to about 12 seconds, then gives up. The caller treats that as "busy".
  - If the database is unreachable, an in-memory counter (per instance) is used so AI is never blocked by a database hiccup.
- **Rate limits (429 or 503):** after trying the second key, the call waits once and retries once. The wait is Google's `retryDelay` when it is given, kept between 1.5 and 8 seconds. If it fails again, the result is `busy: true`.
- **Fallback:** callers keep the last good result, or use their rule-based answer, and show **"AI is busy, showing your last result. Try again in a minute."** with a **Try again** button. This appears on pathways, skill gaps, the impact report and roadmaps. Chat turns return `aiBusy: true` so the chat can show a friendly bubble. Users never see a raw error.
- **Usage counter:** `ai_usage` rows `d:<Pacific day>` × feature hold `calls`, `limited` (429, 503, or limiter full) and `failed` (bad answer, network). They are shown on **/admin/verifications → Gemini usage** (today per feature, this minute's limiter use, and the last 7 days).
- **Double taps:** `SubmitButton` ignores a second click within 1 second and while pending. The server actions take a short lock in `ai_cache` (`lock:<action>:…`), so a resent form never makes a second call. Locks cover CV upload, each intake answer (student and business), starting a problem, "Write it up now" and "Build my profile now".

## Every Gemini call

| Function (feature) | Called from (file → action or page) | Trigger | Calls per user action | Cached, and for how long | When it fails |
|---|---|---|---|---|---|
| `readStudentId` (read_id), round 4: reads **college, course and year** from a student ID photo or PDF | `src/app/actions/student.ts` → `uploadAndReadId` (onboarding) | Student uploads an ID | **1 per upload**, at most 3 per student per day, and a lock so a double tap runs it once. The file is sent inline the same way `readCv` sends scans. Never asks for the name, ID number, date of birth, address or photo. | Not cached: the student confirms the three fields and they're saved on the profile. Extracted values are never logged. | Empty editable fields with "We couldn't read your ID automatically." Also used when the model says the file doesn't look like a student ID. |
| `readCv` (cv): reads the CV **and writes the first intake question** | `src/app/actions/student.ts` → `uploadCv` | Student uploads or pastes a CV | 1. Text is extracted locally first; the file itself is sent only for photos and scans with no readable text. | Stored in `student_profiles.cv_parsed` until the student uploads again or starts over | Rule-based skill lexicon; the first question comes from the fixed list (`intake.q1`) |
| `intakeNext` (intake) | `student.ts` → `answerCareerIntake` | Each intake answer | 1 per answer, **at most 3** (questions 2–4). Skipped after the 4th answer, or when the model marked its last question `final`. | Transcript stored on the profile | Next fixed question (`intake.q2–q4`); the result carries `aiBusy: true` on a rate limit |
| `finishIntake` (pathways): pathways, plus the summary when needed | `student.ts` → `answerCareerIntake` (last answer) or `finishCareerIntakeNow` ("Build my profile now"); `actions/ai.ts` → `retryPathways` | Intake finished | **Exactly 1 per finished intake.** "Build my profile now" does nothing if pathways already exist (plus a lock). | `student_profiles.pathways` until restart or a new CV | Rule-based pathways. If the AI was busy, a `busy:pathways:<user>` flag shows the notice and **Try again** (1 call). |
| `matchProblemsEx` (match) | `src/lib/matching.ts` → `suggestions()`, used by `/student/problems` and the problem page | Opening Suggested or a problem page | 0 if cached, 1 if not | One entry per student (`match:<user>:v2`). Recomputed when the approved profile changes, or when the live problem set changed **and** the last AI ranking is at least **1 hour** old. Problems that went live in between are scored by rules and merged in at once. | Rule-based ranking. A busy fallback is retried after 2 minutes. |
| `skillGapsEx` (gaps) | `matching.ts` → `gapsFor()`, used by `/student/problems/[id]` | Opening a problem | 1 on the first visit to that problem, then 0 | One entry per student–problem pair (`gap:<user>:<problem>`), kept for good. Recomputed only if the student's CV skills or the problem's skills change. | The problem's skills the student lacks. The notice and **Try again** clear only the fallback (`actions/ai.ts` → `retrySkillGaps`). |
| `generateRoadmap` (roadmap) | `src/lib/roadmaps.ts` → `getRoadmap()`, used by `/student/roadmaps/[role]` | Opening a role or skill **without a hand-written roadmap** | 1 the first time, then 0 | Stored in the `roadmaps` table for good (roadmaps.ts) | A template built from the catalogue (not stored, so a later visit tries again). The page shows the notice and **Try again**. |
| `problemIntakeNext` (pintake) | `src/app/actions/business.ts` → `startProblem` and `answerIntake` | Business submits a problem, then each answer | 1 per turn, **at most 4 follow-ups**. Stops as soon as the problem, current process, desired outcome and timeline are known (`final` flag or `done`). One extra try only after a bad answer, not after a rate limit. | `problems.intake` | Fixed question list (`pintake.*`); `aiBusy: true` |
| `draftProblem` (draft) | `business.ts` → `nextStep` (end of intake) and `finishIntakeNow` | Intake finished, or "Write it up now" | 1 (locked against double taps) | `problems.*` fields; the owner edits them on Review | Owner's own words mapped to fields, plus the rule-based categoriser |
| `impactReportEx` (report) | `src/lib/engagement.ts` → `regenerateReport()`. Started by `queueReport()` (receipt, status, impact update, feedback) and `reportState()` (workspace and public report page); `actions/engagement.ts` → `retryReport` | Business updates | **1 per 2-minute window**, however many updates are posted | `impact_reports` versions, kept for good | Keeps the last report; the notice and **Try again**. With no report yet, a template report built from the real data. |

Not Gemini: `src/lib/jobs.ts` fetches job pages (plain HTTP, cached in `ai_cache` as `job:<url>`).

### How the impact report coalescing works (serverless, no timers)

1. Each business update writes `report_pending:<engagement>` = `{since: first update, last: latest update}`. The first update starts the window; later ones only move `last`.
2. Any read of the report (student or business workspace, or the public `/reports/<token>`) checks the window.
   - While it is open, the page shows **"Updating…"**. A small client timer refreshes the page when the window ends and every few seconds after that.
   - Once 2 minutes have passed since `since`, the read schedules **one** regeneration with `after()`, which runs after the response is sent.
   - A business update after the window has ended triggers the same flush.
3. The claim is a single `UPDATE … RETURNING`. Two readers can never both regenerate, and a claim older than 90 seconds counts as abandoned.
4. After generating, the marker is deleted only if no update arrived after the data snapshot. If one did, a new window starts, so **every update ends up in a report**.
5. If the AI is busy, the claim is released and the next automatic try waits one more window. **Try again** (`regenerateReport(id, true)`) skips the window.
6. Without a Gemini key, the template report is written immediately (no AI cost).

`scripts/test-ai-limiter.ts` checks this flow and the limiter against an in-memory PGlite. Run it with `node scripts/test-ai-limiter.ts`.

## One full demo walkthrough (section 10 of the context file and the BUILD_LOG "Live AI walk")

The steps follow the live walk: a Hindi kirana problem with 4 follow-ups → draft → live. A new student adds their ID (round 4: 1 call). Ananya's CV → intake → pathways → approve. Suggested → problem page with skill gaps → take up → chat → submit. Business confirms receipt, sets In use and posts an impact update, all within a few minutes.

| Step | Before | After (worst case) | After (typical) |
|---|---|---|---|
| Business intake | start 1 + 3 answers → questions 2–4 (3) + 4th answer → `done` (1) = **5** | start 1 + 3 follow-ups (3); the 4th answer goes straight to the draft = **4** | 2 questions that each ask two things, the 2nd marked `final` → **2** |
| Draft | **1** | **1** | **1** |
| Student ID (round 4) | — | **1** | **1** |
| CV upload | parseCv 1 + first question 1 = **2** | readCv with first question = **1** | **1** |
| Student intake | Old prompt allowed 4–6 answers; at 5 answers: questions 2–5 (4) + `done` (1) = **5** | questions 2–4 = **3** | 2 (3rd question marked `final`) |
| Pathways | **1** | **1** (also writes the summary) | **1** |
| Suggested (match) | **1** | **1** | **1** |
| Problem page (skill gaps) | **1** | **1** | **1** |
| Impact report (receipt + In use + update) | 3 updates → **3** | all within one 2-minute window → **1** | **1** |
| **Total** | **19** | **14** (13 + the ID reader) | **11** (10 + the ID reader) |

How the "Before" column is counted: the old code made one call per intake turn including the turn that only returned `done=true`, one call for the first question on top of the CV reading, and one report call per business update. Optional extras in the live walk (an AI roadmap for DevOps) are 1 call before and 1 after (cached for good).

**Rate limits made worse before:** a 429 tried key 2 (+1). The business intake then retried every failed turn (+1, or +2 with two keys). A schema mismatch was retried without the schema (+1). Now a 429 gets one wait-and-retry, there's no business-intake retry after a rate limit, and a schema mismatch is not retried. Also, every new problem going live used to re-rank **every** student on their next visit. Now that happens at most once an hour per student.

**Prompts are smaller:**
- Only the CV fields that matter are sent (degrees, skills, short experience lines, interests); no name or contact details.
- Chats keep the first turn plus the last 8 to 12 turns, each trimmed.
- Job pages are cut to 800 characters.
- Matching sends role slugs instead of full rationales, and only a problem's type, skills and roles.
- The business's attached file is sent with the first question and the draft only, not with every follow-up.
- Report input is trimmed and dates are `YYYY-MM-DD`.
- Each call sets `maxOutputTokens` to what it needs (1,024–2,048 for chat, gaps and pathways).

## Further savings for later

1. **Merge the final intake turn with the draft.** When the model marks a question `final`, it could return a provisional draft in the same call. Then the draft call is only needed when the owner adds something new.
2. **Precompute skill gaps when taking up a problem.** Folding them into the match call (top 3 problems) would save one call per problem opened. It makes the match answer longer, though.
3. **Store "AI failed" roadmap templates for a few minutes** (roadmaps.ts, owned by the roadmap agent). At the moment, a busy period causes one retry per page view.
4. **Use the Batch API for non-interactive work.** It is free for `gemini-3.5-flash-lite` on the pricing page; seeded roadmaps and nightly re-ranking could use it.
5. **Use context caching** for the long fixed system prompts (role list, taxonomy) if Google offers it on the free tier for this model.
6. **Pause the AI when the day's quota is used up.** If `calls` in `ai_usage` for today gets close to the AI Studio RPD, switch features to rules until midnight Pacific instead of calling Google and getting 429s.

## Speech-to-text (not Gemini)

- **Provider:** Sarvam AI `saaras:v4` (`SARVAM_STT_MODEL`). It is called from `src/lib/stt.ts` → `transcribe()` through `POST /api/stt` (`src/app/api/stt/route.ts`), with sign-in required.
- **Calls:** 1 Sarvam call per finished voice recording. That covers the business problem starter and the chat voice input.
- **Language:** from the UI language (for example `hi-IN`, via `SPEECH_LOCALE`), otherwise `unknown` so Sarvam detects it.
- **Limits:** audio up to 4 MB; 45-second timeout. Nothing is cached, because each recording is new.
- **Fallback:**
  - Without `SARVAM_API_KEY`, the recorder uses the browser's own speech recognition (Web Speech API, free, runs in the browser; Chrome or Edge on Android and desktop). Interim text is shown live.
  - If Sarvam is configured but a call fails, the route returns 503 and the recorder shows its error state; the user can type instead.
  - Speech-to-text does not use the Gemini limiter or quota.

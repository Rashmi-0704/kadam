# Build-log notes: Gemini on Flash-Lite with the fewest calls (17 Nov)

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

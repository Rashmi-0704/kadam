# Kadam build log

Running log of decisions, conflicts and setup steps. If work is interrupted, resume from **Current stage**.

## Current stage
Stage 1 — scaffold, schema, auth, seed, first deploy.

## Setup status
| Item | Status | Notes |
|---|---|---|
| Next.js 16 (App Router) + Tailwind 4 | Done | `kadam/` |
| Vercel project | Done | `mesa-90a8/kadam`, linked via Vercel CLI (no Vercel connector was available in the session) |
| Supabase project | **Blocked** | No Supabase connector was available, and the Supabase CLI is not logged in. Provisioning through the Vercel Marketplace (`vercel integration add supabase`) stops at "accept Supabase terms in the browser", which only a person can do. See "Manual steps". |
| Database fallback | Done | When no `DATABASE_URL`/`POSTGRES_URL` is set the app runs on an embedded Postgres (PGlite) with the same schema and seed. Locally it persists in `.data/`; on Vercel it lives in `/tmp` per instance (resets on cold start). |
| Gemini key | Missing | Not in the environment. All AI features fall back to saved seed outputs or rule-based answers. |
| Sarvam key | Missing | Voice input falls back to the browser's own speech recognition (Chrome/Edge/Android) when the key is missing. |

## Decisions made on my own
1. **Own session cookie on top of Supabase OTP.** Supabase Auth sends and checks the 6-digit code; after that Kadam sets its own signed, httpOnly session cookie (`jose`). This keeps all database access on the server, lets the `/demo` route sign in seeded accounts without email, and works the same with or without Supabase.
2. **All database access is server-side through a direct Postgres connection.** RLS is enabled on every table with no policies, so the public anon key can read nothing.
3. **Embedded Postgres fallback (PGlite)** so the product runs and deploys before Supabase exists. Same SQL schema (`src/db/schema.ts` → `supabase/migrations/`).
4. **File storage**: Supabase Storage private buckets with signed URLs when configured; otherwise files are stored in a private `blobs` table and served through `/api/files`, which re-checks who is allowed to see them.
5. **Gemini model** read from `GEMINI_MODEL`, default `gemini-3.5-flash-lite` (current Flash-Lite in Google's model list on 15 Nov 2026; Flash-Lite has the most generous free-tier limits). Google's rate-limit page did not state free-tier models clearly — change the env var if needed.
6. **Sarvam STT**: `POST https://api.sarvam.ai/speech-to-text`, header `api-subscription-key`, model `saaras:v4` (read from `SARVAM_STT_MODEL`), `language_code` from the UI language.
7. **Next.js 16 Cache Components turned off** (the scaffold enabled them). Every page here is per-user and dynamic; this keeps the code simple.
8. **Demo accounts use `@kadam.example` emails** (a reserved domain), so a stray sign-in attempt can never email a real person.
9. **Three seeded students** instead of two: Ananya (verified, empty profile — for the live demo), Rohan (full profile, one engagement In use with reports, one submitted), and Meera (ID upload waiting in the admin queue, so the admin screen is not empty).
10. **`/demo` has a "Reset accounts" button** that deletes only `@kadam.example` accounts (and everything that cascades from them) and re-seeds, so the demo can be rehearsed repeatedly.

## Conflicts resolved
_(none yet)_

## Manual steps for the team
_(filled in at the end)_

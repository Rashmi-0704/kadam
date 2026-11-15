# Kadam

**Real Problems, Real Impact, Real Careers.** College students solve real problems for small businesses and NGOs, and Kadam turns the outcome into an impact report they can put on a resume.

- Live: https://kadam-virid.vercel.app
- Quick sign-in for the demo: https://kadam-virid.vercel.app/demo (only when `DEMO_MODE=true`)
- Source of truth: [`docs/Kadam_Context_Final.md`](docs/Kadam_Context_Final.md) · Build decisions: [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000/demo. Without `POSTGRES_URL` the app uses an embedded Postgres in `.data/` with demo data already loaded.

## Environment variables

| Name | Needed for |
|---|---|
| `SESSION_SECRET` | Signing the session cookie (any long random string) |
| `DEMO_MODE` | `true` enables `/demo` quick sign-in and "Reset accounts" |
| `POSTGRES_URL` (or `DATABASE_URL`) | Supabase Postgres. Empty → embedded Postgres fallback |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` (or the `NEXT_PUBLIC_` versions) | Email OTP through Supabase Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Private storage buckets and signed URLs |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | All AI features (falls back to saved/rule-based results without it) |
| `SARVAM_API_KEY`, `SARVAM_STT_MODEL` | Indian speech-to-text for voice problems (falls back to the browser's speech recognition) |

All keys are read on the server only. The app creates its schema, storage buckets and demo data by itself the first time it connects to an empty Supabase database. The SQL is in `supabase/migrations/`.

## Demo path

1. `/demo` → **Sharma Kirana Store** → New problem → Speak (Hindi) → answer follow-ups → Approve and go live.
2. `/demo` → **Ananya Das** → Profile → upload `docs/demo/Ananya_Das_CV.pdf` (also at `/samples/ananya-das-cv.pdf`) → chat → approve paths.
3. Problems → Suggested for you → open the new problem → skills to brush up → Take up.
4. Chat → Submit. `/demo` → Sharma Kirana → open the submission → I've received it → In use → post an impact update → Open impact report (public link, Download PDF).

Use **Reset accounts** on `/demo` to start over.

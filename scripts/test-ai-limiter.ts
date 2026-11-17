// Checks the shared Gemini limiter, the daily counter and the report-coalescing SQL against an in-memory PGlite.
// Run: node scripts/test-ai-limiter.ts
import { PGlite } from "@electric-sql/pglite";
import {
  AI_USAGE_DDL, TAKE_SLOT_SQL, MARK_OUTCOME_SQL, USAGE_DAYS_SQL, TODAY_SQL,
  REPORT_QUEUE_SQL, REPORT_CLAIM_SQL, REPORT_DONE_SQL, REPORT_RELEASE_SQL, REPORT_STATE_SQL,
} from "../src/lib/ai/usage-sql.ts";

const db = await PGlite.create();
await db.exec(`create table ai_cache (key text primary key, value jsonb not null, created_at timestamptz not null default now());` + AI_USAGE_DDL);
const q = async (sql: string, p: unknown[] = []) => (await db.query(sql, p)).rows as Record<string, unknown>[];
let failed = 0;
const check = (name: string, ok: boolean, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` (${extra})` : ""}`);
  if (!ok) failed++;
};

// 1. Limiter: 12 parallel calls with a limit of 8 → exactly 8 slots, and the daily counter counts only those 8.
const results = await Promise.all(Array.from({ length: 12 }, (_, i) => q(TAKE_SLOT_SQL, [8, i % 2 ? "gaps" : "report"])));
const granted = results.filter((r) => r[0].calls != null).length;
check("limiter grants exactly 8 of 12 in one minute", granted === 8, `granted ${granted}`);
const day = await q(USAGE_DAYS_SQL, [7]);
const counted = day.reduce((n, r) => n + Number(r.calls), 0);
check("daily counter counts only granted calls", counted === 8, `counted ${counted}`);
check("daily rows are per feature", day.length === 2 && day.every((r) => ["gaps", "report"].includes(String(r.feature))));
await q(MARK_OUTCOME_SQL("limited"), ["gaps"]);
const lim = (await q(USAGE_DAYS_SQL, [7])).find((r) => r.feature === "gaps");
check("limited counter", Number(lim?.limited) === 1);
const today = await q(TODAY_SQL);
check("this-minute reading", Number(today[0].this_minute) === 8, String(today[0].this_minute));

// 2. Report coalescing.
const key = "report_pending:e1";
await q(REPORT_QUEUE_SQL, [key]);
await q(REPORT_QUEUE_SQL, [key]);
const st = await q(REPORT_STATE_SQL, [key, 120]);
check("pending shows a due time of ~120 s", Number(st[0].due_in) > 110 && Number(st[0].due_in) <= 120, String(st[0].due_in));
check("not claimable before the window ends", (await q(REPORT_CLAIM_SQL, [key, 120, false])).length === 0);
// Pretend the first update was 3 minutes ago.
await q(`update ai_cache set value = jsonb_set(value, '{since}', to_jsonb(now() - interval '3 minutes')) where key = $1`, [key]);
const [c1, c2] = await Promise.all([q(REPORT_CLAIM_SQL, [key, 120, false]), q(REPORT_CLAIM_SQL, [key, 120, false])]);
check("exactly one reader claims a due report", c1.length + c2.length === 1);
const snap = (c1[0] ?? c2[0]).snap;
await q(REPORT_DONE_SQL, [key, snap]);
check("marker removed when no newer update", (await q(`select 1 from ai_cache where key = $1`, [key])).length === 0);

// An update that arrives while the report is being generated is not lost.
await q(REPORT_QUEUE_SQL, [key]);
await q(`update ai_cache set value = jsonb_set(value, '{since}', to_jsonb(now() - interval '3 minutes')) where key = $1`, [key]);
const claim = await q(REPORT_CLAIM_SQL, [key, 120, false]);
const snap2 = new Date(new Date(String(claim[0].snap)).getTime() - 1000); // the data snapshot was taken before the late update
await q(REPORT_QUEUE_SQL, [key]); // late update
await q(REPORT_DONE_SQL, [key, snap2]);
const left = await q(`select value from ai_cache where key = $1`, [key]);
check("late update keeps a pending marker (new window)", left.length === 1 && !(left[0].value as Record<string, unknown>).claimed);

// A failed (busy) attempt releases the claim and waits another window; the retry button (force) can still claim.
await q(`update ai_cache set value = jsonb_set(value, '{since}', to_jsonb(now() - interval '3 minutes')) where key = $1`, [key]);
await q(REPORT_CLAIM_SQL, [key, 120, false]);
await q(REPORT_RELEASE_SQL, [key]);
check("after a failure, not auto-claimable until the next window", (await q(REPORT_CLAIM_SQL, [key, 120, false])).length === 0);
check("retry button (force) claims at once", (await q(REPORT_CLAIM_SQL, [key, 120, true])).length === 1);
check("a second forced claim while running is refused", (await q(REPORT_CLAIM_SQL, [key, 120, true])).length === 0);

await db.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);

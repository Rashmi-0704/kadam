import "server-only";
import { q } from "../db";
import { env } from "../env";
import { TAKE_SLOT_SQL, MARK_OUTCOME_SQL, CLEAN_MINUTES_SQL, USAGE_DAYS_SQL, TODAY_SQL } from "./usage-sql";

/** Features that call Gemini; the name is what the admin page shows. */
export type AiFeature = "cv" | "intake" | "pathways" | "roadmap" | "gaps" | "match" | "pintake" | "draft" | "report";

const WAIT_STEP_MS = 2500;
const MAX_WAIT_MS = 12000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Used only if the database is unreachable, so a DB hiccup never blocks AI. Per server instance.
const mem: { minute: string; n: number } = { minute: "", n: 0 };
function memSlot(limit: number) {
  const m = new Date().toISOString().slice(0, 16);
  if (mem.minute !== m) Object.assign(mem, { minute: m, n: 0 });
  if (mem.n >= limit) return false;
  mem.n++;
  return true;
}

/**
 * Shared limiter: at most env.geminiRpm calls per clock minute across all server instances (a counter row in ai_usage).
 * A call over the limit waits in short steps for up to ~12 s; after that it gives up and the caller shows its fallback.
 * Taking a slot also counts the call for the feature's daily total (same query).
 */
export async function takeSlot(feature: AiFeature): Promise<boolean> {
  const limit = env.geminiRpm;
  const start = Date.now();
  for (;;) {
    let ok: boolean;
    try {
      const rows = await q(TAKE_SLOT_SQL, [limit, feature]);
      ok = rows[0]?.calls != null;
      if (ok && Math.random() < 0.05) await q(CLEAN_MINUTES_SQL).catch(() => {});
    } catch {
      ok = memSlot(limit);
    }
    if (ok) return true;
    if (Date.now() - start + WAIT_STEP_MS > MAX_WAIT_MS) {
      console.warn(`[gemini] limiter: ${limit}/min reached, giving up · ${feature}`);
      return false;
    }
    await sleep(WAIT_STEP_MS + Math.floor(Math.random() * 400));
  }
}

export async function markOutcome(feature: AiFeature, outcome: "limited" | "failed") {
  await q(MARK_OUTCOME_SQL(outcome), [feature]).catch(() => {});
}

export type UsageRow = { day: string; feature: string; calls: number; limited: number; failed: number };

export async function usageByDay(days = 7): Promise<{ rows: UsageRow[]; today: string; thisMinute: number }> {
  try {
    const [rows, now] = await Promise.all([q<UsageRow>(USAGE_DAYS_SQL, [days]), q(TODAY_SQL)]);
    return { rows, today: String(now[0]?.day ?? ""), thisMinute: Number(now[0]?.this_minute ?? 0) };
  } catch {
    return { rows: [], today: "", thisMinute: 0 };
  }
}

import "server-only";
import { createHash } from "node:crypto";
import { q, one } from "../db";

export const shortHash = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 12);

/**
 * "Already running" guard for actions that call Gemini (double taps, two tabs, a re-sent form).
 * Atomically takes `lock:<key>` in ai_cache unless someone took it less than `ttlSec` ago. Returns false if taken.
 * Never blocks: if the database errors, the action runs.
 */
export async function tryLock(key: string, ttlSec = 60): Promise<boolean> {
  try {
    const rows = await q(
      `insert into ai_cache (key, value) values ($1, 'true'::jsonb)
       on conflict (key) do update set created_at = now() where ai_cache.created_at < now() - make_interval(secs => $2::int)
       returning key`,
      [`lock:${key}`, ttlSec],
    );
    return rows.length > 0;
  } catch {
    return true;
  }
}

export async function unlock(key: string) {
  await q(`delete from ai_cache where key = $1`, [`lock:${key}`]).catch(() => {});
}

/** Remembers that a screen is showing a fallback because the AI was busy, so it can offer "Try again". */
export async function setBusyFlag(key: string, on: boolean) {
  if (on) await q(`insert into ai_cache (key, value) values ($1,'true'::jsonb) on conflict (key) do update set created_at = now()`, [`busy:${key}`]).catch(() => {});
  else await q(`delete from ai_cache where key = $1`, [`busy:${key}`]).catch(() => {});
}

export async function hasBusyFlag(key: string) {
  return Boolean(await one(`select 1 from ai_cache where key = $1`, [`busy:${key}`]).catch(() => null));
}

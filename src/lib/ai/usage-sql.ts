// SQL for the shared Gemini limiter, the daily usage counter and the report "pending" marker.
// Pure strings (no server imports) so scripts/test-ai-limiter.ts can run them against PGlite.
//
// Table ai_usage(bucket, feature, calls, limited, failed):
//   bucket 'm:YYYY-MM-DDTHH:MI' (UTC), feature '*'  → app-wide calls in that minute (the limiter)
//   bucket 'd:YYYY-MM-DD' (Pacific time),  feature  → calls per feature that day (Google's RPD resets at midnight Pacific)

export const AI_USAGE_DDL = `
create table if not exists ai_usage (
  bucket text not null,
  feature text not null,
  calls int not null default 0,
  limited int not null default 0,
  failed int not null default 0,
  primary key (bucket, feature)
);
alter table ai_usage enable row level security;
`;

const MINUTE = `'m:' || to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI')`;
const DAY = `'d:' || to_char(now() at time zone 'America/Los_Angeles', 'YYYY-MM-DD')`;

/**
 * Takes one slot in the current minute if fewer than $1 were used, and (only then) counts the call for feature $2 today.
 * One round trip. Returns one row with calls = the slot number, or calls = null when the minute is full.
 */
export const TAKE_SLOT_SQL = `
with m as (
  insert into ai_usage (bucket, feature, calls) values (${MINUTE}, '*', 1)
  on conflict (bucket, feature) do update set calls = ai_usage.calls + 1 where ai_usage.calls < $1
  returning calls
), d as (
  insert into ai_usage (bucket, feature, calls) select ${DAY}, $2, 1 where exists (select 1 from m)
  on conflict (bucket, feature) do update set calls = ai_usage.calls + 1
  returning 1
)
select (select calls from m) as calls, (select count(*) from d)::int as counted`;

/** Adds to the 'limited' (429 / quota / overloaded) or 'failed' column for feature $1 today. */
export const MARK_OUTCOME_SQL = (col: "limited" | "failed") => `
insert into ai_usage (bucket, feature, ${col}) values (${DAY}, $1, 1)
on conflict (bucket, feature) do update set ${col} = ai_usage.${col} + 1`;

/** Old minute buckets are only needed for the limiter; keep 10 minutes. */
export const CLEAN_MINUTES_SQL = `
delete from ai_usage where bucket like 'm:%'
  and bucket < 'm:' || to_char((now() - interval '10 minutes') at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI')`;

/** Per-feature counts for the last $1 Pacific days, newest first. */
export const USAGE_DAYS_SQL = `
select substr(bucket, 3) as day, feature, calls, limited, failed from ai_usage
 where bucket like 'd:%'
   and bucket >= 'd:' || to_char((now() at time zone 'America/Los_Angeles') - ($1::int - 1) * interval '1 day', 'YYYY-MM-DD')
 order by bucket desc, calls desc`;

export const TODAY_SQL = `select substr(${DAY}, 3) as day, (select calls from ai_usage where bucket = ${MINUTE} and feature = '*') as this_minute`;

/* ---------- Impact report coalescing (rows live in ai_cache, key 'report_pending:<engagementId>') ---------- */

/** A business update arrived: start the pending window (keeps the first 'since') and record the latest update time. */
export const REPORT_QUEUE_SQL = `
insert into ai_cache (key, value) values ($1, jsonb_build_object('since', now(), 'last', now()))
on conflict (key) do update set value = ai_cache.value || jsonb_build_object('last', now()), created_at = now()`;

/**
 * Claims the pending report for one regeneration when the window ($2 seconds since the first pending update) has passed,
 * or always when $3 is true (the retry button). A claim older than 90 s counts as abandoned. Returns the snapshot time.
 */
export const REPORT_CLAIM_SQL = `
update ai_cache set value = value || jsonb_build_object('claimed', now())
 where key = $1
   and ($3::boolean or (value->>'since')::timestamptz <= now() - make_interval(secs => $2::int))
   and (value->>'claimed' is null or (value->>'claimed')::timestamptz < now() - interval '90 seconds')
 returning now() as snap`;

/** Done: drop the marker unless an update arrived after the snapshot; then start a fresh window for those. */
export const REPORT_DONE_SQL = `
with del as (
  delete from ai_cache where key = $1 and (value->>'last')::timestamptz <= $2::timestamptz returning 1
)
update ai_cache set value = (value - 'claimed') || jsonb_build_object('since', $2::timestamptz)
 where key = $1 and not exists (select 1 from del)`;

/** The AI call failed: release the claim and wait one more window before trying on a page view (the retry button skips the wait). */
export const REPORT_RELEASE_SQL = `update ai_cache set value = (value - 'claimed') || jsonb_build_object('since', now()) where key = $1`;

/** Pending state for display: seconds until due (<= 0 means due now). */
export const REPORT_STATE_SQL = `
select extract(epoch from ((value->>'since')::timestamptz + make_interval(secs => $2::int) - now()))::float as due_in,
       value->>'claimed' is not null as claimed
  from ai_cache where key = $1`;

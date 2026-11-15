// Removes QA accounts (emails starting with "qa.") from Kadam's tables and from Supabase Auth.
// Usage: node scripts/qa-cleanup.mjs
import fs from "node:fs";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; }),
);
const isQa = (e) => /^qa\./i.test(e ?? "");

const url = new URL(env.POSTGRES_URL); url.search = "";
const sql = postgres(url.toString(), { prepare: false, ssl: "require", onnotice: () => {} });
await sql.unsafe(`update verification_requests set reviewed_by = null where reviewed_by in (select id from users where email ilike 'qa.%')`);
const gone = await sql.unsafe(`delete from users where email ilike 'qa.%' returning email`);
await sql.end();

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
let removedAuth = 0;
for (let page = 1; page < 20; page++) {
  const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
  if (error || !data.users.length) break;
  for (const u of data.users.filter((x) => isQa(x.email))) {
    const { error: e } = await sb.auth.admin.deleteUser(u.id);
    if (!e) removedAuth++;
  }
  if (data.users.length < 200) break;
}
console.log(`removed ${gone.length} Kadam accounts and ${removedAuth} sign-in users`);

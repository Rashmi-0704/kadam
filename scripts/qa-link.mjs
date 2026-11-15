// QA helper: creates the same sign-in link Supabase would email, without sending an email.
// Usage: node scripts/qa-link.mjs <email> <student|business> [base-url]
// Writes the link to .qa-link (git-ignored); never prints keys.
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; }),
);
const [email, as, base = "https://kadam-virid.vercel.app"] = process.argv.slice(2);
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await sb.auth.admin.generateLink({ type: "magiclink", email, options: { redirectTo: as === "college" ? `${base}/auth/college` : `${base}/auth/callback?as=${as}` } });
if (error) { console.error("generateLink failed:", error.message); process.exit(1); }
fs.writeFileSync(".qa-link", data.properties.action_link);
console.log("link written; redirect_to host:", new URL(new URL(data.properties.action_link).searchParams.get("redirect_to") ?? "http://none").host, "| has otp:", Boolean(data.properties.email_otp));

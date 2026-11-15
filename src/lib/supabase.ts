import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let anon: SupabaseClient | null = null;
let admin: SupabaseClient | null = null;

export function authClient() {
  if (!anon) anon = createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return anon;
}
export function adminClient() {
  if (!admin) admin = createClient(env.supabaseUrl, env.supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

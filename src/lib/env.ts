import "server-only";

const pick = (...names: string[]) => {
  for (const n of names) {
    const v = process.env[n];
    if (v) return v;
  }
  return "";
};

export const env = {
  dbUrl: pick("DATABASE_URL", "POSTGRES_URL"),
  supabaseUrl: pick("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: pick("SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  supabaseServiceKey: pick("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"),
  geminiKey: pick("GEMINI_API_KEY"),
  geminiModel: pick("GEMINI_MODEL") || "gemini-3.5-flash-lite",
  sarvamKey: pick("SARVAM_API_KEY"),
  sarvamModel: pick("SARVAM_STT_MODEL") || "saaras:v4",
  demoMode: process.env.DEMO_MODE === "true",
  sessionSecret: pick("SESSION_SECRET") || "kadam-local-development-session-secret",
};

export const hasSupabaseAuth = () => Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const hasSupabaseStorage = () => Boolean(env.supabaseUrl && env.supabaseServiceKey);

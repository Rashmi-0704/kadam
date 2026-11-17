// UI copy for the Gemini-budget features. Keys and translations are in docs/notes/i18n-gemini.json until they are merged
// into the locale files; until then t() returns the key itself, so fall back to the English text here.
export const AI_COPY = {
  "ai.busy_last": "AI is busy, showing your last result. Try again in a minute.",
  "ai.busy_basic": "AI is busy, so this is a simpler version for now. Try again in a minute.",
  "report.updating": "Updating…",
  "report.updating_note": "New updates are being added to the report. It refreshes in about 2 minutes.",
  "admin.ai_title": "Gemini usage",
  "admin.ai_sub": "Calls per feature. The day follows Google's quota day (midnight Pacific time).",
  "admin.ai_today": "Today",
  "admin.ai_minute": "This minute: {n} of {max}",
  "admin.ai_feature": "Feature",
  "admin.ai_calls": "Calls",
  "admin.ai_limited": "Rate-limited",
  "admin.ai_failed": "Failed",
  "admin.ai_none": "No Gemini calls yet today.",
  "admin.ai_week": "Last 7 days",
  "admin.ai_total": "Total",
} as const;
export type AiCopyKey = keyof typeof AI_COPY;

export function aiText(t: (k: string, v?: Record<string, string | number>) => string, key: AiCopyKey, vars?: Record<string, string | number>) {
  const s = t(key, vars);
  if (s !== key) return s;
  let en: string = AI_COPY[key];
  if (vars) for (const [k, v] of Object.entries(vars)) en = en.split(`{${k}}`).join(String(v));
  return en;
}

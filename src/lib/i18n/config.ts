export const LANGS = [
  { code: "en", label: "English", html: "en" },
  { code: "hi", label: "हिन्दी", html: "hi" },
  { code: "kn", label: "ಕನ್ನಡ", html: "kn" },
  { code: "ta", label: "தமிழ்", html: "ta" },
  { code: "or", label: "ଓଡ଼ିଆ", html: "or" },
  { code: "bn", label: "বাংলা", html: "bn" },
  { code: "gu", label: "ગુજરાતી", html: "gu" },
] as const;
export type Lang = (typeof LANGS)[number]["code"];
export const isLang = (v: unknown): v is Lang => LANGS.some((l) => l.code === v);
export const LANG_COOKIE = "kadam_lang";
// Speech-to-text / browser speech language codes.
export const SPEECH_LOCALE: Record<Lang, string> = { en: "en-IN", hi: "hi-IN", kn: "kn-IN", ta: "ta-IN", or: "od-IN", bn: "bn-IN", gu: "gu-IN" };

export type Dict = Record<string, string>;
export function makeT(dict: Dict, fallback: Dict) {
  return (key: string, vars?: Record<string, string | number>) => {
    let s = dict[key] ?? fallback[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  };
}
export type T = ReturnType<typeof makeT>;

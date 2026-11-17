// Merges docs/notes/i18n-*.json patches ({ key: { en, hi, kn, ta, or, bn, gu } }) into the locale files.
// A key with only "en" updates English alone (student-only text, decision 32). Placeholders are checked against English.
import fs from "node:fs";
import path from "node:path";

const LANGS = ["en", "hi", "kn", "ta", "or", "bn", "gu"];
const dir = "src/lib/i18n/locales";
const notes = "docs/notes";
const dicts = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(fs.readFileSync(path.join(dir, `${l}.json`), "utf8"))]));
const patches = fs.readdirSync(notes).filter((f) => /^i18n-.*\.json$/.test(f)).sort();
const ph = (s) => (String(s).match(/\{\w+\}/g) ?? []).sort().join(",");
let problems = 0, count = 0;
for (const f of patches) {
  const patch = JSON.parse(fs.readFileSync(path.join(notes, f), "utf8"));
  for (const [key, vals] of Object.entries(patch)) {
    if (!vals.en) { console.warn(`${f}: ${key} has no English`); problems++; continue; }
    for (const l of LANGS) {
      if (vals[l] == null) continue;
      if (ph(vals[l]) !== ph(vals.en)) { console.warn(`${f}: ${key} [${l}] placeholders differ`); problems++; }
      dicts[l][key] = vals[l];
    }
    count++;
  }
}
// Every key must exist in every language (fall back to English rather than show a raw key).
for (const k of Object.keys(dicts.en)) for (const l of LANGS) if (dicts[l][k] == null) dicts[l][k] = dicts.en[k];
for (const l of LANGS) fs.writeFileSync(path.join(dir, `${l}.json`), JSON.stringify(dicts[l], null, 2) + "\n");
console.log(`merged ${count} keys from ${patches.length} files; ${problems} problems`);

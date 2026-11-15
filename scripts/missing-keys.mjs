import fs from "node:fs";
import path from "node:path";
const en = JSON.parse(fs.readFileSync("src/lib/i18n/locales/en.json", "utf8"));
const found = new Set();
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|mjs)$/.test(f)) {
      const s = fs.readFileSync(p, "utf8");
      for (const m of s.matchAll(/\bt\(\s*["'`]([a-z_]+\.[a-zA-Z0-9_.]+)["'`]/g)) found.add(m[1]);
      for (const m of s.matchAll(/["']((?:err|pc|pintake|intake|match|common)\.[a-z0-9_]+)["']/g)) found.add(m[1]);
    }
  }
}
walk("src");
const missing = [...found].filter((k) => !(k in en)).sort();
console.log(missing.join("\n"));

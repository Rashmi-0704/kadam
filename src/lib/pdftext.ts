import "server-only";
import { inflateSync } from "node:zlib";

/**
 * Best-effort text from simple PDFs (no extra libraries): inflate content streams and read
 * the strings shown by Tj/TJ operators. Used only when Gemini can't read the file.
 */
export function pdfText(bytes: Uint8Array): string {
  const buf = Buffer.from(bytes);
  const raw = buf.toString("latin1");
  const out: string[] = [];
  const re = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const start = m.index + m[0].length;
    const end = raw.indexOf("endstream", start);
    if (end < 0) break;
    const dict = raw.slice(Math.max(0, m.index - 300), m.index);
    let content = "";
    const chunk = buf.subarray(start, end);
    if (/FlateDecode/.test(dict)) {
      try {
        content = inflateSync(chunk).toString("latin1");
      } catch {
        continue;
      }
    } else content = chunk.toString("latin1");
    if (!/T[Jj]/.test(content)) continue;
    const lines: string[] = [];
    for (const op of content.matchAll(/\[((?:[^\]\\]|\\.)*)\]\s*TJ|\(((?:[^)\\]|\\.)*)\)\s*Tj|(T\*|Td|TD|ET)/g)) {
      if (op[3]) { lines.push("\n"); continue; }
      const s = op[1] !== undefined ? [...op[1].matchAll(/\(((?:[^)\\]|\\.)*)\)/g)].map((x) => x[1]).join("") : op[2];
      lines.push(unescape(s ?? ""));
    }
    out.push(lines.join("").replace(/\n{2,}/g, "\n"));
    re.lastIndex = end;
  }
  return out.join("\n").replace(/[^\S\n]+/g, " ").trim().slice(0, 20000);
}

function unescape(s: string) {
  return s.replace(/\\([nrtbf()\\]|[0-7]{1,3})/g, (_, c: string) => {
    if (/^[0-7]+$/.test(c)) return String.fromCharCode(parseInt(c, 8));
    return ({ n: "\n", r: "", t: " ", b: "", f: "", "(": "(", ")": ")", "\\": "\\" } as Record<string, string>)[c] ?? c;
  });
}

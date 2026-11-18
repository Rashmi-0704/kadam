// Study-year options used by onboarding and the student ID reader. Pure (no imports) so scripts can test it.
const lower = (s: string) => s.toLowerCase();

export const YEAR_OPTIONS = ["1st year", "2nd year", "3rd year", "4th year", "5th year", "Postgraduate"] as const;
/** Maps "II yr", "Second Year", "2022-26 batch, 3rd sem", "PG", "MBA" … to one of YEAR_OPTIONS, or "" when unsure. */
export function normaliseYear(raw: string): string {
  const s = lower(raw).trim();
  if (!s) return "";
  if (YEAR_OPTIONS.map(lower).includes(s)) return YEAR_OPTIONS.find((y) => lower(y) === s)!;
  if (/\b(pg|post ?grad|postgraduate|m\.?\s?(a|sc|com|tech|ba|ca)\b|mba|mca|masters?)/.test(s)) return "Postgraduate";
  const words: [RegExp, number][] = [[/\b(1st|first|i)\b/, 1], [/\b(2nd|second|ii)\b/, 2], [/\b(3rd|third|iii)\b/, 3], [/\b(4th|fourth|iv)\b/, 4], [/\b(5th|fifth|v)\b/, 5]];
  const sem = s.match(/(\d{1,2})\s*(st|nd|rd|th)?\s*sem/);
  if (sem) { const n = Math.ceil(Number(sem[1]) / 2); return n >= 1 && n <= 5 ? YEAR_OPTIONS[n - 1] : ""; }
  const digit = s.match(/\b([1-5])\s*(st|nd|rd|th)?\s*(year|yr)\b/) ?? s.match(/^([1-5])$/);
  if (digit) return YEAR_OPTIONS[Number(digit[1]) - 1];
  for (const [re, n] of words) if (re.test(s) && /(year|yr)/.test(s)) return YEAR_OPTIONS[n - 1];
  return "";
}


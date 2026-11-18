// Run with: node scripts/test-year.ts
// The study-year normaliser used by the student ID reader (round 4; the ?next= guard went with the onboarding screen in round 5).
import { normaliseYear } from "../src/lib/year.ts";

let failed = 0;
const check = (name: string, ok: boolean) => { console.log(`${ok ? "✓" : "✗"} ${name}`); if (!ok) failed++; };

const years: [string, string][] = [
  ["2nd year", "2nd year"], ["II Year", "2nd year"], ["Third year", "3rd year"], ["3 yr", "3rd year"], ["Sem 5", ""], ["5th sem", "3rd year"],
  ["1st Semester", "1st year"], ["MBA", "Postgraduate"], ["PG", "Postgraduate"], ["M.Com", "Postgraduate"], ["2023-2027", ""], ["", ""],
];
for (const [raw, want] of years) check(`year ${JSON.stringify(raw)} → ${JSON.stringify(want)}`, normaliseYear(raw) === want);

console.log(failed ? `\n${failed} failed` : "\nAll passed");
process.exit(failed ? 1 : 0);

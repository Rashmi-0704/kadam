// Run with: node scripts/test-onboarding.ts
// Round 4: the open-redirect guard for ?next= and the study-year normaliser used by the student ID reader.
import { safeNext } from "../src/lib/safe-next.ts";
import { normaliseYear } from "../src/lib/year.ts";

let failed = 0;
const check = (name: string, ok: boolean) => { console.log(`${ok ? "✓" : "✗"} ${name}`); if (!ok) failed++; };

const P = "/student/problems/00000000-0000-4000-8000-000000000306";
check("keeps an internal problem path", safeNext(P) === P);
check("keeps /student/profile", safeNext("/student/profile") === "/student/profile");
for (const bad of ["//evil.com", "/student//evil.com", "https://evil.com/student/x", "/student/x\\..\\evil", "javascript:alert(1)", "/business/dashboard", "/student/x?u=https://e.com", "/student/<script>", "", null]) {
  check(`rejects ${JSON.stringify(bad)}`, safeNext(bad) === null);
}

const years: [string, string][] = [
  ["2nd year", "2nd year"], ["II Year", "2nd year"], ["Third year", "3rd year"], ["3 yr", "3rd year"], ["Sem 5", ""], ["5th sem", "3rd year"],
  ["1st Semester", "1st year"], ["MBA", "Postgraduate"], ["PG", "Postgraduate"], ["M.Com", "Postgraduate"], ["2023-2027", ""], ["", ""],
];
for (const [raw, want] of years) check(`year ${JSON.stringify(raw)} → ${JSON.stringify(want)}`, normaliseYear(raw) === want);

console.log(failed ? `\n${failed} failed` : "\nAll passed");
process.exit(failed ? 1 : 0);

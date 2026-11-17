import { usageByDay } from "@/lib/ai/usage";
import { env } from "@/lib/env";
import { aiText } from "@/lib/ai/copy";
import type { T } from "@/lib/i18n/config";

const FEATURE_LABEL: Record<string, string> = {
  cv: "CV reading + first question",
  intake: "Student intake questions",
  pathways: "Career pathways",
  roadmap: "AI roadmaps",
  gaps: "Skill gaps",
  match: "Problem matching",
  pintake: "Problem intake questions",
  draft: "Problem drafting",
  report: "Impact reports",
};

/** Daily Gemini calls per feature (Google's quota day = Pacific time) and the shared per-minute limiter. */
export async function AiUsage({ t }: { t: T }) {
  const { rows, today, thisMinute } = await usageByDay(7);
  const todayRows = rows.filter((r) => r.day === today);
  const sum = (k: "calls" | "limited" | "failed", list = todayRows) => list.reduce((n, r) => n + Number(r[k] ?? 0), 0);
  const days = Array.from(new Set(rows.map((r) => r.day)));
  return (
    <section className="card mt-8 p-5" aria-labelledby="ai-usage-h">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="ai-usage-h" className="text-lg font-bold">{aiText(t, "admin.ai_title")}</h2>
        <span className="chip">{aiText(t, "admin.ai_minute", { n: thisMinute, max: env.geminiRpm })}</span>
      </div>
      <p className="mt-1 text-sm text-ink-3">{aiText(t, "admin.ai_sub")} · <span className="font-mono">{env.geminiModel}</span></p>
      {todayRows.length === 0 ? (
        <p className="mt-4 text-sm text-ink-2">{aiText(t, "admin.ai_none")}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <caption className="sr-only">{aiText(t, "admin.ai_today")} {today}</caption>
            <thead className="text-ink-3">
              <tr className="border-b border-line">
                <th scope="col" className="py-2 pr-3 font-semibold">{aiText(t, "admin.ai_feature")}</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">{aiText(t, "admin.ai_calls")}</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">{aiText(t, "admin.ai_limited")}</th>
                <th scope="col" className="py-2 text-right font-semibold">{aiText(t, "admin.ai_failed")}</th>
              </tr>
            </thead>
            <tbody>
              {todayRows.map((r) => (
                <tr key={r.feature} className="border-b border-line last:border-0">
                  <th scope="row" className="py-2 pr-3 font-medium">{FEATURE_LABEL[r.feature] ?? r.feature}</th>
                  <td className="py-2 pr-3 text-right tabular-nums">{r.calls}</td>
                  <td className={`py-2 pr-3 text-right tabular-nums ${r.limited ? "font-semibold text-highlight-deep" : "text-ink-3"}`}>{r.limited}</td>
                  <td className={`py-2 text-right tabular-nums ${r.failed ? "font-semibold text-alert" : "text-ink-3"}`}>{r.failed}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-line font-bold">
                <th scope="row" className="py-2 pr-3">{aiText(t, "admin.ai_total")}</th>
                <td className="py-2 pr-3 text-right tabular-nums">{sum("calls")}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{sum("limited")}</td>
                <td className="py-2 text-right tabular-nums">{sum("failed")}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      {days.length > 1 && (
        <div className="mt-4">
          <h3 className="eyebrow mb-2">{aiText(t, "admin.ai_week")}</h3>
          <ul className="flex flex-wrap gap-2">
            {days.map((d) => (
              <li key={d} className="chip tabular-nums">
                {d}: {sum("calls", rows.filter((r) => r.day === d))}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

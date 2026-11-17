import type { T } from "@/lib/i18n/config";
import { roleTitle } from "@/db/taxonomy";

export type ReasonParts =
  | { kind: "path"; path: "now" | "pivot" | "stretch"; before: string; role: string; after: string; extra?: string }
  | { kind: "ai"; path: "now" | "pivot" | "stretch"; role: string; text: string }
  | { kind: "text"; text: string };

const MARK = "\u0000";

/**
 * Splits a match reason into parts so the role can be styled without string-matching inside a translated sentence.
 * Rule-based reasons look like "now|Data Analyst|SQL, Excel"; the translated template is split at its {role} placeholder.
 * Free-text reasons (from AI) are returned as text.
 */
export function reasonParts(reason: string, t: T): ReasonParts {
  if (!reason) return { kind: "text", text: "" };
  if (!reason.includes("|")) return { kind: "text", text: reason };
  const [kind, a, skills] = reason.split("|");
  if (kind === "ai") {
    const [, tier, role, ...rest] = reason.split("|");
    if (tier === "now" || tier === "pivot" || tier === "stretch") return { kind: "ai", path: tier, role: roleTitle(role), text: rest.join("|") };
    return { kind: "text", text: rest.join("|") };
  }
  if (kind === "now" || kind === "pivot" || kind === "stretch") {
    const [before, after = ""] = t(`match.${kind}`, { role: MARK }).split(MARK);
    return { kind: "path", path: kind, before, role: roleTitle(a), after, extra: skills ? t("match.uses", { skills }) : undefined };
  }
  const base = kind === "skills" ? t("match.skills", { skills: a }) : kind === "new" ? t("match.new", { business: a }) : a;
  return { kind: "text", text: skills && kind !== "skills" ? `${base} · ${t("match.uses", { skills })}` : base };
}

export const NEW_WINDOW_DAYS = 7;
/** A problem is "New" when it went live within the last 7 days. */
export function isNewProblem(liveAt: string | Date | null | undefined): boolean {
  if (!liveAt) return false;
  return Date.now() - new Date(liveAt).getTime() < NEW_WINDOW_DAYS * 864e5;
}

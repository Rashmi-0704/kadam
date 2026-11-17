import type { T } from "@/lib/i18n/config";
import type { FaqItem } from "./FaqTabs";

const items = (t: T, p: "s" | "b"): FaqItem[] => [1, 2, 3, 4, 5].map((n) => ({ q: t(`faq.${p}${n}_q`), a: t(`faq.${p}${n}_a`) }));

/** FAQ tabs for both homepages. The page's own audience comes first. */
export function faqTabs(t: T, first: "students" | "businesses") {
  const s = { label: t("faq.tab_students"), items: items(t, "s") };
  const b = { label: t("faq.tab_businesses"), items: items(t, "b") };
  return first === "students" ? [s, b] : [b, s];
}

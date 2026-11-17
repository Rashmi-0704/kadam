import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { isLang, LANG_COOKIE, makeT, type Dict, type Lang } from "./config";
import en from "./locales/en.json";
import { currentUser } from "../session";

const loaders: Record<Exclude<Lang, "en">, () => Promise<{ default: Dict }>> = {
  hi: () => import("./locales/hi.json"),
  kn: () => import("./locales/kn.json"),
  ta: () => import("./locales/ta.json"),
  or: () => import("./locales/or.json"),
  bn: () => import("./locales/bn.json"),
  gu: () => import("./locales/gu.json"),
};

export const AUDIENCE_COOKIE = "kadam_audience";

// Students use Kadam in English only; the language choice is for businesses and NGOs.
export const getLang = cache(async (): Promise<Lang> => {
  const jar = await cookies();
  const user = await currentUser();
  if (user?.role === "student" || user?.role === "admin") return "en";
  if (!user?.role && jar.get(AUDIENCE_COOKIE)?.value === "student") return "en";
  const c = jar.get(LANG_COOKIE)?.value;
  return isLang(c) ? c : "en";
});

export const isStudentContext = cache(async (): Promise<boolean> => {
  const user = await currentUser();
  if (user?.role) return user.role === "student";
  return (await cookies()).get(AUDIENCE_COOKIE)?.value === "student";
});

export const getDict = cache(async (): Promise<Dict> => {
  const lang = await getLang();
  if (lang === "en") return en as Dict;
  try {
    return { ...(en as Dict), ...(await loaders[lang]()).default };
  } catch {
    return en as Dict;
  }
});

export async function getT(force?: "en") {
  if (force === "en") return makeT(en as Dict, en as Dict);
  return makeT(await getDict(), en as Dict);
}

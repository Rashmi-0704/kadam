import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { isLang, LANG_COOKIE, makeT, type Dict, type Lang } from "./config";
import en from "./locales/en.json";

const loaders: Record<Exclude<Lang, "en">, () => Promise<{ default: Dict }>> = {
  hi: () => import("./locales/hi.json"),
  kn: () => import("./locales/kn.json"),
  ta: () => import("./locales/ta.json"),
  or: () => import("./locales/or.json"),
  bn: () => import("./locales/bn.json"),
  gu: () => import("./locales/gu.json"),
};

export const getLang = cache(async (): Promise<Lang> => {
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(c) ? c : "en";
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

export async function getT() {
  return makeT(await getDict(), en as Dict);
}

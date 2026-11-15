"use client";
import { createContext, useContext, useMemo } from "react";
import { makeT, type Dict, type Lang } from "./config";

const Ctx = createContext<{ dict: Dict; lang: Lang }>({ dict: {}, lang: "en" });

export function I18nProvider({ dict, lang, children }: { dict: Dict; lang: Lang; children: React.ReactNode }) {
  return <Ctx.Provider value={{ dict, lang }}>{children}</Ctx.Provider>;
}
export function useT() {
  const { dict } = useContext(Ctx);
  return useMemo(() => makeT(dict, dict), [dict]);
}
export function useLang() {
  return useContext(Ctx).lang;
}

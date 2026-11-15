"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isLang, LANG_COOKIE } from "@/lib/i18n/config";
import { clearSession, currentUser } from "@/lib/session";
import { q } from "@/lib/db";

export async function setLanguage(lang: string) {
  if (!isLang(lang)) return;
  (await cookies()).set(LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  const u = await currentUser();
  if (u) await q(`update users set language_pref = $2 where id = $1`, [u.id, lang]);
  revalidatePath("/", "layout");
}

export async function signOut() {
  await clearSession();
  redirect("/");
}

export async function markAllRead() {
  const u = await currentUser();
  if (u) await q(`update notifications set read = true where user_id = $1 and read = false`, [u.id]);
  revalidatePath("/notifications");
}

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";
import { one, type Row } from "./db";

const COOKIE = "kadam_session";
const key = () => new TextEncoder().encode(env.sessionSecret);

export async function setSession(userId: string) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export const getSessionUserId = cache(async (): Promise<string | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return typeof payload.uid === "string" ? payload.uid : null;
  } catch {
    return null;
  }
});

export type User = { id: string; role: "student" | "business" | "admin" | null; name: string | null; email: string; language_pref: string; consent_at: Date | null };

export const currentUser = cache(async (): Promise<User | null> => {
  const id = await getSessionUserId();
  if (!id) return null;
  return (await one<User>(`select id, role, name, email, language_pref, consent_at from users where id = $1`, [id])) ?? null;
});

export async function requireUser(role?: User["role"]): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/auth");
  if (!u.role) redirect("/auth?step=role");
  if (role && u.role !== role) redirect(homeFor(u.role));
  return u;
}

export function homeFor(role: User["role"]) {
  if (role === "student") return "/student/dashboard";
  if (role === "business") return "/business/dashboard";
  if (role === "admin") return "/admin/verifications";
  return "/auth?step=role";
}

export type StudentProfile = Row;
export async function studentProfile(userId: string) {
  return one(`select * from student_profiles where user_id = $1`, [userId]);
}
export async function businessProfile(userId: string) {
  return one(`select * from business_profiles where user_id = $1`, [userId]);
}

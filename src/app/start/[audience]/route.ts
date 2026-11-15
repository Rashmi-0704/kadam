import { NextResponse } from "next/server";
import { AUDIENCE_COOKIE } from "@/lib/i18n/server";

// Remembers whether the visitor chose "student" or "business" on the welcome screen.
export async function GET(req: Request, { params }: { params: Promise<{ audience: string }> }) {
  const { audience } = await params;
  const who = audience === "business" ? "business" : "student";
  const res = NextResponse.redirect(new URL(who === "business" ? "/businesses" : "/students", req.url));
  res.cookies.set(AUDIENCE_COOKIE, who, { path: "/", maxAge: 60 * 60 * 24 * 180, sameSite: "lax" });
  return res;
}

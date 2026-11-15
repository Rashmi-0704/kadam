import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { loadEngagement, canSee } from "@/lib/engagement";
import { readBytes, BUCKETS, type Bucket } from "@/lib/storage";

// Serves private files when Supabase Storage is not configured. Every request re-checks access.
export async function GET(req: Request) {
  const u = await currentUser();
  if (!u) return new NextResponse("Not found", { status: 404 });
  const sp = new URL(req.url).searchParams;
  const bucket = sp.get("b") as Bucket;
  const path = sp.get("p") ?? "";
  const ctx = sp.get("c") ?? "";
  if (!BUCKETS.includes(bucket) || path.includes("..")) return new NextResponse("Not found", { status: 404 });

  let allowed = false;
  if (bucket === "chat-files" || bucket === "submissions") {
    const engId = ctx.startsWith("eng:") ? ctx.slice(4) : "";
    const e = engId && path.startsWith(`${engId}/`) ? await loadEngagement(engId) : null;
    allowed = Boolean(e && canSee(u, e));
  } else if (bucket === "student-ids") {
    allowed = u.role === "admin" || path.startsWith(`ids/${u.id}/`);
  } else if (bucket === "cvs" || bucket === "problem-files") {
    allowed = path.startsWith(`${u.id}/`);
  }
  if (!allowed) return new NextResponse("Not found", { status: 404 });
  const f = await readBytes({ bucket, path });
  if (!f) return new NextResponse("Not found", { status: 404 });
  const name = path.split("/").pop()?.replace(/^\d+-/, "") ?? "file";
  return new NextResponse(Buffer.from(f.bytes), {
    headers: {
      "content-type": f.type || "application/octet-stream",
      "content-disposition": `${/^image\/|pdf/.test(f.type) ? "inline" : "attachment"}; filename="${name.replace(/"/g, "")}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
    },
  });
}

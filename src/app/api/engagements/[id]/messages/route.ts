import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { loadEngagement, canSee } from "@/lib/engagement";
import { q } from "@/lib/db";
import { fileUrl, type StoredFile } from "@/lib/storage";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const e = await loadEngagement(id);
  if (!e || !canSee(u, e)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const rows = await q(
    `select m.id, m.sender_id, m.text, m.file, m.created_at, u.name as sender_name, u.role as sender_role
       from messages m join users u on u.id = m.sender_id where m.engagement_id = $1 order by m.created_at asc limit 500`,
    [id],
  );
  // Opening the thread clears this person's chat notifications for it.
  await q(`update notifications set read = true where user_id = $1 and type = 'message' and read = false and payload->>'engagementId' = $2`, [u.id, id]);
  const messages = await Promise.all(
    rows.map(async (m) => ({
      id: m.id,
      mine: m.sender_id === u.id,
      sender: m.sender_name,
      role: m.sender_role,
      text: m.text,
      file: m.file ? { name: (m.file as StoredFile).name, url: await fileUrl(m.file as StoredFile, `eng:${id}`) } : null,
      at: new Date(m.created_at).toISOString(),
    })),
  );
  return NextResponse.json({ messages, status: e.status }, { headers: { "cache-control": "no-store" } });
}

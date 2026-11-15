import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { transcribe } from "@/lib/stt";

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "auth" }, { status: 401 });
  const form = await req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (audio.size > 4 * 1024 * 1024) return NextResponse.json({ error: "too_large" }, { status: 413 });
  const lang = String(form.get("lang") ?? "unknown");
  const name = audio instanceof File ? audio.name : "voice.webm";
  const out = await transcribe(audio, name, /^[a-z]{2}-IN$/.test(lang) ? lang : "unknown");
  if (!out || !out.transcript.trim()) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  return NextResponse.json({ transcript: out.transcript.trim() });
}

import "server-only";
import { env, hasSupabaseStorage } from "./env";
import { adminClient } from "./supabase";
import { q, one } from "./db";

export const BUCKETS = ["cvs", "student-ids", "problem-files", "submissions", "chat-files"] as const;
export type Bucket = (typeof BUCKETS)[number];
export type StoredFile = { bucket: Bucket; path: string; name: string; type: string; size?: number };

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function safeName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(-80) || "file";
}

export async function saveUpload(bucket: Bucket, folder: string, file: File): Promise<StoredFile> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("file_too_large");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const path = `${folder}/${Date.now()}-${safeName(file.name)}`;
  const type = file.type || "application/octet-stream";
  await putBytes(bucket, path, bytes, type);
  return { bucket, path, name: file.name, type, size: file.size };
}

export async function putBytes(bucket: Bucket, path: string, bytes: Uint8Array, type: string) {
  if (hasSupabaseStorage()) {
    const { error } = await adminClient().storage.from(bucket).upload(path, bytes, { contentType: type, upsert: true });
    if (error) throw error;
    return;
  }
  await q(
    `insert into blobs (path, content_type, data) values ($1,$2,$3) on conflict (path) do update set data = excluded.data, content_type = excluded.content_type`,
    [`${bucket}/${path}`, type, bytes],
  );
}

export async function readBytes(f: Pick<StoredFile, "bucket" | "path">): Promise<{ bytes: Uint8Array; type: string } | null> {
  if (hasSupabaseStorage()) {
    const { data, error } = await adminClient().storage.from(f.bucket).download(f.path);
    if (error || !data) return null;
    return { bytes: new Uint8Array(await data.arrayBuffer()), type: data.type };
  }
  const row = await one<{ data: Uint8Array; content_type: string }>(`select data, content_type from blobs where path = $1`, [`${f.bucket}/${f.path}`]);
  if (!row) return null;
  return { bytes: new Uint8Array(row.data), type: row.content_type };
}

// Short-lived link for a file the current user is allowed to see.
// With Supabase it is a signed storage URL; otherwise it goes through /api/files, which re-checks access.
export async function fileUrl(f: StoredFile, ctx: string): Promise<string> {
  if (hasSupabaseStorage()) {
    const { data } = await adminClient().storage.from(f.bucket).createSignedUrl(f.path, 60 * 10, { download: f.name });
    if (data?.signedUrl) return data.signedUrl;
  }
  const params = new URLSearchParams({ b: f.bucket, p: f.path, c: ctx });
  return `/api/files?${params}`;
}

export async function ensureBuckets() {
  if (!hasSupabaseStorage()) return;
  const sb = adminClient();
  const { data } = await sb.storage.listBuckets();
  for (const b of BUCKETS) {
    if (!data?.some((x) => x.name === b)) await sb.storage.createBucket(b, { public: false, fileSizeLimit: env.supabaseUrl ? "5MB" : undefined });
  }
}

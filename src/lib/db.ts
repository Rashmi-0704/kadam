import "server-only";
import path from "node:path";
import fs from "node:fs";
import { env, hasSupabaseStorage } from "./env";
import { adminClient } from "./supabase";
import { SCHEMA_SQL, UPGRADE_SQL } from "@/db/schema";
import { seed, RESET_SQL } from "@/db/seed-data";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Row = Record<string, any>;
type Query = (text: string, params?: unknown[]) => Promise<Row[]>;
type Db = { q: Query; exec: (sql: string) => Promise<void>; kind: "postgres" | "pglite" };

const g = globalThis as unknown as { __kadamDb?: Promise<Db> };

async function init(): Promise<Db> {
  if (env.dbUrl) {
    const postgres = (await import("postgres")).default;
    // Provider URLs can carry extra query params (e.g. Supabase's `supa=`) that Postgres rejects as settings.
    const url = new URL(env.dbUrl);
    const local = /^(localhost|127\.0\.0\.1)$/.test(url.hostname);
    url.search = "";
    const sql = postgres(url.toString(), { prepare: false, max: 3, idle_timeout: 20, connect_timeout: 15, ssl: local ? false : "require", onnotice: () => {} });
    // postgres.js JSON-encodes values bound to jsonb, so a pre-stringified value would be stored as a JSON string.
    // Parse the parameters that the SQL casts to jsonb, so they are stored as real JSON.
    const jsonParams = (t: string) => new Set(Array.from(t.matchAll(/\$(\d+)::jsonb/g), (m) => Number(m[1]) - 1));
    const q: Query = async (t, p = []) => {
      const idx = jsonParams(t);
      const params = idx.size ? p.map((v, i) => (idx.has(i) && typeof v === "string" ? JSON.parse(v) : v)) : p;
      return Array.from(await sql.unsafe(t, params as any[])) as Row[];
    };
    const exec = async (s: string) => void (await sql.unsafe(s));
    // First connection to an empty database: create the schema, storage buckets and demo data.
    const exists = await q(`select to_regclass('public.users') as t`);
    if (!exists[0]?.t) {
      await exec(SCHEMA_SQL);
      await ensureSupabaseBuckets();
      await seed(q, putSupabaseBlob);
    }
    await exec(UPGRADE_SQL);
    return { q, exec, kind: "postgres" };
  }
  // Local / fallback database: embedded Postgres (PGlite).
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.VERCEL ? "/tmp/kadam-pg" : path.join(process.cwd(), ".data", "pg");
  fs.mkdirSync(dir, { recursive: true });
  const db = await PGlite.create(dir);
  const q: Query = async (t, p = []) => (await db.query(t, p as any[])).rows as Row[];
  const exists = await q(`select to_regclass('public.users') as t`);
  if (!exists[0]?.t) {
    await db.exec(SCHEMA_SQL);
    await seed(q, putBlob(q));
  }
  await db.exec(UPGRADE_SQL);
  return { q, exec: async (s) => void (await db.exec(s)), kind: "pglite" };
}

const BUCKETS = ["cvs", "student-ids", "problem-files", "submissions", "chat-files"];

async function ensureSupabaseBuckets() {
  if (!hasSupabaseStorage()) return;
  const sb = adminClient();
  const { data } = await sb.storage.listBuckets();
  for (const b of BUCKETS) if (!data?.some((x) => x.name === b)) await sb.storage.createBucket(b, { public: false, fileSizeLimit: "5MB" });
}

async function putSupabaseBlob(p: string, bytes: Uint8Array, type: string) {
  if (!hasSupabaseStorage()) return;
  await adminClient().storage.from("student-ids").upload(p, bytes, { contentType: type, upsert: true });
}

export async function seedPut() {
  const db = await getDb();
  return db.kind === "postgres" ? putSupabaseBlob : putBlob(db.q);
}

function putBlob(q: Query) {
  return async (p: string, bytes: Uint8Array, type: string) => {
    await q(`insert into blobs (path, content_type, data) values ($1,$2,$3) on conflict (path) do update set data = excluded.data, content_type = excluded.content_type`, [`student-ids/${p}`, type, bytes]);
  };
}

export function getDb() {
  if (!g.__kadamDb) g.__kadamDb = init().catch((e) => { g.__kadamDb = undefined; throw e; });
  return g.__kadamDb;
}

export async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await (await getDb()).q(text, params)) as T[];
}
export async function one<T = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}
export const J = (v: unknown) => JSON.stringify(v ?? null);

export async function resetDemoData() {
  const db = await getDb();
  await db.exec(RESET_SQL);
  await seed(db.q, await seedPut());
}

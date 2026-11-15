import "server-only";
import path from "node:path";
import { env } from "./env";
import { SCHEMA_SQL } from "@/db/schema";
import { seed, RESET_SQL } from "@/db/seed-data";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Row = Record<string, any>;
type Query = (text: string, params?: unknown[]) => Promise<Row[]>;
type Db = { q: Query; exec: (sql: string) => Promise<void>; kind: "postgres" | "pglite" };

const g = globalThis as unknown as { __kadamDb?: Promise<Db> };

async function init(): Promise<Db> {
  if (env.dbUrl) {
    const postgres = (await import("postgres")).default;
    const sql = postgres(env.dbUrl, { prepare: false, max: 3, idle_timeout: 20, connect_timeout: 15 });
    const q: Query = async (t, p = []) => Array.from(await sql.unsafe(t, p as any[])) as Row[];
    return { q, exec: async (s) => void (await sql.unsafe(s)), kind: "postgres" };
  }
  // Local / fallback database: embedded Postgres (PGlite).
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.VERCEL ? "/tmp/kadam-pg" : path.join(process.cwd(), ".data", "pg");
  const db = await PGlite.create(dir);
  const q: Query = async (t, p = []) => (await db.query(t, p as any[])).rows as Row[];
  const exists = await q(`select to_regclass('public.users') as t`);
  if (!exists[0]?.t) {
    await db.exec(SCHEMA_SQL);
    await seed(q, putBlob(q));
  }
  return { q, exec: async (s) => void (await db.exec(s)), kind: "pglite" };
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

export async function resetDemoData(put: (p: string, b: Uint8Array, t: string) => Promise<void>) {
  const db = await getDb();
  await db.exec(RESET_SQL);
  await seed(db.q, put);
}

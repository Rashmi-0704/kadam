// Run with: node scripts/write-migration.ts
// Copies the canonical schema (src/db/schema.ts) into supabase/migrations so the SQL lives in the repo.
// The app also applies this schema by itself the first time it connects to an empty database.
import fs from "node:fs";
import { SCHEMA_SQL } from "../src/db/schema.ts";

fs.mkdirSync("supabase/migrations", { recursive: true });
fs.writeFileSync("supabase/migrations/20261115000000_init.sql", `-- Kadam schema (generated from src/db/schema.ts)\n${SCHEMA_SQL.trim()}\n`);
console.log("wrote supabase/migrations/20261115000000_init.sql");

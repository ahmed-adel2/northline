import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const g = globalThis as unknown as { __sql?: ReturnType<typeof postgres> };

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Supabase pooler connection string to .env.local (see README-SUPABASE.md).",
    );
  }
  // prepare:false is required for Supabase's transaction pooler (port 6543).
  return (g.__sql ??= postgres(url, { prepare: false, max: 5, idle_timeout: 20 }));
}

export function getDb() {
  return drizzle(connect(), { schema });
}
export * from "./schema";

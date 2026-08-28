import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * libSQL runs the same dialect locally (a file) and in production (Turso), so
 * there is one schema and one set of migrations rather than two.
 */
function url(): string {
  return process.env.DATABASE_URL ?? "file:.data/foundersbee.db";
}

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (cached) return cached;
  const client = createClient({
    url: url(),
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  return (cached = drizzle(client, { schema }));
}

export { schema };

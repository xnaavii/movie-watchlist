import { env } from "cloudflare:workers";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.ts";

if (!env.DATABASE_URL) {
	throw new Error("DATABASE_URL environment variable is missing");
}

const sql = neon(env.DATABASE_URL);

export const db = drizzle({ client: sql, schema });

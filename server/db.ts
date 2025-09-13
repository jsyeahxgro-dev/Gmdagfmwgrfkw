import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use the DATABASE_URL environment variable
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set."
  );
}

// Log the connection attempt (without password) for debugging
const urlForLogging = databaseUrl.replace(/:([^:@]+)@/, ':***@');
console.log('Connecting to database:', urlForLogging);

// Use standard PostgreSQL connection
export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

export const db = drizzle(pool, { schema });

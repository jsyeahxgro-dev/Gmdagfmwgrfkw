import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Clean and validate the DATABASE_URL
let connectionString = process.env.DATABASE_URL.trim();

// Ensure it starts with postgresql:// (not postgres://)
if (connectionString.startsWith('postgres://')) {
  connectionString = connectionString.replace('postgres://', 'postgresql://');
}

// Log the connection attempt (without password) for debugging
const urlForLogging = connectionString.replace(/:([^:@]+)@/, ':***@');
console.log('Connecting to database (HTTP mode):', urlForLogging);

// Use HTTP-based connection (more reliable for serverless/Render)
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

// For compatibility with existing code that might use pool
export const pool = null;

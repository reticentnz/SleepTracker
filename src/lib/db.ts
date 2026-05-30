import { neon } from '@neondatabase/serverless';

export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

const databaseUrl = process.env.DATABASE_URL;

// Retrieve the Neon SQL client, throwing a clear error if DATABASE_URL is missing.
export const getDbClient = () => {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is missing. Please add it to your .env.local file.');
  }
  return neon(databaseUrl);
};

let schemaInitialized = false;

/**
 * Ensures that the required tables exist in the Neon database.
 * This runs automatically before queries to provide a seamless setup.
 */
export async function ensureSchema() {
  if (schemaInitialized) return;

  const sql = getDbClient();

  try {
    // Enable pgcrypto for gen_random_uuid if not already enabled (standard in PG 13+)
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

    // Create sleep_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS sleep_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        log_date date NOT NULL,
        bed_time time,
        wake_time time,
        wake_status text CHECK (wake_status IN ('none', 'once', 'multiple', 'long_awake')),
        sleep_quality int CHECK (sleep_quality BETWEEN 1 AND 5),
        notes text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        UNIQUE (user_id, log_date)
      )
    `;

    // Create sleep_log_tags table
    await sql`
      CREATE TABLE IF NOT EXISTS sleep_log_tags (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        sleep_log_id uuid NOT NULL REFERENCES sleep_logs(id) ON DELETE CASCADE,
        tag text NOT NULL
      )
    `;

    schemaInitialized = true;
    console.log('Database schema verified/created successfully.');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

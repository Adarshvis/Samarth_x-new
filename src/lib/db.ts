import pg from 'pg'

const { Pool } = pg

// Parse the connection URL manually to avoid issues with special characters (e.g. @ in password)
function getPoolConfig(): pg.PoolConfig {
  const url = process.env.CMS_DATABASE_URL || ''
  try {
    const parsed = new URL(url)
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port) : 5432,
      user: parsed.username,
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
      ssl: false,
    }
  } catch {
    // Fallback to connection string if URL parsing fails
    return { connectionString: url }
  }
}

// Singleton pool
const globalForPg = globalThis as unknown as { pgPool?: pg.Pool }

export const pool: pg.Pool = globalForPg.pgPool ?? new Pool(getPoolConfig())

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool
}

let tableInitialized = false

export async function initApplicantsTable(): Promise<void> {
  if (tableInitialized) return
  tableInitialized = true

  await pool.query(`
    CREATE TABLE IF NOT EXISTS applicants (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      mobile TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      otp TEXT,
      otp_expires_at TIMESTAMPTZ,
      reset_token TEXT,
      reset_token_expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  // Safely add new columns to job_applications if they don't exist yet
  const newCols = [
    `ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS current_address VARCHAR`,
    `ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS permanent_address VARCHAR`,
    `ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS highest_qualification VARCHAR`,
    `ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS year_of_experience VARCHAR`,
  ]
  for (const stmt of newCols) {
    await pool.query(stmt).catch(() => {/* ignore if table doesn't exist yet */})
  }
}

export async function query<T = unknown>(
  sql: string,
  params?: unknown[],
): Promise<pg.QueryResult<T extends Record<string, unknown> ? T : never>> {
  await initApplicantsTable()
  return pool.query(sql, params) as Promise<
    pg.QueryResult<T extends Record<string, unknown> ? T : never>
  >
}

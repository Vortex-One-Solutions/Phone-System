import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const migrationsDir = path.resolve(new URL('../migrations/', import.meta.url).pathname);
const adminUrl = process.env.DATABASE_ADMIN_URL ?? process.env.DATABASE_URL;
if (!adminUrl) throw new Error('DATABASE_ADMIN_URL or DATABASE_URL is required');

const pool = new pg.Pool({ connectionString: adminUrl });

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const files = (await fs.readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const exists = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [file]);
    if (exists.rowCount) continue;
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(version) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`applied ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}

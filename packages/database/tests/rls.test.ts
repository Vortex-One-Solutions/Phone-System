import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const url = process.env.DATABASE_ADMIN_URL ?? process.env.DATABASE_URL;
describe.skipIf(!url)('PostgreSQL RLS', () => {
  it('blocks cross-tenant reads and writes', async () => {
    const pool = new pg.Pool({ connectionString: url });
    const a = randomUUID();
    const b = randomUUID();
    const user = randomUUID();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO tenants(id,name) VALUES($1,$2),($3,$4)', [a,'A',b,'B']);
      await client.query('INSERT INTO users(id,email,email_normalized) VALUES($1,$2,$2)', [user,`${user}@example.test`]);
      await client.query('INSERT INTO tenant_memberships(id,tenant_id,user_id,role) VALUES($1,$2,$3,$4)', [randomUUID(),a,user,'OWNER']);
      await client.query(`SELECT set_config('app.tenant_id',$1,true)`, [a]);
      const result = await client.query('SELECT * FROM tenant_memberships WHERE tenant_id=$1', [b]);
      expect(result.rows).toHaveLength(0);
      await expect(client.query(
        'INSERT INTO tenant_memberships(id,tenant_id,user_id,role) VALUES($1,$2,$3,$4)',
        [randomUUID(),b,user,'OWNER'],
      )).rejects.toThrow();
      await client.query('ROLLBACK');
    } finally {
      client.release();
      await pool.end();
    }
  });
});

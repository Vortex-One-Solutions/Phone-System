import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';

export function hashRequest(body: unknown): string {
  return createHash('sha256').update(JSON.stringify(body ?? null)).digest('hex');
}

export async function getIdempotentResponse(
  client: PoolClient,
  tenantId: string,
  key: string,
  requestHash: string,
): Promise<{ status: number; body: unknown } | null> {
  const result = await client.query<{ request_hash: string; response_status: number; response_body: unknown }>(
    `SELECT request_hash,response_status,response_body
     FROM idempotency_keys
     WHERE tenant_id=$1 AND idempotency_key=$2 AND expires_at>NOW()`,
    [tenantId, key],
  );
  const row = result.rows[0];
  if (!row) return null;
  if (row.request_hash !== requestHash) {
    const error = new Error('Idempotency key was reused with a different request payload');
    (error as Error & { code?: string }).code = 'IDEMPOTENCY_KEY_REUSED';
    throw error;
  }
  return { status: row.response_status, body: row.response_body };
}

export async function saveIdempotentResponse(
  client: PoolClient,
  tenantId: string,
  key: string,
  requestHash: string,
  status: number,
  body: unknown,
  ttlSeconds = 86400,
): Promise<void> {
  await client.query(
    `INSERT INTO idempotency_keys
      (id,tenant_id,idempotency_key,request_hash,response_status,response_body,expires_at)
     VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,NOW()+($6 || ' seconds')::interval)
     ON CONFLICT (tenant_id,idempotency_key) DO NOTHING`,
    [tenantId, key, requestHash, status, JSON.stringify(body), ttlSeconds],
  );
}

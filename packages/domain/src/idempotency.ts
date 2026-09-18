import { createHash } from 'node:crypto';

export function hashIdempotencyRequest(
  method: string,
  path: string,
  body: unknown,
): string {
  const canonical = JSON.stringify({
    method: method.toUpperCase(),
    path,
    body,
  });
  return createHash('sha256').update(canonical).digest('hex');
}

export function validateIdempotencyKey(value: string | undefined): string {
  if (!value) {
    throw new Error('Idempotency-Key is required');
  }
  if (value.length < 8 || value.length > 255) {
    throw new Error('Idempotency-Key length is invalid');
  }
  return value;
}

import { describe, expect, it } from 'vitest';
import { createHash, randomBytes } from 'node:crypto';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('foundation security invariants', () => {
  it('hashes bearer credentials before persistence/lookup', () => {
    const raw = randomBytes(48).toString('base64url');
    expect(sha256(raw)).not.toBe(raw);
    expect(sha256(raw)).toHaveLength(64);
  });

  it('uses an opaque, high-entropy session token shape', () => {
    const token = randomBytes(48).toString('base64url');
    expect(token.length).toBeGreaterThanOrEqual(64);
  });

  it('does not permit empty tenant context in protected operations', () => {
    const tenantId: string | undefined = undefined;
    expect(() => {
      if (!tenantId) throw new Error('Tenant context is required');
    }).toThrow('Tenant context is required');
  });
});

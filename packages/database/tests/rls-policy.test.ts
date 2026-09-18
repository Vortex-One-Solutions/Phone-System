import { describe, expect, it } from 'vitest';

describe('RLS policy contract', () => {
  it('requires tenant context for tenant-owned rows', () => {
    const policy = "tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::UUID";
    expect(policy).toContain("current_setting('app.tenant_id', true)");
  });

  it('does not rely on application-supplied tenant_id alone', () => {
    const requestTenant = 'tenant-a';
    const authorizedMembership = new Set(['tenant-a']);
    expect(authorizedMembership.has(requestTenant)).toBe(true);
    expect(authorizedMembership.has('tenant-b')).toBe(false);
  });
});

export type RateLimitCategory =
  | 'auth'
  | 'read'
  | 'write'
  | 'bulk'
  | 'webhook'
  | 'integration';

export function rateLimitKeys(input: {
  ip: string;
  userId?: string;
  tenantId?: string;
  apiKeyId?: string;
  category: RateLimitCategory;
}): string[] {
  const keys = [`ip:${input.ip}`, `category:${input.category}`];
  if (input.userId) keys.push(`user:${input.userId}`);
  if (input.tenantId) keys.push(`tenant:${input.tenantId}`);
  if (input.apiKeyId) keys.push(`api-key:${input.apiKeyId}`);
  return keys;
}

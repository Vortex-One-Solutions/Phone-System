export const ROLES = ['OWNER', 'ADMIN', 'MANAGER', 'AGENT', 'READ_ONLY'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'tenant.read', 'tenant.update', 'users.read', 'users.manage',
  'campaigns.read', 'campaigns.manage', 'contacts.read', 'contacts.manage',
  'billing.read', 'billing.manage', 'recordings.read', 'audit.read',
  'telephony.read', 'telephony.manage',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export interface DomainEvent<T = unknown> {
  id: string;
  type: string;
  version: number;
  tenant_id: string;
  occurred_at: string;
  source: string;
  subject: { type: string; id: string };
  data: T;
}

export interface ApiMeta {
  request_id: string;
  next_cursor?: string | null;
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
  meta: { request_id: string };
}

[executed on device: codespaces-73d925 (e215b2d9-1319-4805-9ed4-b434928d4042)]
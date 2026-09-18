import { randomBytes } from 'node:crypto';

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

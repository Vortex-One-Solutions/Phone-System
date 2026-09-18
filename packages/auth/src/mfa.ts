import { generateSecret, generateURI, verify } from 'otplib';
import { randomBytes } from 'node:crypto';
import { hashSecret, verifySecret } from './password.js';

export function createTotpSecret(): string {
  return generateSecret();
}

export function createTotpUri(secret: string, email: string, issuer: string): string {
  return generateURI({ issuer, label: email, secret });
}

export async function verifyTotp(secret: string, token: string): Promise<boolean> {
  const result = await verify({ secret, token });
  return result.valid;
}

export function generateRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () => randomBytes(9).toString('hex').toUpperCase());
}

export async function hashRecoveryCode(code: string): Promise<string> {
  return hashSecret(code);
}

export async function verifyRecoveryCode(hash: string, code: string): Promise<boolean> {
  return verifySecret(hash, code);
}

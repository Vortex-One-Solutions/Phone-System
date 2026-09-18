import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

const AES_KEY_BYTES = 32;
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function secret(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

function decodeKey(encoded: string): Buffer {
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== AES_KEY_BYTES) {
    throw new Error('MFA_ENCRYPTION_KEY must decode to exactly 32 bytes');
  }
  return key;
}

export function encryptMfaSecret(value: string, encodedKey: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', decodeKey(encodedKey), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}

export function decryptMfaSecret(value: string, encodedKey: string): string {
  const payload = Buffer.from(value, 'base64');
  if (payload.length < IV_BYTES + AUTH_TAG_BYTES + 1) {
    throw new Error('Invalid encrypted MFA secret');
  }
  const iv = payload.subarray(0, IV_BYTES);
  const tag = payload.subarray(IV_BYTES, IV_BYTES + AUTH_TAG_BYTES);
  const ciphertext = payload.subarray(IV_BYTES + AUTH_TAG_BYTES);
  const decipher = createDecipheriv('aes-256-gcm', decodeKey(encodedKey), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

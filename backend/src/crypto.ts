import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit nonce recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

function resolveKey(hexKey: string): Buffer {
  const key = Buffer.from(hexKey, 'hex');
  if (key.length !== 32) throw new Error('Encryption key must be 32 bytes (64 hex chars)');
  return key;
}

/** Encrypts plaintext with AES-256-GCM. Returns "iv:ciphertext:authTag" in Base64. */
export function encrypt(plaintext: string, hexKey: string): string {
  const key = resolveKey(hexKey);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${encrypted.toString('base64')}:${authTag.toString('base64')}`;
}

/** Decrypts a value produced by {@link encrypt}. Throws if tampered. */
export function decrypt(ciphertext: string, hexKey: string): string {
  const key = resolveKey(hexKey);
  const parts = ciphertext.split(':');
  if (parts.length !== 3) throw new Error('Invalid ciphertext format');
  const [ivB64, encB64, tagB64] = parts as [string, string, string];
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, 'base64'), {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return decipher.update(Buffer.from(encB64, 'base64')) + decipher.final('utf8');
}

/** HMAC-SHA256 over a value — used as deterministic search index for encrypted fields. */
export function hmac(value: string, hexKey: string): string {
  return createHmac('sha256', Buffer.from(hexKey, 'hex')).update(value).digest('hex');
}

/** SHA-256 hash — used to store refresh tokens without the raw value. */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Constant-time string comparison to prevent timing attacks. */
export function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { prisma } from '../db';
import { env } from '../env';
import { logger } from '../logger';
import { ApiError } from '../errors';
import { encrypt, hmac, sha256 } from '../crypto';
import type { LoginInput, RegisterInput } from './schemas';

// ─── Argon2id parameters (OWASP recommended minimums) ────────────────────────
const ARGON2_OPTIONS: argon2.Options & { raw: false } = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
  raw: false,
};

// ─── JWT helpers ─────────────────────────────────────────────────────────────

function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_PRIVATE_KEY_BASE64, {
    algorithm: 'RS256',
    expiresIn: '15m',
  });
}

export function verifyAccessToken(token: string): { sub: string } {
  const payload = jwt.verify(token, env.JWT_PUBLIC_KEY_BASE64, { algorithms: ['RS256'] });
  if (typeof payload === 'string' || !payload.sub) throw ApiError.unauthorized();
  return { sub: payload.sub };
}

// ─── Refresh token helpers ────────────────────────────────────────────────────

async function issueTokenPair(
  userId: string,
  familyId: string,
  deviceInfo?: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const rawRefreshToken = randomUUID();
  const tokenHash = sha256(rawRefreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: { userId, tokenHash, familyId, deviceInfo: deviceInfo ?? null, expiresAt },
  });

  return { accessToken: signAccessToken(userId), refreshToken: rawRefreshToken };
}

async function revokeFamily(familyId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { familyId },
    data: { revokedAt: new Date() },
  });
}

// ─── Public service functions ─────────────────────────────────────────────────

export async function register(
  input: RegisterInput,
  ip?: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const emailHash = hmac(input.email, env.FIELD_HMAC_KEY);
  const existing = await prisma.user.findUnique({ where: { emailHash } });

  if (existing) {
    // Constant-time response — do not reveal whether email exists
    await argon2.hash('dummy_password_timing_guard', ARGON2_OPTIONS);
    throw ApiError.conflict('Email already registered', 'EMAIL_TAKEN');
  }

  const passwordHash = await argon2.hash(input.password, ARGON2_OPTIONS);
  const encryptedEmail = encrypt(input.email, env.FIELD_ENCRYPTION_KEY);

  const user = await prisma.user.create({
    data: { email: encryptedEmail, emailHash, passwordHash },
  });

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'REGISTER', ip: ip ?? null },
  });

  return issueTokenPair(user.id, randomUUID());
}

export async function login(
  input: LoginInput,
  ip?: string,
  deviceInfo?: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const emailHash = hmac(input.email, env.FIELD_HMAC_KEY);
  const user = await prisma.user.findUnique({ where: { emailHash } });

  // Always hash to prevent timing oracle even when user does not exist
  const passwordToVerify = user?.passwordHash ?? 'dummy_hash_$argon2id$v=19$m=65536,t=3,p=4';

  let valid = false;
  try {
    valid = await argon2.verify(passwordToVerify, input.password);
  } catch {
    // Treat verification errors as invalid credentials
  }

  if (!user || user.deletedAt || !valid) {
    logger.warn('Failed login attempt', { ip, emailHash });
    await prisma.auditLog.create({
      data: { userId: user?.id ?? null, action: 'LOGIN_FAILED', ip: ip ?? null },
    });
    throw ApiError.unauthorized('Invalid credentials');
  }

  const result = await issueTokenPair(user.id, randomUUID(), deviceInfo);

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'LOGIN_SUCCESS', ip: ip ?? null },
  });

  return result;
}

export async function refresh(
  rawToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenHash = sha256(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  if (stored.revokedAt) {
    // Token reuse detected — revoke entire family to protect the account
    logger.warn('Refresh token reuse detected — revoking family', { familyId: stored.familyId });
    await revokeFamily(stored.familyId);
    throw ApiError.unauthorized('Refresh token already used');
  }

  // Rotate: revoke current token and issue a new pair in the same family
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

  return issueTokenPair(stored.userId, stored.familyId, stored.deviceInfo ?? undefined);
}

export async function logout(rawToken: string): Promise<void> {
  const tokenHash = sha256(rawToken);
  await prisma.refreshToken
    .update({ where: { tokenHash }, data: { revokedAt: new Date() } })
    .catch(() => undefined); // Silently ignore if token not found
}

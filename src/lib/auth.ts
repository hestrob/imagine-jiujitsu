import { cookies } from "next/headers";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { Sessions, Users, type UserRow } from "./db";

const COOKIE = "ijj_session";
const WEEK = 7 * 24 * 60 * 60 * 1000;
const DUMMY_SALT = randomBytes(16).toString("hex");

// Brute-force rate limiter (5 failed attempts within 15 minutes -> 15 minute lockout)
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; firstAttemptAt: number; lockedUntil?: number }>();

const WEAK_PASSWORDS = new Set([
  "password",
  "password1",
  "12345678",
  "123456789",
  "qwerty123",
  "osss",
  "osssssss",
  "jiujitsu",
]);

export function validatePasswordStrength(password: string): string | null {
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (password.length > 128) {
    return "Password must be 128 characters or fewer.";
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase().trim())) {
    return "Please choose a stronger, less common password.";
  }
  return null;
}

export function checkLoginRateLimit(identifier: string): { allowed: boolean; retryAfterMinutes?: number } {
  const key = identifier.toLowerCase().trim();
  const entry = loginAttempts.get(key);
  if (!entry) return { allowed: true };

  const now = Date.now();
  if (entry.lockedUntil && entry.lockedUntil > now) {
    const retryAfterMinutes = Math.max(1, Math.ceil((entry.lockedUntil - now) / 60000));
    return { allowed: false, retryAfterMinutes };
  }

  if (now - entry.firstAttemptAt > LOCKOUT_WINDOW_MS) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(identifier: string) {
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  const existing = loginAttempts.get(key);

  if (!existing || now - existing.firstAttemptAt > LOCKOUT_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }

  const nextCount = existing.count + 1;
  loginAttempts.set(key, {
    count: nextCount,
    firstAttemptAt: existing.firstAttemptAt,
    lockedUntil: nextCount >= MAX_LOGIN_ATTEMPTS ? now + LOCKOUT_WINDOW_MS : undefined,
  });
}

export function clearLoginAttempts(identifier: string) {
  loginAttempts.delete(identifier.toLowerCase().trim());
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  try {
    const candidate = scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(key, "hex");
    if (candidate.length !== storedBuf.length) return false;
    return timingSafeEqual(candidate, storedBuf);
  } catch {
    return false;
  }
}

export function verifyPasswordDummy(password: string) {
  // Constant-time work when user email does not exist to prevent timing enumeration
  scryptSync(password, DUMMY_SALT, 64);
}

export async function createSession(userId: string) {
  const session = Sessions.create(userId, new Date(Date.now() + WEEK));
  cookies().set(COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(session.expiresAt),
    path: "/",
  });
  return session.id;
}

export async function destroySession() {
  const id = cookies().get(COOKIE)?.value;
  if (id) Sessions.destroy(id);
  cookies().delete(COOKIE);
}

export async function currentSessionId(): Promise<string | undefined> {
  return cookies().get(COOKIE)?.value;
}

export async function currentUser(): Promise<UserRow | null> {
  const id = cookies().get(COOKIE)?.value;
  if (!id) return null;
  const session = Sessions.get(id);
  if (!session || new Date(session.expiresAt) < new Date()) return null;
  return Users.byId(session.userId) ?? null;
}

export async function requireAdmin(): Promise<UserRow> {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Admin only");
  return user;
}


import { cookies } from "next/headers";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { Sessions, Users, type UserRow } from "./db";

const COOKIE = "ijj_session";
const WEEK = 7 * 24 * 60 * 60 * 1000;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(key, "hex"));
}

export async function createSession(userId: string) {
  const session = Sessions.create(userId, new Date(Date.now() + WEEK));
  cookies().set(COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(session.expiresAt),
    path: "/",
  });
}

export async function destroySession() {
  const id = cookies().get(COOKIE)?.value;
  if (id) Sessions.destroy(id);
  cookies().delete(COOKIE);
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

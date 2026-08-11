"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AttendanceRepo, Competitions, Gallery, Inquiries, Settings, Users,
} from "@/lib/db";
import {
  createSession, destroySession, hashPassword, requireAdmin, verifyPassword,
} from "@/lib/auth";

// ---------- Auth ----------

export async function signIn(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const user = Users.byEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Email or password doesn't match." };
  }
  await createSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/portal");
}

export async function signUp(_prev: { error?: string } | undefined, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  if (!name || !email || password.length < 6) {
    return { error: "Fill in your name and email, and pick a password of 6+ characters." };
  }
  if (Users.byEmail(email)) return { error: "That email already has an account. Sign in instead." };
  const user = Users.create({ name, email, passwordHash: hashPassword(password) });
  await createSession(user.id);
  redirect("/portal");
}

export async function signOut() {
  await destroySession();
  redirect("/");
}

// ---------- Public ----------

export async function submitInquiry(_prev: { ok?: boolean; error?: string } | undefined, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!name || !email) return { error: "Name and email are required." };
  Inquiries.create({ name, email, phone, message });
  return { ok: true };
}

// ---------- Admin: settings ----------

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  const keys = [
    "videoUrl", "address", "phone", "email",
    "facebook", "instagram", "yelp",
    "coachName", "coachBio", "schedule",
  ];
  for (const key of keys) {
    const value = formData.get(key);
    if (value !== null) Settings.set(key, String(value));
  }
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

// ---------- Admin: gallery ----------

export async function uploadPhoto(formData: FormData) {
  await requireAdmin();
  const file = formData.get("photo") as File | null;
  const caption = String(formData.get("caption") || "");
  if (!file || file.size === 0) return;
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  if (![".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)) return;
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(process.cwd(), "public", "uploads", filename), buffer);
  Gallery.create(`/uploads/${filename}`, caption);
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function deletePhoto(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) Gallery.delete(id);
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

// ---------- Admin: roster / promotions ----------

export async function promoteStudent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const belt = String(formData.get("belt") || "WHITE");
  const stripes = Math.max(0, Math.min(4, Number(formData.get("stripes") || 0)));
  const subscriptionStatus = String(formData.get("subscriptionStatus") || "TRIAL");
  if (id) Users.updateRank(id, belt, stripes, subscriptionStatus);
  revalidatePath("/admin/roster");
}

export async function addCompetition(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  const name = String(formData.get("name") || "").trim();
  const date = new Date(String(formData.get("date") || Date.now()));
  const division = String(formData.get("division") || "");
  const result = String(formData.get("result") || "Competed");
  if (!userId || !name) return;
  Competitions.create({ userId, name, date, division, result });
  revalidatePath("/admin/roster");
}

// ---------- Admin: attendance ----------

export async function checkIn(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  const classLabel = String(formData.get("classLabel") || "Open Mat");
  if (userId) AttendanceRepo.create(userId, classLabel);
  revalidatePath("/admin/attendance");
}

export async function undoCheckIn(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) AttendanceRepo.delete(id);
  revalidatePath("/admin/attendance");
}

export async function markInquiryHandled(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) Inquiries.markHandled(id);
  revalidatePath("/admin/inquiries");
}

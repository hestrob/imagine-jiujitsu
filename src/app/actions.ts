"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AttendanceRepo, Broadcasts, Competitions, Gallery, Inquiries, Settings, Users,
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

export async function submitInquiry(_prev: { ok?: boolean; mailtoUrl?: string; error?: string } | undefined, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!name || !email) return { error: "Name and email are required." };

  Inquiries.create({ name, email, phone, message });

  const targetEmail = Settings.all().email || "imagineawebsite@gmail.com";

  // Try sending email via Resend API if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Imagine Jiu Jitsu <onboarding@resend.dev>",
          to: [targetEmail],
          subject: `🥋 New Free Class Request: ${name}`,
          html: `
            <h2>New Free Class Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone ? `<a href="tel:${phone}">${phone}</a>` : "Not provided"}</p>
            <p><strong>Message:</strong> ${message || "No message"}</p>
          `,
        }),
      });
    } catch (err) {
      console.error("Resend notification error:", err);
    }
  }

  const subject = encodeURIComponent(`Free Class Booking Request - ${name}`);
  const body = encodeURIComponent(`Hi Coach Sean,\n\nI would like to book a free class at Imagine Jiu Jitsu.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nMessage: ${message || "N/A"}\n\nThanks!`);
  const mailtoUrl = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

  return { ok: true, mailtoUrl };
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

// ---------- Admin: member groups & management ----------

export async function changeStudentGroup(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const group = String(formData.get("group") || "Adults");
  if (id) {
    Users.updateGroup(id, group);
    revalidatePath("/admin/roster");
    revalidatePath("/admin/broadcast");
  }
}

export async function updateStudentDetails(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const phone = String(formData.get("phone") || "").trim();
  const group = String(formData.get("group") || "Adults");
  const belt = String(formData.get("belt") || "WHITE");
  const stripes = Math.max(0, Math.min(4, Number(formData.get("stripes") || 0)));
  const subscriptionStatus = String(formData.get("subscriptionStatus") || "TRIAL");

  Users.updateDetails(id, { name, email, phone, group, belt, stripes, subscriptionStatus });
  revalidatePath("/admin/roster");
  revalidatePath("/admin/broadcast");
}

export async function addStudentMember(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const phone = String(formData.get("phone") || "").trim();
  const group = String(formData.get("group") || "Adults");
  const belt = String(formData.get("belt") || "WHITE");
  const stripes = Math.max(0, Math.min(4, Number(formData.get("stripes") || 0)));
  const subscriptionStatus = String(formData.get("subscriptionStatus") || "ACTIVE");

  if (!name || !email) return { error: "Name and email are required." };

  Users.create({
    name,
    email,
    phone,
    group,
    passwordHash: hashPassword("osss"),
  });

  const student = Users.byEmail(email);
  if (student) {
    Users.updateRank(student.id, belt, stripes, subscriptionStatus);
  }

  revalidatePath("/admin/roster");
  revalidatePath("/admin/broadcast");
}

// ---------- Admin: broadcasts & alerts ----------

export async function sendBroadcast(_prev: { ok?: boolean; error?: string; count?: number } | undefined, formData: FormData) {
  await requireAdmin();
  const targetGroup = String(formData.get("targetGroup") || "ALL");
  const channel = String(formData.get("channel") || "ALL");
  const title = String(formData.get("title") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const isScheduleChange = formData.get("isScheduleChange") === "true";
  const selectedIdsRaw = String(formData.get("selectedMemberIds") || "").trim();

  if (!title || !message) {
    return { error: "Title and message content are required." };
  }

  let recipients = Users.byGroup(targetGroup);
  if (selectedIdsRaw) {
    const idSet = new Set(selectedIdsRaw.split(",").map((id) => id.trim()).filter(Boolean));
    if (idSet.size > 0) {
      recipients = recipients.filter((r) => idSet.has(r.id));
    }
  }
  const recipientCount = recipients.length;

  if (recipientCount === 0) {
    return { error: `No members selected in group "${targetGroup}".` };
  }

  // 1. Send via Resend (Email) if configured
  if ((channel === "EMAIL" || channel === "ALL") && process.env.RESEND_API_KEY) {
    const emails = recipients.map((r) => r.email).filter(Boolean);
    if (emails.length > 0) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Imagine Jiu Jitsu <alerts@imaginejiujitsu.com>",
            to: emails,
            subject: `[Imagine JJ] ${title}`,
            text: message,
          }),
        });
      } catch (err) {
        console.error("Resend broadcast error:", err);
      }
    }
  }

  // 2. Send via Twilio (SMS) if configured
  if ((channel === "SMS" || channel === "ALL") && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const phones = recipients.map((r) => r.phone).filter(Boolean);
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
    for (const phone of phones) {
      try {
        const cleanPhone = phone.replace(/[^0-9+]/g, "");
        if (!cleanPhone) continue;
        const bodyParams = new URLSearchParams({
          To: cleanPhone.startsWith("+") ? cleanPhone : `+1${cleanPhone}`,
          From: process.env.TWILIO_FROM_PHONE || "",
          Body: `[Imagine Jiu Jitsu] ${title}: ${message}`,
        });
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyParams.toString(),
        });
      } catch (err) {
        console.error("Twilio SMS send error:", err);
      }
    }
  }

  // 3. Log broadcast history (also visible in-app on member portal)
  Broadcasts.create({
    targetGroup,
    channel,
    title,
    message,
    recipientCount,
    recipientNames: recipients.map((r) => r.name),
    isScheduleChange,
  });

  revalidatePath("/admin/broadcast");
  revalidatePath("/admin/schedule");
  revalidatePath("/portal");
  return { ok: true, count: recipientCount };
}

// ---------- Admin: schedule & group members console ----------

export async function saveScheduleConsole(
  _prev: { ok?: boolean; notifiedCount?: number; message?: string; error?: string } | undefined,
  formData: FormData
) {
  await requireAdmin();
  const scheduleRaw = String(formData.get("schedule") || "").trim();
  const notifyMembers = formData.get("notifyMembers") === "true";

  Settings.set("schedule", scheduleRaw);

  let notifiedCount = 0;
  if (notifyMembers) {
    const targetGroup = String(formData.get("targetGroup") || "ALL");
    const channel = String(formData.get("channel") || "ALL");
    const title = String(formData.get("title") || "Schedule Update").trim();
    const message = String(formData.get("message") || "").trim();
    const selectedIdsRaw = String(formData.get("selectedMemberIds") || "").trim();

    if (!message) {
      revalidatePath("/", "layout");
      return { error: "Schedule saved, but please enter a message to notify group members." };
    }

    let recipients = Users.byGroup(targetGroup);
    if (selectedIdsRaw) {
      const idSet = new Set(selectedIdsRaw.split(",").map((id) => id.trim()).filter(Boolean));
      recipients = recipients.filter((r) => idSet.has(r.id));
    }
    notifiedCount = recipients.length;

    if (notifiedCount > 0) {
      // Send via Resend (Email) if configured
      if ((channel === "EMAIL" || channel === "ALL") && process.env.RESEND_API_KEY) {
        const emails = recipients.map((r) => r.email).filter(Boolean);
        if (emails.length > 0) {
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "Imagine Jiu Jitsu <alerts@imaginejiujitsu.com>",
                to: emails,
                subject: `[Imagine JJ Schedule] ${title}`,
                text: message,
              }),
            });
          } catch (err) {
            console.error("Resend schedule alert error:", err);
          }
        }
      }

      // Send via Twilio (SMS) if configured
      if ((channel === "SMS" || channel === "ALL") && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const phones = recipients.map((r) => r.phone).filter(Boolean);
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
        for (const phone of phones) {
          try {
            const cleanPhone = phone.replace(/[^0-9+]/g, "");
            if (!cleanPhone) continue;
            const bodyParams = new URLSearchParams({
              To: cleanPhone.startsWith("+") ? cleanPhone : `+1${cleanPhone}`,
              From: process.env.TWILIO_FROM_PHONE || "",
              Body: `[Imagine Jiu Jitsu] ${title}: ${message}`,
            });
            await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
              method: "POST",
              headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: bodyParams.toString(),
            });
          } catch (err) {
            console.error("Twilio SMS schedule alert error:", err);
          }
        }
      }

      Broadcasts.create({
        targetGroup,
        channel,
        title,
        message,
        recipientCount: notifiedCount,
        recipientNames: recipients.map((r) => r.name),
        isScheduleChange: true,
      });
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/schedule");
  revalidatePath("/portal");
  revalidatePath("/admin/schedule");
  revalidatePath("/admin/broadcast");
  revalidatePath("/admin/settings");

  return {
    ok: true,
    notifiedCount,
    message: notifyMembers
      ? `Schedule updated and notification sent to ${notifiedCount} member${notifiedCount === 1 ? "" : "s"} in the app!`
      : "Schedule updated across the site and member portal!",
  };
}


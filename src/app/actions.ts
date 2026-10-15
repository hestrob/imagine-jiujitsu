"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AttendanceRepo, Broadcasts, Competitions, Gallery, Inquiries, Settings, Users, uid,
} from "@/lib/db";
import {
  createSession, currentUser, destroySession, hashPassword, requireAdmin, verifyPassword,
} from "@/lib/auth";
import { calculateAge, suggestGroupFromAge } from "@/lib/belts";
import { provisionWoodlandTrialNumber, sendTwilioBulkSms } from "@/lib/twilio";

export type OnboardStudentPayload = {
  name: string;
  dob: string;
  group: string;
  memberType: "NEW" | "EXISTING";
  belt: string;
  stripes: number;
  startDate?: string;
  studentEmail?: string;
  studentPhone?: string;
  medicalNotes?: string;
};

export type OnboardingActionState = {
  ok?: boolean;
  error?: string;
  onboarded?: {
    id: string;
    name: string;
    dob: string;
    age: number | null;
    group: string;
    belt: string;
    stripes: number;
    memberType: "NEW" | "EXISTING";
    parentName?: string;
    phone: string;
    email: string;
  }[];
};

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

export async function submitOnboarding(
  _prev: OnboardingActionState | undefined,
  formData: FormData
): Promise<OnboardingActionState> {
  const parentName = String(formData.get("parentName") || "").trim();
  const parentPhone = String(formData.get("parentPhone") || "").trim();
  const parentEmail = String(formData.get("parentEmail") || "").toLowerCase().trim();
  const passwordRaw = String(formData.get("password") || "").trim();
  const studentsJson = String(formData.get("studentsJson") || "[]");

  let studentsInput: OnboardStudentPayload[] = [];
  try {
    studentsInput = JSON.parse(studentsJson);
  } catch {
    return { error: "Invalid student form data. Please try again." };
  }

  if (!Array.isArray(studentsInput) || studentsInput.length === 0) {
    return { error: "Please add at least one student to onboard." };
  }

  for (let i = 0; i < studentsInput.length; i++) {
    const s = studentsInput[i];
    if (!s.name || !s.name.trim()) {
      return { error: `Please enter a full name for Student #${i + 1}.` };
    }
    if (!s.dob || !s.dob.trim()) {
      return { error: `Please enter a Date of Birth (DOB) for ${s.name.trim()}.` };
    }
  }

  const hasMinor = studentsInput.some((s) => {
    const age = calculateAge(s.dob);
    return age !== null && age < 18;
  });

  if (hasMinor && !parentName) {
    return { error: "Parent / Guardian full name is required for students under 18." };
  }

  if (!parentPhone) {
    return { error: "A primary / parent phone number is required for billing and schedule alerts." };
  }

  if (!parentEmail) {
    return { error: "A primary / billing email address is required." };
  }

  const familyId = studentsInput.length > 1 || parentName ? uid() : undefined;
  const pwHash = hashPassword(passwordRaw.length >= 6 ? passwordRaw : "osss");
  const existingRoster = Users.students();
  const onboardedList: NonNullable<OnboardingActionState["onboarded"]> = [];

  for (const s of studentsInput) {
    const cleanName = s.name.trim();
    const age = calculateAge(s.dob);
    const isMinor = age !== null && age < 18;
    const assignedGroup = s.group || suggestGroupFromAge(age);
    const effectiveEmail = (s.studentEmail?.trim() || parentEmail).toLowerCase();
    const effectivePhone = s.studentPhone?.trim() || parentPhone;
    const memberType = s.memberType === "EXISTING" ? "EXISTING" : "NEW";
    const belt = memberType === "EXISTING" ? s.belt || "WHITE" : "WHITE";
    const stripes = memberType === "EXISTING" ? Math.max(0, Math.min(4, Number(s.stripes || 0))) : 0;
    const joinedAt =
      memberType === "EXISTING" && s.startDate
        ? new Date(s.startDate).toISOString()
        : new Date().toISOString();
    const subscriptionStatus = memberType === "EXISTING" ? "ACTIVE" : "TRIAL";

    // Check if an existing student with the same name is already on the roster so we update instead of duplicating
    const matchByName = existingRoster.find(
      (u) => u.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (matchByName) {
      Users.updateDetails(matchByName.id, {
        name: cleanName,
        email: effectiveEmail,
        phone: effectivePhone,
        group: assignedGroup,
        belt,
        stripes,
        subscriptionStatus,
        dob: s.dob,
        parentName: isMinor || parentName ? parentName : undefined,
        parentPhone,
        parentEmail,
        medicalNotes: s.medicalNotes?.trim() || undefined,
      });
      onboardedList.push({
        id: matchByName.id,
        name: cleanName,
        dob: s.dob,
        age,
        group: assignedGroup,
        belt,
        stripes,
        memberType,
        parentName: isMinor || parentName ? parentName : undefined,
        phone: effectivePhone,
        email: effectiveEmail,
      });
    } else {
      const created = Users.create({
        name: cleanName,
        email: effectiveEmail,
        phone: effectivePhone,
        passwordHash: pwHash,
        group: assignedGroup,
        belt,
        stripes,
        joinedAt,
        subscriptionStatus,
        dob: s.dob,
        parentName: isMinor || parentName ? parentName : undefined,
        parentPhone,
        parentEmail,
        medicalNotes: s.medicalNotes?.trim() || undefined,
        familyId,
        memberType,
      });
      onboardedList.push({
        id: created.id,
        name: created.name,
        dob: s.dob,
        age,
        group: assignedGroup,
        belt,
        stripes,
        memberType,
        parentName: isMinor || parentName ? parentName : undefined,
        phone: effectivePhone,
        email: effectiveEmail,
      });
    }
  }

  // If submitted by a public user (not signed in as Admin), sign them into their student portal session
  const viewer = await currentUser();
  if (!viewer && onboardedList.length > 0) {
    await createSession(onboardedList[0].id);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/roster");
  revalidatePath("/admin/broadcast");
  revalidatePath("/admin/schedule");
  revalidatePath("/portal");

  return { ok: true, onboarded: onboardedList };
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

  // Try sending SMS alert to Coach Sean via Twilio if configured
  const adminPhone = Settings.all().phone || "(530) 520-3266";
  if (adminPhone) {
    try {
      await sendTwilioBulkSms(
        [adminPhone],
        `[Imagine JJ New Inquiry] ${name} (${phone || email}): ${message || "Requested a free trial class."}`
      );
    } catch (err) {
      console.error("Twilio inquiry notification error:", err);
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
    "twilioFromPhone", "twilioAccountSid", "twilioAuthToken",
  ];
  for (const key of keys) {
    const value = formData.get(key);
    if (value !== null) Settings.set(key, String(value).trim());
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/broadcast");
  revalidatePath("/admin/schedule");
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
  const group = String(formData.get("group") || "Adults (13+)");
  if (id) {
    Users.updateGroup(id, group);
    revalidatePath("/admin/roster");
    revalidatePath("/admin/broadcast");
    revalidatePath("/admin/schedule");
    revalidatePath("/admin");
    revalidatePath("/portal");
  }
}

export async function updateStudentDetails(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const phone = String(formData.get("phone") || "").trim();
  const group = String(formData.get("group") || "Adults (13+)");
  const belt = String(formData.get("belt") || "WHITE");
  const stripes = Math.max(0, Math.min(4, Number(formData.get("stripes") || 0)));
  const subscriptionStatus = String(formData.get("subscriptionStatus") || "TRIAL");
  const dob = String(formData.get("dob") || "").trim();
  const parentName = String(formData.get("parentName") || "").trim();
  const parentPhone = String(formData.get("parentPhone") || "").trim();
  const parentEmail = String(formData.get("parentEmail") || "").toLowerCase().trim();
  const medicalNotes = String(formData.get("medicalNotes") || "").trim();

  Users.updateDetails(id, {
    name,
    email,
    phone: phone || parentPhone,
    group,
    belt,
    stripes,
    subscriptionStatus,
    dob: dob || undefined,
    parentName: parentName || undefined,
    parentPhone: parentPhone || undefined,
    parentEmail: parentEmail || undefined,
    medicalNotes: medicalNotes || undefined,
  });
  revalidatePath("/admin/roster");
  revalidatePath("/admin/broadcast");
  revalidatePath("/admin/schedule");
  revalidatePath("/admin");
  revalidatePath("/portal");
}

export async function addStudentMember(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const phone = String(formData.get("phone") || "").trim();
  const group = String(formData.get("group") || "Adults (13+)");
  const belt = String(formData.get("belt") || "WHITE");
  const stripes = Math.max(0, Math.min(4, Number(formData.get("stripes") || 0)));
  const subscriptionStatus = String(formData.get("subscriptionStatus") || "ACTIVE");
  const dob = String(formData.get("dob") || "").trim();
  const parentName = String(formData.get("parentName") || "").trim();
  const parentPhone = String(formData.get("parentPhone") || "").trim();
  const parentEmail = String(formData.get("parentEmail") || "").toLowerCase().trim();
  const medicalNotes = String(formData.get("medicalNotes") || "").trim();
  const memberType = String(formData.get("memberType") || "NEW") === "EXISTING" ? "EXISTING" : "NEW";

  if (!name || !(email || parentEmail)) return { error: "Name and email are required." };

  Users.create({
    name,
    email: email || parentEmail,
    phone: phone || parentPhone,
    group,
    belt,
    stripes,
    subscriptionStatus,
    dob: dob || undefined,
    parentName: parentName || undefined,
    parentPhone: parentPhone || phone || undefined,
    parentEmail: parentEmail || email || undefined,
    medicalNotes: medicalNotes || undefined,
    memberType,
    passwordHash: hashPassword("osss"),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/roster");
  revalidatePath("/admin/broadcast");
}

// ---------- Admin: broadcasts & alerts ----------

export async function sendBroadcast(
  _prev:
    | {
        ok?: boolean;
        error?: string;
        count?: number;
        smsSent?: number;
        smsFailed?: number;
        smsWarning?: string;
      }
    | undefined,
  formData: FormData
) {
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
  let smsSent = 0;
  let smsFailed = 0;
  let smsWarning: string | undefined;

  if (channel === "SMS" || channel === "ALL") {
    const phones = recipients.map((r) => r.phone || r.parentPhone || "").filter(Boolean);
    const smsRes = await sendTwilioBulkSms(phones, `[Imagine Jiu Jitsu] ${title}: ${message}`);
    smsSent = smsRes.sent;
    smsFailed = smsRes.failed;
    if (smsRes.errors.length > 0) {
      smsWarning = smsRes.errors[0];
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
  return { ok: true, count: recipientCount, smsSent, smsFailed, smsWarning };
}

export async function claimTwilioNumberAction() {
  await requireAdmin();
  const res = await provisionWoodlandTrialNumber();
  revalidatePath("/admin/broadcast");
  revalidatePath("/admin/settings");
  return res;
}

export async function sendTestSmsAction(
  _prev: { ok?: boolean; message?: string; error?: string } | undefined,
  formData: FormData
) {
  await requireAdmin();
  const toPhone = String(formData.get("toPhone") || "").trim();
  const testBody =
    String(formData.get("testBody") || "").trim() ||
    "🥋 Test SMS from Imagine Jiu Jitsu Woodland! Your Twilio SMS alerts are live.";

  if (!toPhone) {
    return { error: "Please enter a recipient phone number." };
  }

  const res = await sendTwilioBulkSms([toPhone], testBody);
  revalidatePath("/admin/broadcast");
  revalidatePath("/admin/settings");

  if (res.sent > 0) {
    return {
      ok: true,
      message: `Test SMS sent to ${toPhone} from ${res.fromPhone}!`,
    };
  }
  return {
    error:
      res.errors[0] ||
      "Failed to send test SMS. Make sure you have claimed your free trial phone number and verified the recipient phone number in Twilio.",
  };
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
  let smsSummary = "";
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
      if (channel === "SMS" || channel === "ALL") {
        const phones = recipients.map((r) => r.phone || r.parentPhone || "").filter(Boolean);
        const smsRes = await sendTwilioBulkSms(phones, `[Imagine Jiu Jitsu] ${title}: ${message}`);
        if (smsRes.sent > 0) {
          smsSummary = ` (${smsRes.sent} Twilio SMS delivered)`;
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
      ? `Schedule updated and notification sent to ${notifiedCount} member${notifiedCount === 1 ? "" : "s"} in the app${smsSummary}!`
      : "Schedule updated across the site and member portal!",
  };
}


import { randomUUID, scryptSync, randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { GROUPS, type MemberGroup, type BroadcastRow } from "./constants";

export { GROUPS, type MemberGroup, type BroadcastRow };

export type UserRow = {
  id: string;
  email: string;
  phone: string;
  passwordHash: string;
  name: string;
  role: string;
  group: string; // "Kids (5-6)" | "Juniors (7-12)" | "Adults (13+)"
  belt: string;
  stripes: number;
  promotedAt: string;
  joinedAt: string;
  subscriptionStatus: string; // "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED"
  dob?: string; // YYYY-MM-DD
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  medicalNotes?: string;
  familyId?: string;
  memberType?: "NEW" | "EXISTING";
  waiverSignedAt?: string;
  waiverSignerName?: string;
  termsAcceptedAt?: string;
  resetTokenHash?: string;
  resetTokenExpiresAt?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
};

export type AttendanceRow = { id: string; userId: string; date: string; classLabel: string };
export type CompetitionRow = { id: string; userId: string; date: string; name: string; division: string; result: string };
export type GalleryRow = { id: string; src: string; caption: string; sortOrder: number; createdAt: string };
export type InquiryRow = { id: string; name: string; email: string; phone: string; message: string; handled: number; createdAt: string };

export const uid = () => randomUUID();
export const nowIso = () => new Date().toISOString();

const hashPw = (pw: string) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
};

type GlobalDataStore = {
  users: UserRow[];
  sessions: { id: string; userId: string; expiresAt: string }[];
  attendance: AttendanceRow[];
  competitions: CompetitionRow[];
  gallery: GalleryRow[];
  inquiries: InquiryRow[];
  broadcasts: BroadcastRow[];
  settings: Record<string, string>;
  lastHydratedAt?: number;
  schemaInitialized?: boolean;
};

const g = globalThis as unknown as {
  __dbStore?: GlobalDataStore;
  __pendingDbWrites?: Promise<unknown>[];
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

function queueWrite(fn: () => Promise<unknown>) {
  if (!process.env.DATABASE_URL) return;
  if (!g.__pendingDbWrites) g.__pendingDbWrites = [];
  const p = fn().catch((err) => {
    console.error("Neon DB write error:", err);
  });
  g.__pendingDbWrites.push(p);
}

export async function flushDbWrites() {
  if (!g.__pendingDbWrites || g.__pendingDbWrites.length === 0) return;
  const pending = g.__pendingDbWrites.splice(0, g.__pendingDbWrites.length);
  await Promise.all(pending);
}

const LEGACY_GROUP_MAP: Record<string, string> = {
  Kids: "Kids (5-6)",
  "Competition Team": "Juniors (7-12)",
  Adults: "Adults (13+)",
};

const DEMO_EMAILS = new Set([
  "maya@demo.test",
  "jordan@demo.test",
  "sam@demo.test",
  "riley@demo.test",
  "leo@demo.test",
  "elena@demo.test",
]);

function getDefaultGallery(): GalleryRow[] {
  return [
    { id: uid(), src: "/photos/team-gi.jpg", caption: "Adult Gi Team — Coach Sean & the room on the mat", sortOrder: 0, createdAt: nowIso() },
    { id: uid(), src: "/photos/team-nogi.jpg", caption: "No-Gi Squad — Friday night pressure & live rounds", sortOrder: 1, createdAt: nowIso() },
    { id: uid(), src: "/photos/coach-coaching.jpg", caption: "Coach Sean breaking down back-control defense", sortOrder: 2, createdAt: nowIso() },
    { id: uid(), src: "/photos/kids-lineup.jpg", caption: "Youth & Juniors Gi class — building confidence from day one", sortOrder: 3, createdAt: nowIso() },
    { id: uid(), src: "/photos/nogi-takedown.jpg", caption: "Standup & takedown entries during No-Gi training", sortOrder: 4, createdAt: nowIso() },
    { id: uid(), src: "/photos/mat-respect.jpg", caption: "Ego-free culture — slap, bump, and train hard", sortOrder: 5, createdAt: nowIso() },
    { id: uid(), src: "/photos/kids-warmup.jpg", caption: "Kids & Juniors mat movement, balance, and fundamentals", sortOrder: 6, createdAt: nowIso() },
    { id: uid(), src: "/photos/nogi-pressure.jpg", caption: "Top pressure & guard passing in live No-Gi rounds", sortOrder: 7, createdAt: nowIso() },
    { id: uid(), src: "/photos/coach-standing.jpg", caption: "Coach Sean watching live Gi rounds under the lineage wall", sortOrder: 8, createdAt: nowIso() },
    { id: uid(), src: "/photos/kids-rolling.jpg", caption: "Juniors Gi positional sparring and guard work", sortOrder: 9, createdAt: nowIso() },
    { id: uid(), src: "/photos/nogi-sub.jpg", caption: "Submission hunting and control in No-Gi", sortOrder: 10, createdAt: nowIso() },
    { id: uid(), src: "/photos/class-circle.jpg", caption: "Post-class lineup on the Woodland mat", sortOrder: 11, createdAt: nowIso() },
  ];
}

function getDefaultSettings(): Record<string, string> {
  return {
    videoUrl: "https://www.youtube.com/embed/2fbLKPvmDws",
    address: "2548 Allen Cir, Woodland, CA 95776",
    phone: "(530) 520-3266",
    email: "imagineawebsite@gmail.com",
    facebook: "https://www.facebook.com/people/Imagine-Jiu-Jitsu/61566902831513/",
    instagram: "",
    yelp: "https://www.yelp.com/biz/imagine-jiu-jitsu-woodland",
    coachName: "Coach Sean",
    coachBio:
      "Coach Sean leads every class at Imagine with the same philosophy: a clean, welcoming space where anyone can train hard and grow. Traditional roots, Brazilian Jiu Jitsu pressure, and a community that shows up for each other.",
    schedule: [
      "Monday|5:00 – 6:00 PM|Juniors Gi & Technique|Juniors (7-12)|",
      "Monday|6:00 – 7:30 PM|Fundamentals + Rolling|Adults (13+)|",
      "Wednesday|4:30 – 5:20 PM|Kids Self Defense & Balance|Kids (5-6)|",
      "Wednesday|5:30 – 6:20 PM|Juniors Gi & Positional Drilling|Juniors (7-12)|",
      "Wednesday|6:30 – 8:00 PM|All Levels Gi|Adults (13+)|",
      "Thursday|6:00 – 7:00 PM|Women's Only Jiu Jitsu|ALL|",
      "Friday|4:30 – 5:20 PM|Kids Self Defense & Balance|Kids (5-6)|",
      "Friday|5:30 – 6:20 PM|Juniors No-Gi & Live Rounds|Juniors (7-12)|",
      "Friday|6:30 – 8:00 PM|No-Gi + Open Mat|Adults (13+)|",
      "Sunday|6:30 – 8:00 AM|Dawn Patrol Open Mat|ALL|",
    ].join("\n"),
  };
}

function migrateStoreGroups(s: GlobalDataStore) {
  const demoUserIds = new Set(
    s.users
      .filter((u) => DEMO_EMAILS.has(u.email.toLowerCase()) || u.email.endsWith("@demo.test"))
      .map((u) => u.id)
  );
  if (demoUserIds.size > 0) {
    s.users = s.users.filter((u) => !demoUserIds.has(u.id));
    s.attendance = s.attendance.filter((a) => !demoUserIds.has(a.userId));
    s.competitions = s.competitions.filter((c) => !demoUserIds.has(c.userId));
    s.sessions = s.sessions.filter((sess) => !demoUserIds.has(sess.userId));
    s.broadcasts = s.broadcasts.filter(
      (b) =>
        !b.recipientNames?.some((name) =>
          ["Maya R.", "Jordan P.", "Sam K.", "Riley T.", "Leo M.", "Elena V."].includes(name)
        )
    );
  }

  for (const u of s.users) {
    if (LEGACY_GROUP_MAP[u.group]) {
      u.group = LEGACY_GROUP_MAP[u.group];
    }
  }
  for (const b of s.broadcasts) {
    if (LEGACY_GROUP_MAP[b.targetGroup]) {
      b.targetGroup = LEGACY_GROUP_MAP[b.targetGroup];
    }
  }
  if (s.settings.schedule) {
    s.settings.schedule = s.settings.schedule
      .split("\n")
      .map((line) => {
        const parts = line.split("|");
        if (parts.length >= 4) {
          const grp = parts[3].trim();
          if (LEGACY_GROUP_MAP[grp]) {
            parts[3] = LEGACY_GROUP_MAP[grp];
          }
        }
        return parts.join("|");
      })
      .join("\n");
  }
  if (s.gallery.some((item) => item.src.startsWith("/photos/placeholder-"))) {
    s.gallery = getDefaultGallery();
  }
}

function getStore(): GlobalDataStore {
  if (g.__dbStore) {
    migrateStoreGroups(g.__dbStore);
    return g.__dbStore;
  }

  const adminId1 = uid();

  const initialUsers: UserRow[] = [
    {
      id: adminId1,
      email: "imagineawebsite@gmail.com",
      phone: "(530) 520-3266",
      passwordHash: hashPw(process.env.ADMIN_INITIAL_PASSWORD || "mat-admin-1"),
      name: "Coach Sean",
      role: "ADMIN",
      group: "Adults (13+)",
      belt: "BLACK",
      stripes: 0,
      promotedAt: nowIso(),
      joinedAt: nowIso(),
      subscriptionStatus: "ACTIVE",
    },
  ];

  g.__dbStore = {
    users: initialUsers,
    sessions: [],
    attendance: [],
    competitions: [],
    gallery: getDefaultGallery(),
    inquiries: [],
    broadcasts: [],
    settings: getDefaultSettings(),
  };

  return g.__dbStore;
}

const store = getStore();

async function upsertUserToNeon(u: UserRow) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO users (
      id, email, phone, password_hash, name, role, group_name, belt, stripes,
      promoted_at, joined_at, subscription_status, dob, parent_name, parent_phone,
      parent_email, medical_notes, family_id, member_type, waiver_signed_at,
      waiver_signer_name, terms_accepted_at, reset_token_hash, reset_token_expires_at,
      stripe_customer_id, stripe_subscription_id, current_period_end
    ) VALUES (
      ${u.id}, ${u.email}, ${u.phone || ""}, ${u.passwordHash}, ${u.name},
      ${u.role}, ${u.group}, ${u.belt}, ${u.stripes}, ${u.promotedAt},
      ${u.joinedAt}, ${u.subscriptionStatus}, ${u.dob ?? null}, ${u.parentName ?? null},
      ${u.parentPhone ?? null}, ${u.parentEmail ?? null}, ${u.medicalNotes ?? null},
      ${u.familyId ?? null}, ${u.memberType ?? "NEW"}, ${u.waiverSignedAt ?? null},
      ${u.waiverSignerName ?? null}, ${u.termsAcceptedAt ?? null},
      ${u.resetTokenHash ?? null}, ${u.resetTokenExpiresAt ?? null},
      ${u.stripeCustomerId ?? null}, ${u.stripeSubscriptionId ?? null},
      ${u.currentPeriodEnd ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      password_hash = EXCLUDED.password_hash,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      group_name = EXCLUDED.group_name,
      belt = EXCLUDED.belt,
      stripes = EXCLUDED.stripes,
      promoted_at = EXCLUDED.promoted_at,
      joined_at = EXCLUDED.joined_at,
      subscription_status = EXCLUDED.subscription_status,
      dob = EXCLUDED.dob,
      parent_name = EXCLUDED.parent_name,
      parent_phone = EXCLUDED.parent_phone,
      parent_email = EXCLUDED.parent_email,
      medical_notes = EXCLUDED.medical_notes,
      family_id = EXCLUDED.family_id,
      member_type = EXCLUDED.member_type,
      waiver_signed_at = EXCLUDED.waiver_signed_at,
      waiver_signer_name = EXCLUDED.waiver_signer_name,
      terms_accepted_at = EXCLUDED.terms_accepted_at,
      reset_token_hash = EXCLUDED.reset_token_hash,
      reset_token_expires_at = EXCLUDED.reset_token_expires_at,
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      current_period_end = EXCLUDED.current_period_end
  `;
}

export async function ensureDbReady(force = false) {
  await flushDbWrites();
  const sql = getSql();
  if (!sql) return;

  const now = Date.now();
  if (!force && store.lastHydratedAt && now - store.lastHydratedAt < 1500) {
    return;
  }

  try {
    const [
      userRows,
      sessionRows,
      attendanceRows,
      compRows,
      galleryRows,
      inquiryRows,
      broadcastRows,
      settingRows,
    ] = await Promise.all([
      sql`SELECT * FROM users`,
      sql`SELECT * FROM sessions WHERE expires_at > ${new Date().toISOString()}`,
      sql`SELECT * FROM attendance`,
      sql`SELECT * FROM competitions`,
      sql`SELECT * FROM gallery ORDER BY sort_order ASC`,
      sql`SELECT * FROM inquiries ORDER BY created_at DESC`,
      sql`SELECT * FROM broadcasts ORDER BY sent_at DESC`,
      sql`SELECT * FROM settings`,
    ]);

    // Seed initial admin, gallery, and settings into Neon on first run
    if (userRows.length === 0) {
      for (const u of store.users) {
        await upsertUserToNeon(u);
      }
    } else {
      store.users = userRows.map((r) => ({
        id: String(r.id),
        email: String(r.email),
        phone: String(r.phone || ""),
        passwordHash: String(r.password_hash),
        name: String(r.name),
        role: String(r.role || "STUDENT"),
        group: String(r.group_name || "Adults (13+)"),
        belt: String(r.belt || "WHITE"),
        stripes: Number(r.stripes || 0),
        promotedAt: String(r.promoted_at),
        joinedAt: String(r.joined_at),
        subscriptionStatus: String(r.subscription_status || "TRIAL"),
        dob: r.dob ? String(r.dob) : undefined,
        parentName: r.parent_name ? String(r.parent_name) : undefined,
        parentPhone: r.parent_phone ? String(r.parent_phone) : undefined,
        parentEmail: r.parent_email ? String(r.parent_email) : undefined,
        medicalNotes: r.medical_notes ? String(r.medical_notes) : undefined,
        familyId: r.family_id ? String(r.family_id) : undefined,
        memberType: r.member_type === "EXISTING" ? "EXISTING" : "NEW",
        waiverSignedAt: r.waiver_signed_at ? String(r.waiver_signed_at) : undefined,
        waiverSignerName: r.waiver_signer_name ? String(r.waiver_signer_name) : undefined,
        termsAcceptedAt: r.terms_accepted_at ? String(r.terms_accepted_at) : undefined,
        resetTokenHash: r.reset_token_hash ? String(r.reset_token_hash) : undefined,
        resetTokenExpiresAt: r.reset_token_expires_at ? String(r.reset_token_expires_at) : undefined,
        stripeCustomerId: r.stripe_customer_id ? String(r.stripe_customer_id) : undefined,
        stripeSubscriptionId: r.stripe_subscription_id ? String(r.stripe_subscription_id) : undefined,
        currentPeriodEnd: r.current_period_end ? String(r.current_period_end) : undefined,
      }));
    }

    store.sessions = sessionRows.map((r) => ({
      id: String(r.id),
      userId: String(r.user_id),
      expiresAt: String(r.expires_at),
    }));

    store.attendance = attendanceRows.map((r) => ({
      id: String(r.id),
      userId: String(r.user_id),
      date: String(r.date),
      classLabel: String(r.class_label),
    }));

    store.competitions = compRows.map((r) => ({
      id: String(r.id),
      userId: String(r.user_id),
      date: String(r.date),
      name: String(r.name),
      division: String(r.division || ""),
      result: String(r.result || ""),
    }));

    if (galleryRows.length === 0) {
      for (const gItem of store.gallery) {
        await sql`
          INSERT INTO gallery (id, src, caption, sort_order, created_at)
          VALUES (${gItem.id}, ${gItem.src}, ${gItem.caption}, ${gItem.sortOrder}, ${gItem.createdAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    } else {
      store.gallery = galleryRows.map((r) => ({
        id: String(r.id),
        src: String(r.src),
        caption: String(r.caption || ""),
        sortOrder: Number(r.sort_order || 0),
        createdAt: String(r.created_at),
      }));
    }

    store.inquiries = inquiryRows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      phone: String(r.phone || ""),
      message: String(r.message || ""),
      handled: Number(r.handled || 0),
      createdAt: String(r.created_at),
    }));

    store.broadcasts = broadcastRows.map((r) => ({
      id: String(r.id),
      targetGroup: String(r.target_group),
      channel: String(r.channel),
      title: String(r.title),
      message: String(r.message),
      recipientCount: Number(r.recipient_count || 0),
      recipientNames: Array.isArray(r.recipient_names)
        ? r.recipient_names.map(String)
        : undefined,
      isScheduleChange: Boolean(r.is_schedule_change),
      sentAt: String(r.sent_at),
    }));

    if (settingRows.length === 0) {
      for (const [k, v] of Object.entries(store.settings)) {
        await sql`
          INSERT INTO settings (key, value)
          VALUES (${k}, ${v})
          ON CONFLICT (key) DO NOTHING
        `;
      }
    } else {
      const merged = getDefaultSettings();
      for (const r of settingRows) {
        merged[String(r.key)] = String(r.value);
      }
      store.settings = merged;
    }

    store.lastHydratedAt = Date.now();
  } catch (err) {
    console.error("Neon DB hydration error:", err);
  }
}

// ---------- Users ----------
export const Users = {
  byEmail: (email: string) => {
    const clean = email.toLowerCase().trim();
    return store.users.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        (u.parentEmail && u.parentEmail.toLowerCase() === clean)
    );
  },
  allByEmail: (email: string) => {
    const clean = email.toLowerCase().trim();
    return store.users.filter(
      (u) =>
        u.email.toLowerCase() === clean ||
        (u.parentEmail && u.parentEmail.toLowerCase() === clean)
    );
  },
  familyMembersFor: (user: UserRow): UserRow[] => {
    const targetEmail = (user.parentEmail || user.email).toLowerCase().trim();
    return store.users
      .filter(
        (u) =>
          u.role === "STUDENT" &&
          (u.id === user.id ||
            (user.familyId && u.familyId === user.familyId) ||
            u.email.toLowerCase() === targetEmail ||
            (u.parentEmail && u.parentEmail.toLowerCase() === targetEmail))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  byId: (id: string) => store.users.find((u) => u.id === id),
  create(data: {
    email: string;
    name: string;
    passwordHash: string;
    phone?: string;
    group?: string;
    role?: string;
    belt?: string;
    stripes?: number;
    joinedAt?: string;
    subscriptionStatus?: string;
    dob?: string;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
    medicalNotes?: string;
    familyId?: string;
    memberType?: "NEW" | "EXISTING";
    waiverSignedAt?: string;
    waiverSignerName?: string;
    termsAcceptedAt?: string;
  }) {
    const row: UserRow = {
      id: uid(),
      email: data.email,
      phone: data.phone || data.parentPhone || "",
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role ?? "STUDENT",
      group: data.group ?? "Adults (13+)",
      belt: data.belt ?? "WHITE",
      stripes: data.stripes ?? 0,
      promotedAt: nowIso(),
      joinedAt: data.joinedAt || nowIso(),
      subscriptionStatus:
        data.subscriptionStatus ?? (data.memberType === "EXISTING" ? "ACTIVE" : "TRIAL"),
      dob: data.dob,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      parentEmail: data.parentEmail,
      medicalNotes: data.medicalNotes,
      familyId: data.familyId,
      memberType: data.memberType ?? "NEW",
      waiverSignedAt: data.waiverSignedAt,
      waiverSignerName: data.waiverSignerName,
      termsAcceptedAt: data.termsAcceptedAt,
    };
    store.users.push(row);
    queueWrite(() => upsertUserToNeon(row));
    return row;
  },
  students: () =>
    store.users
      .filter((u) => u.role === "STUDENT")
      .sort((a, b) => a.name.localeCompare(b.name)),
  updateRank(id: string, belt: string, stripes: number, subscriptionStatus: string) {
    const user = store.users.find((u) => u.id === id);
    if (user) {
      user.belt = belt;
      user.stripes = stripes;
      user.subscriptionStatus = subscriptionStatus;
      user.promotedAt = nowIso();
      queueWrite(() => upsertUserToNeon(user));
    }
  },
  updateGroup(id: string, group: string) {
    const user = store.users.find((u) => u.id === id);
    if (user) {
      user.group = group;
      queueWrite(() => upsertUserToNeon(user));
    }
  },
  updateDetails(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      group?: string;
      belt?: string;
      stripes?: number;
      subscriptionStatus?: string;
      dob?: string;
      parentName?: string;
      parentPhone?: string;
      parentEmail?: string;
      medicalNotes?: string;
      waiverSignedAt?: string;
      waiverSignerName?: string;
      termsAcceptedAt?: string;
    }
  ) {
    const user = store.users.find((u) => u.id === id);
    if (user) {
      if (data.name !== undefined) user.name = data.name;
      if (data.email !== undefined) user.email = data.email;
      if (data.phone !== undefined) user.phone = data.phone;
      if (data.group !== undefined) user.group = data.group;
      if (data.belt !== undefined) user.belt = data.belt;
      if (data.stripes !== undefined) user.stripes = data.stripes;
      if (data.subscriptionStatus !== undefined)
        user.subscriptionStatus = data.subscriptionStatus;
      if (data.dob !== undefined) user.dob = data.dob;
      if (data.parentName !== undefined) user.parentName = data.parentName;
      if (data.parentPhone !== undefined) user.parentPhone = data.parentPhone;
      if (data.parentEmail !== undefined) user.parentEmail = data.parentEmail;
      if (data.medicalNotes !== undefined) user.medicalNotes = data.medicalNotes;
      if (data.waiverSignedAt !== undefined) user.waiverSignedAt = data.waiverSignedAt;
      if (data.waiverSignerName !== undefined) user.waiverSignerName = data.waiverSignerName;
      if (data.termsAcceptedAt !== undefined) user.termsAcceptedAt = data.termsAcceptedAt;
      queueWrite(() => upsertUserToNeon(user));
    }
  },
  updatePassword(id: string, passwordHash: string) {
    const user = store.users.find((u) => u.id === id);
    if (user) {
      user.passwordHash = passwordHash;
      user.resetTokenHash = undefined;
      user.resetTokenExpiresAt = undefined;
      queueWrite(() => upsertUserToNeon(user));
    }
  },
  setResetToken(email: string, tokenHash: string, expiresAtIso: string) {
    const matches = Users.allByEmail(email);
    for (const u of matches) {
      u.resetTokenHash = tokenHash;
      u.resetTokenExpiresAt = expiresAtIso;
      queueWrite(() => upsertUserToNeon(u));
    }
  },
  delete(id: string) {
    const user = store.users.find((u) => u.id === id);
    if (!user || user.role === "ADMIN") return false;
    store.users = store.users.filter((u) => u.id !== id);
    store.sessions = store.sessions.filter((s) => s.userId !== id);
    store.attendance = store.attendance.filter((a) => a.userId !== id);
    store.competitions = store.competitions.filter((c) => c.userId !== id);
    queueWrite(async () => {
      const sql = getSql();
      if (!sql) return;
      await Promise.all([
        sql`DELETE FROM sessions WHERE user_id = ${id}`,
        sql`DELETE FROM attendance WHERE user_id = ${id}`,
        sql`DELETE FROM competitions WHERE user_id = ${id}`,
        sql`DELETE FROM users WHERE id = ${id}`,
      ]);
    });
    return true;
  },
  countStudents: () => store.users.filter((u) => u.role === "STUDENT").length,
  countActive: () =>
    store.users.filter(
      (u) => u.role === "STUDENT" && u.subscriptionStatus === "ACTIVE"
    ).length,
  byGroup: (group: string) => {
    if (group === "ALL") return store.users.filter((u) => u.role === "STUDENT");
    return store.users.filter((u) => u.role === "STUDENT" && u.group === group);
  },
};

// ---------- Sessions ----------
export const Sessions = {
  create(userId: string, expiresAt: Date) {
    const now = new Date().toISOString();
    store.sessions = store.sessions.filter((s) => s.expiresAt > now);
    const id = uid();
    const session = { id, userId, expiresAt: expiresAt.toISOString() };
    store.sessions.push(session);
    queueWrite(async () => {
      const sql = getSql();
      if (!sql) return;
      await sql`
        INSERT INTO sessions (id, user_id, expires_at)
        VALUES (${session.id}, ${session.userId}, ${session.expiresAt})
      `;
    });
    return session;
  },
  get(id: string) {
    const now = new Date().toISOString();
    store.sessions = store.sessions.filter((s) => s.expiresAt > now);
    return store.sessions.find((s) => s.id === id);
  },
  destroy(id: string) {
    store.sessions = store.sessions.filter((s) => s.id !== id);
    queueWrite(async () => {
      const sql = getSql();
      if (!sql) return;
      await sql`DELETE FROM sessions WHERE id = ${id}`;
    });
  },
  destroyAllForUser(userId: string, keepSessionId?: string) {
    store.sessions = store.sessions.filter(
      (s) => s.userId !== userId || (keepSessionId && s.id === keepSessionId)
    );
    queueWrite(async () => {
      const sql = getSql();
      if (!sql) return;
      if (keepSessionId) {
        await sql`DELETE FROM sessions WHERE user_id = ${userId} AND id != ${keepSessionId}`;
      } else {
        await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
      }
    });
  },
};

// ---------- Attendance ----------
export const AttendanceRepo = {
  forUser: (userId: string) =>
    store.attendance
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date)),
  today() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startIso = start.toISOString();
    return store.attendance
      .filter((a) => a.date >= startIso)
      .map((a) => {
        const u = store.users.find((user) => user.id === a.userId);
        return { ...a, userName: u ? u.name : "Unknown" };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  },
  countToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return store.attendance.filter((a) => a.date >= start.toISOString()).length;
  },
  countForUser: (userId: string) =>
    store.attendance.filter((a) => a.userId === userId).length,
  create(userId: string, classLabel: string) {
    const row = { id: uid(), userId, date: nowIso(), classLabel };
    store.attendance.push(row);
    queueWrite(async () => {
      const sql = getSql();
      if (!sql) return;
      await sql`
        INSERT INTO attendance (id, user_id, date, class_label)
        VALUES (${row.id}, ${row.userId}, ${row.date}, ${row.classLabel})
      `;
    });
  },
  delete(id: string) {
    store.attendance = store.attendance.filter((a) => a.id !== id);
    queueWrite(async () => {
      const sql = getSql();
      if (!sql) return;
      await sql`DELETE FROM attendance WHERE id = ${id}`;
    });
  },
};

// ---------- Competitions ----------
export const Competitions = {
  forUser: (userId: string) =>
    store.competitions
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date)),
  create(data: {
    userId: string;
    name: string;
    date: Date;
    division: string;
    result: string;
  }) {
    const row = {
      id: uid(),
      userId: data.userId,
      name: data.name,
      date: data.date.toISOString(),
      division: data.division,
      result: data.result,
    };
    store.competitions.push(row);
    queueWrite(async () => {
      const sql = getSql();
      if (!sql) return;
      await sql`
        INSERT INTO competitions (id, user_id, date, name, division, result)
        VALUES (${row.id}, ${row.userId}, ${row.date}, ${row.name}, ${row.division}, ${row.result})
      `;
    });
  },
};

// ---------- Gallery ----------
export const Gallery = {
  all: () => store.gallery.slice().sort((a, b) => a.sortOrder - b.sortOrder),
  create(src: string, caption: string) {
    const maxOrder = store.gallery.reduce(
      (m, item) => Math.max(m, item.sortOrder),
      0
    );
    const row = {
      id: uid(),
      src,
      caption,
      sortOrder: maxOrder + 1,
      createdAt: nowIso(),
    };
    store.gallery.push(row);
    queueWrite(async () => {
      const sql = getSql();
      if (!sql) return;
      await sql`
        INSERT INTO gallery (id, src, caption, sort_order, created_at)
        VALUES (${row.id}, ${row.src}, ${row.caption}, ${row.sortOrder}, ${row.createdAt})
      `;
    });
  },
  delete(id: string) {
    store.gallery = store.gallery.filter((gItem) => gItem.id !== id);
    queueWrite(async () => {
      const sql = getSql();
      if (!sql) return;
      await sql`DELETE FROM gallery WHERE id = ${id}`;
    });
  },
};

// ---------- Inquiries ----------
export const Inquiries = {
  all: () =>
    store.inquiries.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  create(data: { name: string; email: string; phone: string; message: string }) {
    const row = {
      id: uid(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      handled: 0,
      createdAt: nowIso(),
    };
    store.inquiries.push(row);
    queueWrite(async () => {
      const sql = getSql();
      if (!sql) return;
      await sql`
        INSERT INTO inquiries (id, name, email, phone, message, handled, created_at)
        VALUES (${row.id}, ${row.name}, ${row.email}, ${row.phone}, ${row.message}, ${row.handled}, ${row.createdAt})
      `;
    });
  },
  markHandled(id: string) {
    const inq = store.inquiries.find((i) => i.id === id);
    if (inq) {
      inq.handled = 1;
      queueWrite(async () => {
        const sql = getSql();
        if (!sql) return;
        await sql`UPDATE inquiries SET handled = 1 WHERE id = ${id}`;
      });
    }
  },
  countUnhandled: () => store.inquiries.filter((i) => i.handled === 0).length,
};

// ---------- Broadcasts / Notifications ----------
export const Broadcasts = {
  all: () =>
    store.broadcasts.slice().sort((a, b) => b.sentAt.localeCompare(a.sentAt)),
  forGroup: (group: string) =>
    store.broadcasts
      .filter((b) => b.targetGroup === "ALL" || b.targetGroup === group)
      .sort((a, b) => b.sentAt.localeCompare(a.sentAt)),
  create(data: {
    targetGroup: string;
    channel: string;
    title: string;
    message: string;
    recipientCount: number;
    recipientNames?: string[];
    isScheduleChange?: boolean;
  }) {
    const row: BroadcastRow = {
      id: uid(),
      targetGroup: data.targetGroup,
      channel: data.channel,
      title: data.title,
      message: data.message,
      recipientCount: data.recipientCount,
      recipientNames: data.recipientNames,
      isScheduleChange: data.isScheduleChange,
      sentAt: nowIso(),
    };
    store.broadcasts.push(row);
    queueWrite(async () => {
      const sql = getSql();
      if (!sql) return;
      await sql`
        INSERT INTO broadcasts (
          id, target_group, channel, title, message, recipient_count,
          recipient_names, is_schedule_change, sent_at
        ) VALUES (
          ${row.id}, ${row.targetGroup}, ${row.channel}, ${row.title},
          ${row.message}, ${row.recipientCount},
          ${JSON.stringify(row.recipientNames || [])}::jsonb,
          ${Boolean(row.isScheduleChange)}, ${row.sentAt}
        )
      `;
    });
    return row;
  },
};

// ---------- Settings ----------
export const Settings = {
  all(): Record<string, string> {
    return { ...store.settings };
  },
  set(key: string, value: string) {
    store.settings[key] = value;
    queueWrite(async () => {
      const sql = getSql();
      if (!sql) return;
      await sql`
        INSERT INTO settings (key, value)
        VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    });
  },
};

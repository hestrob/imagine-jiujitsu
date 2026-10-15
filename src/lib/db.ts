import { randomUUID, scryptSync, randomBytes } from "node:crypto";

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
  subscriptionStatus: string;
  dob?: string; // YYYY-MM-DD
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  medicalNotes?: string;
  familyId?: string;
  memberType?: "NEW" | "EXISTING";
};

export type AttendanceRow = { id: string; userId: string; date: string; classLabel: string };
export type CompetitionRow = { id: string; userId: string; date: string; name: string; division: string; result: string };
export type GalleryRow = { id: string; src: string; caption: string; sortOrder: number; createdAt: string };
export type InquiryRow = { id: string; name: string; email: string; phone: string; message: string; handled: number; createdAt: string };

import { GROUPS, type MemberGroup, type BroadcastRow } from "./constants";
export { GROUPS, type MemberGroup, type BroadcastRow };

export const uid = () => randomUUID();
export const nowIso = () => new Date().toISOString();

const hashPw = (pw: string) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
};

// Global in-memory storage for Next.js dev hot-reloading & Vercel serverless execution
type GlobalDataStore = {
  users: UserRow[];
  sessions: { id: string; userId: string; expiresAt: string }[];
  attendance: AttendanceRow[];
  competitions: CompetitionRow[];
  gallery: GalleryRow[];
  inquiries: InquiryRow[];
  broadcasts: BroadcastRow[];
  settings: Record<string, string>;
};

const g = globalThis as unknown as { __dbStore?: GlobalDataStore };

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

function migrateStoreGroups(s: GlobalDataStore) {
  // Purge any legacy sample/demo students and their associated records from active memory
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

  const initialAttendance: AttendanceRow[] = [];
  const initialCompetitions: CompetitionRow[] = [];
  const initialGallery: GalleryRow[] = getDefaultGallery();

  const initialSettings: Record<string, string> = {
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
      "Monday|4:00 – 4:45 PM|Kids Fundamentals & Games|Kids (5-6)|",
      "Monday|5:00 – 6:00 PM|Juniors Gi & Technique|Juniors (7-12)|",
      "Monday|6:00 – 7:30 PM|Fundamentals + Rolling|Adults (13+)|",
      "Wednesday|4:00 – 4:45 PM|Kids Self Defense & Balance|Kids (5-6)|",
      "Wednesday|5:00 – 6:00 PM|Juniors Gi & Positional Drilling|Juniors (7-12)|",
      "Wednesday|6:00 – 7:30 PM|All Levels Gi|Adults (13+)|",
      "Friday|5:00 – 6:00 PM|Juniors No-Gi & Live Rounds|Juniors (7-12)|",
      "Friday|6:00 – 7:30 PM|No-Gi + Open Mat|Adults (13+)|",
      "Sunday|6:30 – 9:00 AM|Dawn Patrol Open Mat|ALL|",
    ].join("\n"),
  };

  const initialBroadcasts: BroadcastRow[] = [];

  g.__dbStore = {
    users: initialUsers,
    sessions: [],
    attendance: initialAttendance,
    competitions: initialCompetitions,
    gallery: initialGallery,
    inquiries: [],
    broadcasts: initialBroadcasts,
    settings: initialSettings,
  };

  return g.__dbStore;
}

const store = getStore();

// ---------- Users ----------
export const Users = {
  byEmail: (email: string) =>
    store.users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() ||
        (u.parentEmail && u.parentEmail.toLowerCase() === email.toLowerCase())
    ),
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
      subscriptionStatus: data.subscriptionStatus ?? (data.memberType === "EXISTING" ? "ACTIVE" : "TRIAL"),
      dob: data.dob,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      parentEmail: data.parentEmail,
      medicalNotes: data.medicalNotes,
      familyId: data.familyId,
      memberType: data.memberType ?? "NEW",
    };
    store.users.push(row);
    return row;
  },
  students: () => store.users.filter((u) => u.role === "STUDENT").sort((a, b) => a.name.localeCompare(b.name)),
  updateRank(id: string, belt: string, stripes: number, subscriptionStatus: string) {
    const user = store.users.find((u) => u.id === id);
    if (user) {
      user.belt = belt;
      user.stripes = stripes;
      user.subscriptionStatus = subscriptionStatus;
      user.promotedAt = nowIso();
    }
  },
  updateGroup(id: string, group: string) {
    const user = store.users.find((u) => u.id === id);
    if (user) {
      user.group = group;
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
      if (data.subscriptionStatus !== undefined) user.subscriptionStatus = data.subscriptionStatus;
      if (data.dob !== undefined) user.dob = data.dob;
      if (data.parentName !== undefined) user.parentName = data.parentName;
      if (data.parentPhone !== undefined) user.parentPhone = data.parentPhone;
      if (data.parentEmail !== undefined) user.parentEmail = data.parentEmail;
      if (data.medicalNotes !== undefined) user.medicalNotes = data.medicalNotes;
    }
  },
  updatePassword(id: string, passwordHash: string) {
    const user = store.users.find((u) => u.id === id);
    if (user) {
      user.passwordHash = passwordHash;
    }
  },
  delete(id: string) {
    const user = store.users.find((u) => u.id === id);
    if (!user || user.role === "ADMIN") return false;
    store.users = store.users.filter((u) => u.id !== id);
    store.sessions = store.sessions.filter((s) => s.userId !== id);
    store.attendance = store.attendance.filter((a) => a.userId !== id);
    store.competitions = store.competitions.filter((c) => c.userId !== id);
    return true;
  },
  countStudents: () => store.users.filter((u) => u.role === "STUDENT").length,
  countActive: () => store.users.filter((u) => u.role === "STUDENT" && u.subscriptionStatus === "ACTIVE").length,
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
    return session;
  },
  get(id: string) {
    const now = new Date().toISOString();
    store.sessions = store.sessions.filter((s) => s.expiresAt > now);
    return store.sessions.find((s) => s.id === id);
  },
  destroy(id: string) {
    store.sessions = store.sessions.filter((s) => s.id !== id);
  },
  destroyAllForUser(userId: string, keepSessionId?: string) {
    store.sessions = store.sessions.filter(
      (s) => s.userId !== userId || (keepSessionId && s.id === keepSessionId)
    );
  },
};

// ---------- Attendance ----------
export const AttendanceRepo = {
  forUser: (userId: string) =>
    store.attendance.filter((a) => a.userId === userId).sort((a, b) => b.date.localeCompare(a.date)),
  today() {
    const start = new Date(); start.setHours(0, 0, 0, 0);
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
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return store.attendance.filter((a) => a.date >= start.toISOString()).length;
  },
  countForUser: (userId: string) => store.attendance.filter((a) => a.userId === userId).length,
  create(userId: string, classLabel: string) {
    store.attendance.push({ id: uid(), userId, date: nowIso(), classLabel });
  },
  delete(id: string) {
    store.attendance = store.attendance.filter((a) => a.id !== id);
  },
};

// ---------- Competitions ----------
export const Competitions = {
  forUser: (userId: string) =>
    store.competitions.filter((c) => c.userId === userId).sort((a, b) => b.date.localeCompare(a.date)),
  create(data: { userId: string; name: string; date: Date; division: string; result: string }) {
    store.competitions.push({
      id: uid(),
      userId: data.userId,
      name: data.name,
      date: data.date.toISOString(),
      division: data.division,
      result: data.result,
    });
  },
};

// ---------- Gallery ----------
export const Gallery = {
  all: () => store.gallery.slice().sort((a, b) => a.sortOrder - b.sortOrder),
  create(src: string, caption: string) {
    const maxOrder = store.gallery.reduce((m, item) => Math.max(m, item.sortOrder), 0);
    const row = { id: uid(), src, caption, sortOrder: maxOrder + 1, createdAt: nowIso() };
    store.gallery.push(row);
  },
  delete(id: string) {
    store.gallery = store.gallery.filter((g) => g.id !== id);
  },
};

// ---------- Inquiries ----------
export const Inquiries = {
  all: () => store.inquiries.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  create(data: { name: string; email: string; phone: string; message: string }) {
    store.inquiries.push({
      id: uid(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      handled: 0,
      createdAt: nowIso(),
    });
  },
  markHandled(id: string) {
    const inq = store.inquiries.find((i) => i.id === id);
    if (inq) inq.handled = 1;
  },
  countUnhandled: () => store.inquiries.filter((i) => i.handled === 0).length,
};

// ---------- Broadcasts / Notifications ----------
export const Broadcasts = {
  all: () => store.broadcasts.slice().sort((a, b) => b.sentAt.localeCompare(a.sentAt)),
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
  },
};

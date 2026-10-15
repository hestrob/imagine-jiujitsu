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
};

export type AttendanceRow = { id: string; userId: string; date: string; classLabel: string };
export type CompetitionRow = { id: string; userId: string; date: string; name: string; division: string; result: string };
export type GalleryRow = { id: string; src: string; caption: string; sortOrder: number; createdAt: string };
export type InquiryRow = { id: string; name: string; email: string; phone: string; message: string; handled: number; createdAt: string };

import { GROUPS, type MemberGroup, type BroadcastRow } from "./constants";
export { GROUPS, type MemberGroup, type BroadcastRow };

export const uid = () => randomUUID();
export const nowIso = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

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

function migrateStoreGroups(s: GlobalDataStore) {
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
}

function getStore(): GlobalDataStore {
  if (g.__dbStore) {
    migrateStoreGroups(g.__dbStore);
    return g.__dbStore;
  }

  const adminId1 = uid();
  const mayaId = uid();
  const jordanId = uid();
  const samId = uid();
  const rileyId = uid();
  const leoId = uid();
  const elenaId = uid();

  const initialUsers: UserRow[] = [
    {
      id: adminId1,
      email: "imagineawebsite@gmail.com",
      phone: "(530) 520-3266",
      passwordHash: hashPw("mat-admin-1"),
      name: "Coach Sean",
      role: "ADMIN",
      group: "Adults (13+)",
      belt: "BLACK",
      stripes: 0,
      promotedAt: nowIso(),
      joinedAt: nowIso(),
      subscriptionStatus: "ACTIVE",
    },
    {
      id: mayaId,
      email: "maya@demo.test",
      phone: "(530) 312-8841",
      passwordHash: hashPw("osss"),
      name: "Maya R.",
      role: "STUDENT",
      group: "Adults (13+)",
      belt: "BLUE",
      stripes: 2,
      promotedAt: daysAgo(90),
      joinedAt: daysAgo(210),
      subscriptionStatus: "ACTIVE",
    },
    {
      id: jordanId,
      email: "jordan@demo.test",
      phone: "(530) 723-9912",
      passwordHash: hashPw("osss"),
      name: "Jordan P.",
      role: "STUDENT",
      group: "Adults (13+)",
      belt: "WHITE",
      stripes: 3,
      promotedAt: daysAgo(90),
      joinedAt: daysAgo(120),
      subscriptionStatus: "ACTIVE",
    },
    {
      id: samId,
      email: "sam@demo.test",
      phone: "(530) 662-4419",
      passwordHash: hashPw("osss"),
      name: "Sam K.",
      role: "STUDENT",
      group: "Juniors (7-12)",
      belt: "PURPLE",
      stripes: 1,
      promotedAt: daysAgo(90),
      joinedAt: daysAgo(800),
      subscriptionStatus: "ACTIVE",
    },
    {
      id: rileyId,
      email: "riley@demo.test",
      phone: "(530) 405-7730",
      passwordHash: hashPw("osss"),
      name: "Riley T.",
      role: "STUDENT",
      group: "Kids (5-6)",
      belt: "WHITE",
      stripes: 0,
      promotedAt: daysAgo(6),
      joinedAt: daysAgo(6),
      subscriptionStatus: "TRIAL",
    },
    {
      id: leoId,
      email: "leo@demo.test",
      phone: "(530) 554-1298",
      passwordHash: hashPw("osss"),
      name: "Leo M.",
      role: "STUDENT",
      group: "Kids (5-6)",
      belt: "WHITE",
      stripes: 2,
      promotedAt: daysAgo(40),
      joinedAt: daysAgo(95),
      subscriptionStatus: "ACTIVE",
    },
    {
      id: elenaId,
      email: "elena@demo.test",
      phone: "(530) 908-3351",
      passwordHash: hashPw("osss"),
      name: "Elena V.",
      role: "STUDENT",
      group: "Juniors (7-12)",
      belt: "BLUE",
      stripes: 3,
      promotedAt: daysAgo(60),
      joinedAt: daysAgo(350),
      subscriptionStatus: "ACTIVE",
    },
  ];

  const initialAttendance: AttendanceRow[] = [
    { id: uid(), userId: mayaId, date: daysAgo(1), classLabel: "Fundamentals + Rolling" },
    { id: uid(), userId: mayaId, date: daysAgo(3), classLabel: "All Levels Gi" },
    { id: uid(), userId: mayaId, date: daysAgo(5), classLabel: "No-Gi + Open Mat" },
    { id: uid(), userId: jordanId, date: daysAgo(1), classLabel: "Fundamentals + Rolling" },
    { id: uid(), userId: samId, date: daysAgo(2), classLabel: "Juniors Gi & Technique" },
    { id: uid(), userId: elenaId, date: daysAgo(1), classLabel: "Juniors Gi & Technique" },
    { id: uid(), userId: leoId, date: daysAgo(2), classLabel: "Kids Fundamentals (5-6)" },
  ];

  const initialCompetitions: CompetitionRow[] = [
    { id: uid(), userId: mayaId, name: "Sacramento Open", date: daysAgo(60), division: "Adult Blue / Feather", result: "Silver" },
    { id: uid(), userId: samId, name: "IBJJF Sacramento", date: daysAgo(150), division: "Junior / Light", result: "Gold" },
    { id: uid(), userId: samId, name: "Grappling Industries NorCal", date: daysAgo(30), division: "No-Gi Division", result: "Bronze" },
    { id: uid(), userId: elenaId, name: "NorCal State Championship", date: daysAgo(20), division: "Junior / Middle", result: "Gold" },
  ];

  const initialGallery: GalleryRow[] = [
    { id: uid(), src: "/photos/placeholder-1.svg", caption: "Drill night — replace with a real photo", sortOrder: 0, createdAt: nowIso() },
    { id: uid(), src: "/photos/placeholder-2.svg", caption: "Open mat — replace with a real photo", sortOrder: 1, createdAt: nowIso() },
    { id: uid(), src: "/photos/placeholder-3.svg", caption: "Belt promotion — replace with a real photo", sortOrder: 2, createdAt: nowIso() },
    { id: uid(), src: "/photos/placeholder-4.svg", caption: "Competition team — replace with a real photo", sortOrder: 3, createdAt: nowIso() },
    { id: uid(), src: "/photos/placeholder-5.svg", caption: "Kids of the dojo — replace with a real photo", sortOrder: 4, createdAt: nowIso() },
    { id: uid(), src: "/photos/placeholder-6.svg", caption: "Community — replace with a real photo", sortOrder: 5, createdAt: nowIso() },
  ];

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

  const initialBroadcasts: BroadcastRow[] = [
    {
      id: uid(),
      targetGroup: "ALL",
      channel: "ALL",
      title: "Holiday Open Mat Schedule",
      message: "Hey team! Open Mat is moved to 8:00 AM this upcoming Monday. All belts and groups welcome!",
      recipientCount: 6,
      recipientNames: ["Maya R.", "Jordan P.", "Sam K.", "Riley T.", "Leo M.", "Elena V."],
      isScheduleChange: true,
      sentAt: daysAgo(3),
    },
    {
      id: uid(),
      targetGroup: "Juniors (7-12)",
      channel: "SMS",
      title: "Juniors Friday No-Gi Reminder",
      message: "Juniors (7-12) group: remember to bring rashguards and shorts for Friday No-Gi at 5:00 PM.",
      recipientCount: 2,
      recipientNames: ["Sam K.", "Elena V."],
      isScheduleChange: true,
      sentAt: daysAgo(5),
    },
  ];

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
  byEmail: (email: string) => store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  byId: (id: string) => store.users.find((u) => u.id === id),
  create(data: { email: string; name: string; passwordHash: string; phone?: string; group?: string; role?: string }) {
    const row: UserRow = {
      id: uid(),
      email: data.email,
      phone: data.phone ?? "",
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role ?? "STUDENT",
      group: data.group ?? "Adults (13+)",
      belt: "WHITE",
      stripes: 0,
      promotedAt: nowIso(),
      joinedAt: nowIso(),
      subscriptionStatus: "TRIAL",
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
  updateDetails(id: string, data: { name?: string; email?: string; phone?: string; group?: string; belt?: string; stripes?: number; subscriptionStatus?: string }) {
    const user = store.users.find((u) => u.id === id);
    if (user) {
      if (data.name !== undefined) user.name = data.name;
      if (data.email !== undefined) user.email = data.email;
      if (data.phone !== undefined) user.phone = data.phone;
      if (data.group !== undefined) user.group = data.group;
      if (data.belt !== undefined) user.belt = data.belt;
      if (data.stripes !== undefined) user.stripes = data.stripes;
      if (data.subscriptionStatus !== undefined) user.subscriptionStatus = data.subscriptionStatus;
    }
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
    const id = uid();
    const session = { id, userId, expiresAt: expiresAt.toISOString() };
    store.sessions.push(session);
    return session;
  },
  get(id: string) {
    return store.sessions.find((s) => s.id === id);
  },
  destroy(id: string) {
    store.sessions = store.sessions.filter((s) => s.id !== id);
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

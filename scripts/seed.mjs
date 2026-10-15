import Database from "better-sqlite3";
import { scryptSync, randomBytes, randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
const db = new Database(path.join(process.cwd(), "data", "imagine.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, passwordHash TEXT NOT NULL,
    name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'STUDENT', belt TEXT NOT NULL DEFAULT 'WHITE',
    stripes INTEGER NOT NULL DEFAULT 0, promotedAt TEXT NOT NULL, joinedAt TEXT NOT NULL,
    subscriptionStatus TEXT NOT NULL DEFAULT 'TRIAL'
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expiresAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL, classLabel TEXT NOT NULL DEFAULT 'Open Mat'
  );
  CREATE TABLE IF NOT EXISTS competitions (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, date TEXT NOT NULL, division TEXT NOT NULL DEFAULT '', result TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY, src TEXT NOT NULL, caption TEXT NOT NULL DEFAULT '',
    sortOrder INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '', handled INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

const hash = (pw) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
};
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
const now = () => new Date().toISOString();

// --- Settings ---
const settings = {
  videoUrl: "https://www.youtube.com/embed/2fbLKPvmDws",
  address: "2548 Allen Cir, Woodland, CA 95776",
  phone: "(530) 520-3266",
  email: "imagineawebsite@gmail.com",
  facebook: "https://www.facebook.com/people/Imagine-Jiu-Jitsu/61566902831513/",
  instagram: "",
  yelp: "https://www.yelp.com/biz/imagine-jiu-jitsu-woodland",
  coachName: "Coach Sean",
  coachBio:
    "Coach Sean leads every class at Imagine with the same philosophy: a clean, welcoming space where anyone can train hard and grow. Traditional roots, Brazilian Jiu Jitsu pressure, and a community that shows up for each other. (EDIT ME: add rank, lineage, and story in Admin > Settings.)",
  schedule: [
    "Monday|6:00 – 7:30 PM|Fundamentals + Rolling",
    "Wednesday|5:00 – 7:30 PM|All Levels Gi",
    "Friday|5:00 – 7:30 PM|No-Gi + Open Mat",
    "Sunday|6:30 – 9:00 AM|Dawn Patrol Open Mat",
  ].join("\n"),
};
const setSetting = db.prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO NOTHING");
for (const [k, v] of Object.entries(settings)) setSetting.run(k, v);

// --- Users ---
const insertUser = db.prepare(
  "INSERT OR IGNORE INTO users (id,email,passwordHash,name,role,belt,stripes,promotedAt,joinedAt,subscriptionStatus) VALUES (?,?,?,?,?,?,?,?,?,?)"
);
const admins = [
  ["sean@imaginejj.test", "Coach Sean"],
  ["admin2@imaginejj.test", "Admin Two"],
  ["admin3@imaginejj.test", "Admin Three"],
];
for (const [email, name] of admins) {
  insertUser.run(randomUUID(), email, hash("mat-admin-1"), name, "ADMIN", "BLACK", 0, now(), now(), "ACTIVE");
}

// Remove any legacy demo/sample students if present
db.prepare("DELETE FROM users WHERE email LIKE '%@demo.test'").run();

// --- Gallery ---
const galleryCount = db.prepare("SELECT COUNT(*) c FROM gallery").get().c;
if (galleryCount === 0) {
  const insertImg = db.prepare("INSERT INTO gallery (id,src,caption,sortOrder,createdAt) VALUES (?,?,?,?,?)");
  const photos = [
    ["/photos/team-gi.jpg", "Imagine Jiu Jitsu Academy — Adult Gi Team & Lineage Wall"],
    ["/photos/team-nogi.jpg", "No-Gi Night — Full Mat Team in Woodland, CA"],
    ["/photos/coach-coaching.jpg", "Coach Sean — Technical Detail & Back Control"],
    ["/photos/nogi-takedown.jpg", "Live Rounds — No-Gi Wrestling & Takedown Entries"],
    ["/photos/kids-lineup.jpg", "Youth & Juniors Gi — Discipline, Focus & Fun"],
    ["/photos/kids-rolling.jpg", "Juniors (7–12) — Guard Work & Live Grappling"],
    ["/photos/mat-respect.jpg", "Ego-Free Culture — Every Round Starts With a Handshake"],
    ["/photos/nogi-pressure.jpg", "Adult No-Gi — Top Pressure & Guard Retention"],
    ["/photos/kids-coaching.jpg", "Coach Sean Guiding the Next Generation"],
    ["/photos/juniors-guard.jpg", "Juniors Gi — Closed Guard Fundamentals"],
    ["/photos/nogi-sub.jpg", "Submission Chains & Positional Control"],
    ["/photos/class-circle.jpg", "Community on the Mat — End of Class Lineup"],
  ];
  photos.forEach(([src, caption], i) => insertImg.run(randomUUID(), src, caption, i, now()));
}

console.log("Seed complete. Sample students removed.");


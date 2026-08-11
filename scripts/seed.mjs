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
  phone: "(530) 555-0000",
  email: "hello@imaginejiujitsu.com",
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

const students = [
  ["maya@demo.test", "Maya R.", "BLUE", 2, "ACTIVE", 210],
  ["jordan@demo.test", "Jordan P.", "WHITE", 3, "ACTIVE", 120],
  ["sam@demo.test", "Sam K.", "PURPLE", 1, "ACTIVE", 800],
  ["riley@demo.test", "Riley T.", "WHITE", 0, "TRIAL", 6],
];
const insertAttendance = db.prepare("INSERT INTO attendance (id,userId,date,classLabel) VALUES (?,?,?,?)");
const insertComp = db.prepare("INSERT INTO competitions (id,userId,name,date,division,result) VALUES (?,?,?,?,?,?)");
const byEmail = db.prepare("SELECT * FROM users WHERE email = ?");
const labels = ["Fundamentals + Rolling", "All Levels Gi", "No-Gi + Open Mat"];

for (const [email, name, belt, stripes, sub, joinedDays] of students) {
  const exists = byEmail.get(email);
  if (exists) continue;
  const id = randomUUID();
  insertUser.run(id, email, hash("osss"), name, "STUDENT", belt, stripes, daysAgo(Math.min(joinedDays, 90)), daysAgo(joinedDays), sub);
  for (let w = 0; w < 6; w++) {
    for (let s = 0; s < 3; s++) {
      if (Math.random() < 0.72) {
        insertAttendance.run(randomUUID(), id, daysAgo(w * 7 + s * 2 + 1), labels[s]);
      }
    }
  }
}

const maya = byEmail.get("maya@demo.test");
const sam = byEmail.get("sam@demo.test");
const compCount = db.prepare("SELECT COUNT(*) c FROM competitions").get().c;
if (compCount === 0) {
  if (maya) insertComp.run(randomUUID(), maya.id, "Sacramento Open", daysAgo(60), "Adult Blue / Feather", "Silver");
  if (sam) {
    insertComp.run(randomUUID(), sam.id, "IBJJF Sacramento", daysAgo(150), "Adult Purple / Light", "Gold");
    insertComp.run(randomUUID(), sam.id, "Grappling Industries NorCal", daysAgo(30), "No-Gi Absolute", "Bronze");
  }
}

// --- Gallery ---
const galleryCount = db.prepare("SELECT COUNT(*) c FROM gallery").get().c;
if (galleryCount === 0) {
  const insertImg = db.prepare("INSERT INTO gallery (id,src,caption,sortOrder,createdAt) VALUES (?,?,?,?,?)");
  const photos = [
    ["/photos/placeholder-1.svg", "Drill night — replace with a real photo"],
    ["/photos/placeholder-2.svg", "Open mat — replace with a real photo"],
    ["/photos/placeholder-3.svg", "Belt promotion — replace with a real photo"],
    ["/photos/placeholder-4.svg", "Competition team — replace with a real photo"],
    ["/photos/placeholder-5.svg", "Kids of the dojo — replace with a real photo"],
    ["/photos/placeholder-6.svg", "Community — replace with a real photo"],
  ];
  photos.forEach(([src, caption], i) => insertImg.run(randomUUID(), src, caption, i, now()));
}

console.log("Seed complete.");
console.log("Admin login:   sean@imaginejj.test / mat-admin-1");
console.log("Student login: maya@demo.test / osss");

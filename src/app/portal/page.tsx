import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AttendanceRepo, Broadcasts, Competitions } from "@/lib/db";
import {
  ADULT_BELT_ORDER,
  BELT_COLORS,
  BELT_LABELS,
  type Belt,
  YOUTH_BELT_ORDER,
  getBirthdayPromotionInfo,
  isYouthBelt,
  nextBelt,
} from "@/lib/belts";
import { getSettings, parseSchedule } from "@/lib/settings";
import { BeltBadge } from "@/components/BeltBadge";

export const metadata = { title: "My Mat — Imagine Jiu Jitsu" };

function monthsBetween(a: Date, b: Date) {
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / (30.44 * 24 * 60 * 60 * 1000)));
}

const SUB_LABELS: Record<string, string> = {
  TRIAL: "Trial — welcome! Membership starts when you subscribe.",
  ACTIVE: "Active — you're all paid up.",
  PAST_DUE: "Past due — see the front desk to update payment.",
  CANCELED: "Canceled — rejoin any time, your record stays.",
};

export default async function PortalPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");

  const attendance = AttendanceRepo.forUser(user.id);
  const competitions = Competitions.forUser(user.id);
  const settings = await getSettings();
  const fullSchedule = parseSchedule(settings.schedule);
  const userGroup = user.group || "Adults (13+)";
  const mySchedule = fullSchedule.filter(
    (r) => !r.group || r.group === "ALL" || r.group === userGroup
  );
  const groupAlerts = Broadcasts.forGroup(userGroup);

  const bdayInfo = getBirthdayPromotionInfo(user.dob, userGroup, user.belt);
  const isYouthTrack =
    isYouthBelt(user.belt) ||
    userGroup === "Kids (5-6)" ||
    userGroup === "Juniors (7-12)" ||
    (bdayInfo !== null && bdayInfo.age < 16);

  const pathBelts: readonly Belt[] = isYouthTrack
    ? [...YOUTH_BELT_ORDER, "BLUE"]
    : ADULT_BELT_ORDER;

  const now = new Date();
  const thisMonth = attendance.filter(
    (a) => new Date(a.date).getMonth() === now.getMonth() && new Date(a.date).getFullYear() === now.getFullYear()
  ).length;
  const monthsAtRank = monthsBetween(new Date(user.promotedAt), now);
  const next = nextBelt(user.belt, isYouthTrack);
  const beltIndex = pathBelts.indexOf(user.belt as Belt);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="eyebrow text-flow">My mat · {userGroup}</p>
      <h1 className="display-tight mt-2 text-5xl">{user.name}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <BeltBadge belt={user.belt} stripes={user.stripes} />
        <span className="border border-line bg-white px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-ink/80">
          Group: <strong>{userGroup}</strong>
        </span>
        {bdayInfo && (
          <span className="border border-line bg-white px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-ink/70">
            Age {bdayInfo.age} · 🎂 Next B-Day: {bdayInfo.nextBirthdayFormatted}
          </span>
        )}
      </div>

      {/* Group Schedule & Schedule Change Alerts */}
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-flow">My Group Schedule ({userGroup})</p>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
              {mySchedule.length} weekly classes
            </span>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {mySchedule.map((row, idx) => (
              <li key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-display uppercase text-lg">{row.day}</span>
                  <span className="font-mono text-xs text-flow font-semibold">{row.time}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink/80">
                  <span>{row.label}</span>
                  <span className="font-mono text-[10px] uppercase text-ink/50 bg-neutral-100 px-1.5 py-0.5 rounded">
                    {row.group === "ALL" ? "All Groups" : row.group}
                  </span>
                </div>
                {row.note && (
                  <p className="mt-1 rounded bg-amber-100 border border-amber-300 px-2.5 py-1 font-mono text-xs text-amber-950 font-semibold">
                    ⚠ Schedule Notice: {row.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-line bg-white p-6">
          <p className="eyebrow text-flow">Schedule Changes &amp; Group Alerts</p>
          {groupAlerts.length === 0 ? (
            <p className="mt-4 text-sm text-ink/60">No recent schedule alerts for your group.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line max-h-72 overflow-y-auto pr-1">
              {groupAlerts.slice(0, 6).map((alert) => (
                <li key={alert.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-ink">{alert.title}</span>
                    <span className="font-mono text-[10px] text-ink/40 shrink-0">
                      {new Date(alert.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-ink/75">{alert.message}</p>
                  <span className="inline-block font-mono text-[10px] uppercase tracking-wider text-flow">
                    {alert.targetGroup === "ALL" ? "All Academy Members" : `${alert.targetGroup} Group`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Belt path */}
      <section className="mt-6 border border-line bg-white p-6">
        <p className="eyebrow text-ink/50">
          The path {isYouthTrack ? "(Youth → Adult Progression)" : ""}
        </p>
        <div className="mt-4 flex items-center gap-1">
          {pathBelts.map((b, i) => (
            <div key={b} className="flex-1">
              <div
                className={`h-4 border border-ink/30 ${i <= beltIndex ? "" : "opacity-25"}`}
                style={{ backgroundColor: BELT_COLORS[b] }}
                title={BELT_LABELS[b]}
              />
              <p className={`mt-1 font-mono text-[10px] uppercase tracking-widest ${i === beltIndex ? "text-flow font-bold" : "text-ink/40"}`}>
                {b.toLowerCase()}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink/70">
          {monthsAtRank} month{monthsAtRank === 1 ? "" : "s"} at {(BELT_LABELS[user.belt] || user.belt).toLowerCase()}
          {next ? <> — next stop: <span className="font-medium">{(BELT_LABELS[next] || next).toLowerCase()}</span>. Keep showing up.</> : " — the belt is just the beginning."}
        </p>
      </section>

      {/* Stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="border border-line bg-white p-6">
          <p className="font-display text-5xl">{attendance.length}</p>
          <p className="eyebrow text-ink/50 mt-1">Classes all-time</p>
        </div>
        <div className="border border-line bg-white p-6">
          <p className="font-display text-5xl">{thisMonth}</p>
          <p className="eyebrow text-ink/50 mt-1">Classes this month</p>
        </div>
        <div className="border border-line bg-white p-6">
          <p className="font-display text-5xl">{competitions.length}</p>
          <p className="eyebrow text-ink/50 mt-1">Competitions</p>
        </div>
      </section>

      {/* Competitions */}
      <section className="mt-6 border border-line bg-white p-6">
        <p className="eyebrow text-ink/50">Competition record</p>
        {competitions.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">No competitions logged yet. When you step up, it shows up here.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {competitions.map((c) => (
              <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <span>
                  <span className="font-medium">{c.name}</span>
                  {c.division && <span className="text-ink/60"> — {c.division}</span>}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest">
                  {c.result} · {new Date(c.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent attendance + billing */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="border border-line bg-white p-6">
          <p className="eyebrow text-ink/50">Recent check-ins</p>
          <ul className="mt-3 space-y-2 text-sm">
            {attendance.slice(0, 8).map((a) => (
              <li key={a.id} className="flex justify-between">
                <span>{a.classLabel}</span>
                <span className="font-mono text-xs text-ink/50">{new Date(a.date).toLocaleDateString()}</span>
              </li>
            ))}
            {attendance.length === 0 && <li className="text-ink/60">First check-in coming soon.</li>}
          </ul>
        </div>
        <div className="border border-line bg-white p-6 space-y-2">
          <p className="eyebrow text-ink/50">Membership &amp; Billing Contact</p>
          <p className="mt-2 font-display text-3xl">$60<span className="text-lg">/mo</span></p>
          <p className="text-sm text-ink/70">{SUB_LABELS[user.subscriptionStatus] ?? user.subscriptionStatus}</p>
          <div className="pt-2 border-t border-line/60 font-mono text-xs text-ink/60 space-y-1">
            {user.parentName && <p>Billing / Parent Contact: {user.parentName}</p>}
            <p>Phone: {user.parentPhone || user.phone || "On file"}</p>
            <p>Email: {user.parentEmail || user.email}</p>
          </div>
          <p className="pt-1 text-xs text-ink/50">Online billing is coming — cards will be managed right here.</p>
        </div>
      </section>
    </div>
  );
}

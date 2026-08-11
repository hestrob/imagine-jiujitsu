import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AttendanceRepo, Competitions } from "@/lib/db";
import { BELT_COLORS, BELT_LABELS, BELT_ORDER, nextBelt } from "@/lib/belts";
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

  const now = new Date();
  const thisMonth = attendance.filter(
    (a) => new Date(a.date).getMonth() === now.getMonth() && new Date(a.date).getFullYear() === now.getFullYear()
  ).length;
  const monthsAtRank = monthsBetween(new Date(user.promotedAt), now);
  const next = nextBelt(user.belt);
  const beltIndex = BELT_ORDER.indexOf(user.belt as (typeof BELT_ORDER)[number]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="eyebrow text-flow">My mat</p>
      <h1 className="display-tight mt-2 text-5xl">{user.name}</h1>
      <div className="mt-3"><BeltBadge belt={user.belt} stripes={user.stripes} /></div>

      {/* Belt path */}
      <section className="mt-10 border border-line bg-white p-6">
        <p className="eyebrow text-ink/50">The path</p>
        <div className="mt-4 flex items-center gap-1">
          {BELT_ORDER.map((b, i) => (
            <div key={b} className="flex-1">
              <div
                className={`h-4 border border-ink/30 ${i <= beltIndex ? "" : "opacity-25"}`}
                style={{ backgroundColor: BELT_COLORS[b] }}
                title={BELT_LABELS[b]}
              />
              <p className={`mt-1 font-mono text-[10px] uppercase tracking-widest ${i === beltIndex ? "text-flow" : "text-ink/40"}`}>
                {b.toLowerCase()}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink/70">
          {monthsAtRank} month{monthsAtRank === 1 ? "" : "s"} at {BELT_LABELS[user.belt].toLowerCase()}
          {next ? <> — next stop: <span className="font-medium">{BELT_LABELS[next].toLowerCase()}</span>. Keep showing up.</> : " — the belt is just the beginning."}
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
        <div className="border border-line bg-white p-6">
          <p className="eyebrow text-ink/50">Membership</p>
          <p className="mt-3 font-display text-3xl">$60<span className="text-lg">/mo</span></p>
          <p className="mt-2 text-sm text-ink/70">{SUB_LABELS[user.subscriptionStatus] ?? user.subscriptionStatus}</p>
          <p className="mt-3 text-xs text-ink/50">Online billing is coming — cards will be managed right here.</p>
        </div>
      </section>
    </div>
  );
}

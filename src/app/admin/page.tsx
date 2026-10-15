import Link from "next/link";
import { AttendanceRepo, Inquiries, Users, GROUPS } from "@/lib/db";
import { getSettings, parseSchedule } from "@/lib/settings";
import { BeltBadge } from "@/components/BeltBadge";
import { getBirthdayPromotionInfo } from "@/lib/belts";

export const metadata = { title: "Admin — Imagine Jiu Jitsu" };

export default async function AdminHome() {
  const students = Users.countStudents();
  const activeCount = Users.countActive();
  const todayCount = AttendanceRepo.countToday();
  const openInquiries = Inquiries.countUnhandled();
  const allStudents = Users.students();
  const settings = await getSettings();
  const schedule = parseSchedule(settings.schedule);

  const upcomingBirthdays = allStudents
    .map((s) => ({
      ...s,
      bdayInfo: getBirthdayPromotionInfo(s.dob, s.group, s.belt),
    }))
    .filter(
      (s) =>
        s.bdayInfo &&
        (s.bdayInfo.daysUntilBirthday <= 60 ||
          s.bdayInfo.groupMoveAlert ||
          s.bdayInfo.promotionMilestone)
    )
    .sort(
      (a, b) =>
        (a.bdayInfo?.daysUntilBirthday ?? 999) -
        (b.bdayInfo?.daysUntilBirthday ?? 999)
    );

  const cards = [
    [String(students), "Students", "/admin/roster"],
    [String(upcomingBirthdays.length), "Upcoming Birthdays & Promos", "/admin/roster"],
    [String(todayCount), "Check-ins today", "/admin/attendance"],
    [String(openInquiries), "New inquiries", "/admin/inquiries"],
  ] as const;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([n, label, href]) => (
          <Link key={label} href={href} className="border border-line bg-white p-6 hover:border-flow">
            <p className="font-display text-5xl">{n}</p>
            <p className="eyebrow text-ink/50 mt-1">{label}</p>
          </Link>
        ))}
        <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-between gap-3 border border-line bg-white px-5 py-3.5">
          <p className="text-sm text-ink/70">
            Estimated monthly revenue: <span className="font-mono font-semibold text-ink">${activeCount * 60}</span> ({activeCount} active × $60)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/join"
              className="btn !py-2 !px-4 text-xs"
            >
              + Open Family &amp; Student Onboarding Form →
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Birthdays & Age-Up Promotion Widget */}
      <section className="border-2 border-amber-400 bg-amber-50/40 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-300 pb-3">
          <div>
            <p className="eyebrow text-flow">DOB &amp; Promotion Tracker</p>
            <h2 className="display-tight text-2xl">
              Upcoming Birthdays &amp; Age-Based Promotions
            </h2>
          </div>
          <Link
            href="/admin/roster"
            className="border border-ink bg-white px-3.5 py-2 font-mono text-xs uppercase tracking-wider hover:border-flow hover:text-flow"
          >
            Manage in Roster →
          </Link>
        </div>

        {upcomingBirthdays.length === 0 ? (
          <p className="text-sm text-ink/60">
            No birthdays or age-based group promotions in the next 60 days.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingBirthdays.map((s) => {
              const info = s.bdayInfo!;
              return (
                <div
                  key={s.id}
                  className="border border-amber-300 bg-white p-4 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display uppercase text-lg">{s.name}</span>
                    <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-900">
                      🎂 {info.nextBirthdayFormatted} ({info.daysUntilBirthday}d)
                    </span>
                  </div>
                  <p className="font-mono text-xs text-ink/70">
                    Age {info.age} → Turning <strong>{info.turningAge}</strong> · {s.group}
                  </p>
                  {s.parentName && (
                    <p className="font-mono text-[11px] text-ink/60">
                      Parent: {s.parentName} ({s.parentPhone || s.phone})
                    </p>
                  )}
                  <BeltBadge belt={s.belt} stripes={s.stripes} />
                  {info.groupMoveAlert && (
                    <p className="rounded border border-purple-300 bg-purple-50 px-2 py-1 font-mono text-[11px] font-semibold text-purple-900">
                      ⬆ {info.groupMoveAlert}
                    </p>
                  )}
                  {info.promotionMilestone && (
                    <p className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 font-mono text-[11px] font-semibold text-emerald-900">
                      🥋 {info.promotionMilestone}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Group Members & Schedule Console Quick View */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <p className="eyebrow text-flow">Groups &amp; Schedules</p>
            <h2 className="display-tight text-2xl">Members by Group for Schedule Changes</h2>
          </div>
          <Link href="/admin/schedule" className="btn !py-2 !px-4 text-xs">
            Open Schedule Console →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {GROUPS.map((group) => {
            const groupMembers = allStudents.filter((s) => s.group === group);
            const groupClasses = schedule.filter((c) => c.group === group || c.group === "ALL");
            return (
              <div key={group} className="border border-line bg-white p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <h3 className="font-display uppercase text-xl">{group}</h3>
                    <span className="font-mono text-xs text-flow font-semibold">
                      {groupMembers.length} {groupMembers.length === 1 ? "member" : "members"}
                    </span>
                  </div>

                  {/* Group Schedule Summary */}
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-ink/40">
                      Assigned Classes ({groupClasses.length})
                    </p>
                    {groupClasses.map((c, idx) => (
                      <div key={idx} className="text-xs flex items-center justify-between gap-2 text-ink/80">
                        <span className="font-medium">{c.day}: {c.label}</span>
                        <span className="font-mono text-[11px] text-ink/50 shrink-0">{c.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Group Member List */}
                  <div className="space-y-1.5 pt-2 border-t border-line/60">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-ink/40">
                      Members in Group
                    </p>
                    <ul className="divide-y divide-line/40 max-h-48 overflow-y-auto pr-1">
                      {groupMembers.map((m) => (
                        <li key={m.id} className="py-1.5 flex items-center justify-between gap-2 text-xs">
                          <div>
                            <p className="font-medium text-ink">{m.name}</p>
                            <p className="font-mono text-[10px] text-ink/50">
                              {m.parentName ? `Parent: ${m.parentName} · ` : ""}
                              {m.phone || m.email}
                            </p>
                          </div>
                          <BeltBadge belt={m.belt} stripes={m.stripes} />
                        </li>
                      ))}
                      {groupMembers.length === 0 && (
                        <li className="py-2 text-xs text-ink/50">No members in this group.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <Link
                  href="/admin/schedule"
                  className="border border-line bg-neutral-50 px-3 py-2 text-center font-mono text-xs uppercase tracking-wider text-ink/80 hover:border-flow hover:text-flow transition-colors"
                >
                  Change {group} Schedule &amp; Alert
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

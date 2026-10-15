import Link from "next/link";
import { AttendanceRepo, Inquiries, Users, GROUPS } from "@/lib/db";
import { getSettings, parseSchedule } from "@/lib/settings";
import { BeltBadge } from "@/components/BeltBadge";

export const metadata = { title: "Admin — Imagine Jiu Jitsu" };

export default async function AdminHome() {
  const students = Users.countStudents();
  const activeCount = Users.countActive();
  const todayCount = AttendanceRepo.countToday();
  const openInquiries = Inquiries.countUnhandled();
  const allStudents = Users.students();
  const settings = await getSettings();
  const schedule = parseSchedule(settings.schedule);

  const cards = [
    [String(students), "Students", "/admin/roster"],
    [String(schedule.length), "Weekly classes", "/admin/schedule"],
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
        <p className="sm:col-span-2 lg:col-span-4 text-sm text-ink/60">
          Estimated monthly revenue: <span className="font-mono">${activeCount * 60}</span> ({activeCount} active × $60)
        </p>
      </div>

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
                            <p className="font-mono text-[10px] text-ink/50">{m.phone || m.email}</p>
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


import { AttendanceRepo, Users } from "@/lib/db";
import { getSettings, parseSchedule } from "@/lib/settings";
import { checkIn, undoCheckIn } from "@/app/actions";
import { BeltBadge } from "@/components/BeltBadge";

export const metadata = { title: "Attendance — Admin" };

export default async function AttendancePage() {
  const students = Users.students();
  const today = AttendanceRepo.today();
  const settings = await getSettings();
  const labels = parseSchedule(settings.schedule).map((r) => r.label);
  const classOptions = Array.from(new Set([...labels, "Open Mat", "Private Lesson"]));
  const checkedInIds = new Set(today.map((t) => t.userId));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h1 className="display-tight text-3xl">Take roll</h1>
        <p className="mt-1 text-sm text-ink/60">Tap Check in as students walk on the mat.</p>
        <ul className="mt-4 divide-y divide-line border border-line bg-white">
          {students.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{s.name}</p>
                <BeltBadge belt={s.belt} stripes={s.stripes} />
              </div>
              {checkedInIds.has(s.id) ? (
                <span className="font-mono text-xs uppercase tracking-widest text-flow">On the mat</span>
              ) : (
                <form action={checkIn} className="flex items-center gap-2">
                  <input type="hidden" name="userId" value={s.id} />
                  <select name="classLabel" className="field !w-auto !py-1.5 text-xs">
                    {classOptions.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <button className="btn !px-3 !py-1.5 !text-xs">Check in</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="display-tight text-3xl">Today</h2>
        <p className="mt-1 text-sm text-ink/60">{today.length} check-in{today.length === 1 ? "" : "s"} so far.</p>
        <ul className="mt-4 divide-y divide-line border border-line bg-white">
          {today.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{t.userName} — <span className="text-ink/60">{t.classLabel}</span></span>
              <form action={undoCheckIn}>
                <input type="hidden" name="id" value={t.id} />
                <button className="font-mono text-xs uppercase tracking-widest text-ink/50 hover:text-red-700">Undo</button>
              </form>
            </li>
          ))}
          {today.length === 0 && <li className="px-4 py-3 text-sm text-ink/60">Nobody yet — mats are still cold.</li>}
        </ul>
      </section>
    </div>
  );
}

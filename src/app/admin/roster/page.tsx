import { AttendanceRepo, Users } from "@/lib/db";
import { promoteStudent, addCompetition } from "@/app/actions";
import { BELT_ORDER } from "@/lib/belts";
import { BeltBadge } from "@/components/BeltBadge";

export const metadata = { title: "Roster — Admin" };

export default async function RosterPage() {
  const students = Users.students().map((s) => ({
    ...s,
    classCount: AttendanceRepo.countForUser(s.id),
  }));
  return (
    <div>
      <h1 className="display-tight text-3xl">Roster</h1>
      <p className="mt-1 text-sm text-ink/60">Promote belts, award stripes, log competitions, update membership status.</p>
      <div className="mt-4 space-y-4">
        {students.map((s) => (
          <details key={s.id} className="border border-line bg-white">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span className="font-medium">{s.name} <span className="text-ink/50 text-sm">— {s.email}</span></span>
              <span className="flex items-center gap-4">
                <BeltBadge belt={s.belt} stripes={s.stripes} />
                <span className="font-mono text-xs uppercase tracking-widest text-ink/50">
                  {s.classCount} classes · {s.subscriptionStatus.toLowerCase().replace("_", " ")}
                </span>
              </span>
            </summary>
            <div className="grid gap-6 border-t border-line px-4 py-4 md:grid-cols-2">
              <form action={promoteStudent} className="space-y-3">
                <p className="eyebrow text-ink/50">Rank &amp; membership</p>
                <input type="hidden" name="id" value={s.id} />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="label">Belt</label>
                    <select name="belt" defaultValue={s.belt} className="field">
                      {BELT_ORDER.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="label">Stripes</label>
                    <input name="stripes" type="number" min={0} max={4} defaultValue={s.stripes} className="field" />
                  </div>
                </div>
                <div>
                  <label className="label">Membership</label>
                  <select name="subscriptionStatus" defaultValue={s.subscriptionStatus} className="field">
                    {["TRIAL", "ACTIVE", "PAST_DUE", "CANCELED"].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <button className="btn !py-2 !text-xs">Save</button>
              </form>
              <form action={addCompetition} className="space-y-3">
                <p className="eyebrow text-ink/50">Log a competition</p>
                <input type="hidden" name="userId" value={s.id} />
                <div>
                  <label className="label">Event name</label>
                  <input name="name" className="field" placeholder="Sacramento Open" required />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="label">Date</label>
                    <input name="date" type="date" className="field" required />
                  </div>
                  <div className="flex-1">
                    <label className="label">Result</label>
                    <select name="result" className="field">
                      {["Gold", "Silver", "Bronze", "Competed"].map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Division</label>
                  <input name="division" className="field" placeholder="Adult Blue / Feather" />
                </div>
                <button className="btn !py-2 !text-xs">Add result</button>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { getSettings, parseSchedule } from "@/lib/settings";

export const metadata = { title: "Schedule — Imagine Jiu Jitsu Academy" };

export default async function SchedulePage() {
  const s = await getSettings();
  const schedule = parseSchedule(s.schedule);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-crimson">Training Times · Woodland, CA</p>
          <h1 className="display-tight mt-2 text-6xl sm:text-7xl">
            The week on the mat
          </h1>
          <div className="black-belt-bar mt-5 max-w-sm" aria-hidden />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn">
            Book Free First Class
          </Link>
          <Link href="/join" className="btn-ghost">
            Student Onboarding
          </Link>
        </div>
      </div>

      <div className="mt-12 border-2 border-ink bg-white shadow-editorial">
        <div className="hidden md:grid md:grid-cols-12 bg-ink text-mat px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em]">
          <div className="col-span-4">Day &amp; Program Group</div>
          <div className="col-span-3">Class Time</div>
          <div className="col-span-5">Session Focus &amp; Live Notes</div>
        </div>
        <div className="divide-y divide-line">
          {schedule.map((row, idx) => (
            <div
              key={row.day + row.time + idx}
              className="grid gap-3 px-6 py-5 md:grid-cols-12 md:items-center hover:bg-mat/50 transition-colors"
            >
              <div className="md:col-span-4 flex flex-wrap items-center gap-3">
                <p className="font-display uppercase text-3xl text-ink min-w-[120px]">
                  {row.day}
                </p>
                <span className="inline-block font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 border border-ink/20 bg-mat text-ink font-semibold">
                  {!row.group || row.group === "ALL" ? "All Groups" : row.group}
                </span>
              </div>
              <div className="md:col-span-3">
                <p className="font-mono text-sm font-semibold tracking-wide text-crimson">
                  {row.time}
                </p>
              </div>
              <div className="md:col-span-5 space-y-1.5">
                <p className="text-ink font-medium text-base">{row.label}</p>
                {row.note && (
                  <p className="inline-block rounded bg-amber-100 border border-amber-300 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-950">
                    ⚠ {row.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="border border-line bg-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-crimson font-semibold">
            01 / Arrival
          </p>
          <h2 className="font-display text-2xl uppercase mt-1">Doors Open 15 Min Early</h2>
          <p className="mt-1.5 text-sm text-ink/70">
            Arrive a few minutes early to get taped up, step onto the mat cleanly, and warm up before instruction starts.
          </p>
        </div>
        <div className="border border-line bg-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-crimson font-semibold">
            02 / All-Inclusive
          </p>
          <h2 className="font-display text-2xl uppercase mt-1">Every Session Included</h2>
          <p className="mt-1.5 text-sm text-ink/70">
            Every class on the board is included in the single $60/month membership — Gi, No-Gi, and Sunday Dawn Patrol Open Mat.
          </p>
        </div>
        <div className="border border-line bg-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-crimson font-semibold">
            03 / Live Updates
          </p>
          <h2 className="font-display text-2xl uppercase mt-1">Real-Time Mat Alerts</h2>
          <p className="mt-1.5 text-sm text-ink/70">
            Any holiday hours, seminar notes, or open mat adjustments posted by Coach Sean appear right on this board automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

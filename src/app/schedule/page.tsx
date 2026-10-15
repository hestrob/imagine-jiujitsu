import Link from "next/link";
import { getSettings, parseSchedule } from "@/lib/settings";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";

export const metadata = { title: "Schedule — Imagine Jiu Jitsu Academy" };

export default async function SchedulePage() {
  const s = await getSettings();
  const schedule = parseSchedule(s.schedule);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-crimson">Training Calendar · Woodland, CA</p>
          <h1 className="display-tight mt-2 text-6xl sm:text-7xl">
            The week on the mat
          </h1>
          <div className="black-belt-bar mt-5 max-w-sm" aria-hidden />
          <p className="mt-4 max-w-xl text-sm sm:text-base text-ink/75">
            Each age group is color-coded on our weekly calendar below. Click any program color to filter classes for your group.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn">
            Book Free First Class
          </Link>
          <Link href="/join" className="btn-ghost">
            Student &amp; Family Onboarding →
          </Link>
        </div>
      </div>

      {/* Color-Coded Weekly Calendar */}
      <div className="mt-10">
        <ScheduleCalendar schedule={schedule} />
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
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
            Any holiday hours, seminar notes, or open mat adjustments posted by Coach Sean appear right on this calendar automatically.
          </p>
        </div>
      </div>
    </div>
  );
}


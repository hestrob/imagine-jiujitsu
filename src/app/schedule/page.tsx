import Link from "next/link";
import { getSettings, parseSchedule } from "@/lib/settings";

export const metadata = { title: "Schedule — Imagine Jiu Jitsu" };

export default async function SchedulePage() {
  const s = await getSettings();
  const schedule = parseSchedule(s.schedule);
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="eyebrow text-flow">Training times</p>
      <h1 className="display-tight mt-3 text-6xl">The week on the mat</h1>
      <div className="belt-line mt-6 max-w-sm" aria-hidden />
      <div className="mt-10 divide-y divide-line border border-line bg-white">
        {schedule.map((row) => (
          <div key={row.day + row.time} className="grid gap-1 px-6 py-5 md:grid-cols-3 md:items-center">
            <p className="font-display uppercase text-2xl">{row.day}</p>
            <p className="font-mono text-sm tracking-wide text-flow">{row.time}</p>
            <p className="text-ink/75">{row.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink/60">
        Every class is included in the single $60/month membership — come to one,
        come to all of them. Doors open 15 minutes early.
      </p>
      <div className="mt-8">
        <Link href="/contact" className="btn">Book a free first class</Link>
      </div>
    </div>
  );
}

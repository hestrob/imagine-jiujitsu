import { getSettings, parseSchedule } from "@/lib/settings";
import { InquiryForm } from "./InquiryForm";

export const metadata = { title: "Visit — Imagine Jiu Jitsu" };

export default async function ContactPage() {
  const s = await getSettings();
  const schedule = parseSchedule(s.schedule);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="eyebrow text-flow">Visit</p>
      <h1 className="display-tight mt-3 text-6xl">Your first class is free</h1>
      <div className="belt-line mt-6 max-w-sm" aria-hidden />
      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <InquiryForm />
        <div className="space-y-6">
          <div>
            <p className="eyebrow text-ink/50">Find us</p>
            <p className="mt-1 text-lg">{s.address}</p>
            {s.phone && (
              <p className="text-ink/70">
                <a href={`tel:${s.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-flow hover:underline transition-colors">
                  {s.phone}
                </a>
              </p>
            )}
            {s.email && (
              <p className="text-ink/70">
                <a href={`mailto:${s.email}`} className="hover:text-flow hover:underline transition-colors">
                  {s.email}
                </a>
              </p>
            )}
          </div>
          <div>
            <p className="eyebrow text-ink/50">Doors open</p>
            <ul className="mt-1 space-y-1 text-ink/80">
              {schedule.map((r) => (
                <li key={r.day}><span className="font-mono text-sm text-flow">{r.day}</span> — {r.time}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-ink/50">Follow</p>
            <div className="mt-1 flex gap-4 font-mono text-xs uppercase tracking-widest">
              {s.facebook && <a className="underline hover:text-flow" href={s.facebook} target="_blank" rel="noreferrer">Facebook</a>}
              {s.instagram && <a className="underline hover:text-flow" href={s.instagram} target="_blank" rel="noreferrer">Instagram</a>}
              {s.yelp && <a className="underline hover:text-flow" href={s.yelp} target="_blank" rel="noreferrer">Yelp</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

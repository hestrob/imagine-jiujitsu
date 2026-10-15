import { getSettings, parseSchedule } from "@/lib/settings";
import { InquiryForm } from "./InquiryForm";

export const metadata = { title: "Visit & Free Trial — Imagine Jiu Jitsu" };

export default async function ContactPage() {
  const s = await getSettings();
  const schedule = parseSchedule(s.schedule);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <p className="eyebrow text-crimson">Visit the Dojo · Woodland, CA</p>
      <h1 className="display-tight mt-2 text-6xl sm:text-7xl">
        Your first week is free
      </h1>
      <div className="black-belt-bar mt-5 max-w-sm" aria-hidden />

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7 border-2 border-ink bg-white p-6 sm:p-8 shadow-editorial">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-crimson font-semibold">
                Free Trial / Drop-In Inquiry
              </p>
              <h2 className="font-display text-3xl uppercase mt-0.5">
                Send a message to Coach Sean
              </h2>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-seal-circle.png"
              alt="Imagine Jiu Jitsu Seal"
              className="h-12 w-12 rounded-full ring-1 ring-ink/15 hidden sm:block"
            />
          </div>
          <InquiryForm />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="border border-line bg-white p-6 space-y-5">
            <div>
              <p className="eyebrow text-crimson">Academy Location</p>
              <p className="mt-1.5 font-display text-2xl uppercase">{s.address}</p>
              {s.phone && (
                <p className="mt-2 font-mono text-sm text-ink/80">
                  Phone:{" "}
                  <a
                    href={`tel:${s.phone.replace(/[^0-9+]/g, "")}`}
                    className="font-semibold text-ink hover:text-crimson underline transition-colors"
                  >
                    {s.phone}
                  </a>
                </p>
              )}
            </div>

            <div className="border-t border-line pt-5">
              <p className="eyebrow text-crimson">Weekly Mat Hours</p>
              <ul className="mt-2.5 space-y-2 text-sm text-ink/80">
                {schedule.map((r, i) => (
                  <li key={r.day + i} className="flex items-baseline justify-between gap-2 border-b border-line/60 pb-1.5 last:border-b-0">
                    <span className="font-mono text-xs uppercase font-semibold text-ink">
                      {r.day}{" "}
                      <span className="text-ink/50 font-normal">
                        ({!r.group || r.group === "ALL" ? "All" : r.group})
                      </span>
                    </span>
                    <span className="font-mono text-xs text-crimson font-semibold">{r.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line pt-5">
              <p className="eyebrow text-crimson">Community Links</p>
              <div className="mt-2 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-widest">
                {s.facebook && (
                  <a className="underline hover:text-crimson" href={s.facebook} target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                )}
                {s.instagram && (
                  <a className="underline hover:text-crimson" href={s.instagram} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                )}
                {s.yelp && (
                  <a className="underline hover:text-crimson" href={s.yelp} target="_blank" rel="noreferrer">
                    Yelp Reviews
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="border border-line bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/mat-respect.jpg"
              alt="Handshake on the mats at Imagine Jiu Jitsu"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

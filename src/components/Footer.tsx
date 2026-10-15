import Link from "next/link";
import { getSettings } from "@/lib/settings";

export async function Footer() {
  const s = await getSettings();
  return (
    <footer className="relative overflow-hidden gi-weave text-mat mt-24">
      <div className="black-belt-bar-light" aria-hidden />

      {/* Subtle Enso watermark in background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-seal-light.png"
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute -right-20 -bottom-20 h-96 w-96 opacity-[0.04] object-contain"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-12">
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-seal-circle.png"
              alt="Imagine Jiu Jitsu Enso Seal"
              className="h-16 w-16 rounded-full border border-white/20 shadow-md shrink-0"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-script-light.png"
              alt="Imagine Jiu Jitsu Academy"
              className="h-12 w-auto object-contain"
            />
          </div>
          <p className="text-sm text-mat/70 max-w-sm leading-relaxed">
            Traditional roots and Brazilian Jiu Jitsu pressure in Woodland, California.
            Self defense, ego-free community, and personal growth — $60/month unlimited.
          </p>
          <div className="pt-1 space-y-1 text-sm text-mat/80 font-mono">
            <p>{s.address}</p>
            {s.phone && (
              <p>
                <a
                  href={`tel:${s.phone.replace(/[^0-9+]/g, "")}`}
                  className="text-white hover:text-crimson-bright hover:underline transition-colors"
                >
                  {s.phone}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Academy Navigation */}
        <div className="md:col-span-3 font-mono text-xs uppercase tracking-widest space-y-2.5">
          <p className="text-crimson-bright font-bold">The Academy</p>
          <p><Link className="text-mat/75 hover:text-white transition-colors" href="/about">About Imagine</Link></p>
          <p><Link className="text-mat/75 hover:text-white transition-colors" href="/schedule">Weekly Schedule</Link></p>
          <p><Link className="text-mat/75 hover:text-white transition-colors" href="/pricing">Pricing — $60/mo</Link></p>
          <p><Link className="text-mat/75 hover:text-white transition-colors" href="/gallery">Life on the Mat</Link></p>
          <p><Link className="text-mat/75 hover:text-white transition-colors" href="/video">The Video Wall</Link></p>
          <p><Link className="text-mat/75 hover:text-white transition-colors" href="/contact">Book a Free Class</Link></p>
        </div>

        {/* Programs & Groups */}
        <div className="md:col-span-2 font-mono text-xs uppercase tracking-widest space-y-2.5">
          <p className="text-crimson-bright font-bold">Programs</p>
          <p><Link className="text-mat/75 hover:text-white transition-colors" href="/schedule">Kids (5–6)</Link></p>
          <p><Link className="text-mat/75 hover:text-white transition-colors" href="/schedule">Juniors (7–12)</Link></p>
          <p><Link className="text-mat/75 hover:text-white transition-colors" href="/schedule">Adults Gi &amp; No-Gi</Link></p>
          <p><Link className="text-mat/75 hover:text-white transition-colors" href="/schedule">Dawn Patrol Open Mat</Link></p>
        </div>

        {/* Follow & Portal */}
        <div className="md:col-span-2 font-mono text-xs uppercase tracking-widest space-y-2.5">
          <p className="text-crimson-bright font-bold">Community</p>
          <p><Link className="text-mat/75 hover:text-white transition-colors" href="/login">Student Sign In</Link></p>
          <p><Link className="text-mat/75 hover:text-white transition-colors" href="/join">Create Account</Link></p>
          {s.facebook && (
            <p>
              <a className="text-mat/75 hover:text-white transition-colors" href={s.facebook} target="_blank" rel="noreferrer">
                Facebook ↗
              </a>
            </p>
          )}
          {s.instagram && (
            <p>
              <a className="text-mat/75 hover:text-white transition-colors" href={s.instagram} target="_blank" rel="noreferrer">
                Instagram ↗
              </a>
            </p>
          )}
          {s.yelp && (
            <p>
              <a className="text-mat/75 hover:text-white transition-colors" href={s.yelp} target="_blank" rel="noreferrer">
                Yelp Reviews ↗
              </a>
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-widest text-mat/45">
          <p>© {new Date().getFullYear()} Imagine Jiu Jitsu Academy — Woodland, CA</p>
          <p>Self Defense · Community · Personal Growth</p>
        </div>
      </div>
    </footer>
  );
}


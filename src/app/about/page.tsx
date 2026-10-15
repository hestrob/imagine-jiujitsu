import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "About — Imagine Jiu Jitsu Academy" };

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <div>
      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-ink text-mat gi-weave border-b border-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-seal-light.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute -right-24 -top-24 w-[480px] opacity-[0.04]"
        />
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 relative z-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2.5 border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-crimson" />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mat/90">
                  About the Academy · Woodland, CA
                </span>
              </div>
              <h1 className="display-tight mt-5 text-5xl sm:text-6xl md:text-7xl text-white">
                The imagination is <span className="text-crimson-bright">the first rep.</span>
              </h1>
              <div className="black-belt-bar-light mt-6 max-w-md" aria-hidden />
              <p className="mt-6 text-lg text-mat/80 leading-relaxed max-w-2xl">
                Imagine Jiu Jitsu is a martial arts academy in Woodland, California that blends
                traditional martial arts values and Brazilian Jiu Jitsu with an emphasis on
                self-defense, building community, and lifelong personal growth.
              </p>
            </div>
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative border border-white/15 bg-ink-soft/90 p-6 sm:p-8 text-center shadow-2xl max-w-sm w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo-seal-circle.png"
                  alt="Imagine Jiu Jitsu Enso Seal"
                  className="mx-auto h-36 w-36 rounded-full ring-2 ring-crimson/60 shadow-xl"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo-script-light.png"
                  alt="Imagine Jiu Jitsu Academy"
                  className="mx-auto mt-5 h-12 w-auto object-contain"
                />
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mat/60">
                  Traditional Roots · Modern Pressure · Ego-Free Mat
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY + TEAM PHOTO */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6 space-y-5 text-lg text-ink/80 leading-relaxed">
            <p className="eyebrow text-crimson">Why &ldquo;Imagine&rdquo;</p>
            <h2 className="display-tight text-4xl sm:text-5xl text-ink">
              Picture the technique. Train the body to match it.
            </h2>
            <p>
              The name is the method. Before any technique works against live resistance, you
              have to be able to picture yourself doing it — surviving the bad position,
              framing out of cross-face pressure, finishing the sweep, or simply walking onto
              the mat for the very first time.
            </p>
            <p>
              Our circular Enso brush emblem represents presence, discipline, and continuous
              refinement — while the black belt and red rank bar in our signature script honor
              the lineage and technical standards of Brazilian Jiu Jitsu.
            </p>
            <p>
              The room stays spotless, the culture stays ego-free, and everyone from five-year-old
              beginners to experienced adult grapplers shares the same standard of mutual respect.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="border-2 border-ink bg-white p-2 shadow-editorial">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/photos/team-gi.jpg"
                alt="Imagine Jiu Jitsu Academy Team on the mats in Woodland, CA"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="flex items-center justify-between px-2 pt-2 font-mono text-[10px] uppercase tracking-widest text-ink/60">
                <span>Adult Gi Team &amp; Lineage Wall</span>
                <span className="text-crimson font-semibold">2548 Allen Cir · Woodland</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-line bg-white p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/photos/team-nogi.jpg"
                  alt="No-Gi night team photo"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
              <div className="border border-line bg-white p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/photos/kids-lineup.jpg"
                  alt="Youth and Juniors class lineup"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HEAD INSTRUCTOR */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <div className="relative border-2 border-ink bg-mat p-2 shadow-editorial">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/photos/coach-sean.jpg"
                  alt={`${s.coachName} — Head Instructor at Imagine Jiu Jitsu`}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="mt-2 flex items-center justify-between px-1 py-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/70">
                    {s.coachName} · Head Instructor
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-crimson font-semibold">
                    <span className="h-2 w-4 bg-ink border-r-4 border-crimson inline-block" />
                    Black Belt
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <p className="eyebrow text-crimson">Head Instructor</p>
              <h2 className="display-tight mt-2 text-5xl sm:text-6xl">{s.coachName}</h2>
              <div className="black-belt-bar mt-4 max-w-xs" aria-hidden />
              <p className="mt-6 text-lg text-ink/80 leading-relaxed">
                {s.coachBio.replace(/\s*\(EDIT ME:.*?\)\s*/i, "")}
              </p>
              <p className="mt-4 text-ink/75 leading-relaxed">
                On any given evening at Imagine, you&apos;ll find {s.coachName} on the mats teaching
                kids how to breakfall safely, walking adults through the finer details of guard
                retention and pins, and rolling live rounds alongside the team.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="btn">
                  Book Your Free First Week
                </Link>
                <Link href="/schedule" className="btn-ghost">
                  See Class Schedule
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

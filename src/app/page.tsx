import Link from "next/link";
import { getSettings, parseSchedule } from "@/lib/settings";

export default async function HomePage() {
  const s = await getSettings();
  const schedule = parseSchedule(s.schedule);

  return (
    <>
      {/* Hero */}
      <section className="gi-weave text-mat">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="eyebrow text-mat/60 rise">Woodland, California — est. on the mat</p>
          <h1 className="display-tight mt-4 text-[clamp(4rem,14vw,11rem)] rise">
            Imagine<span className="text-flow">.</span>
          </h1>
          <p className="display-tight mt-2 text-[clamp(1.5rem,4.5vw,3rem)] text-mat/85 rise-2">
            Then train until it&apos;s true.
          </p>
          <div className="belt-line mt-8 max-w-xl rise-2" aria-hidden />
          <p className="mt-6 max-w-xl text-mat/75 rise-3">
            Traditional roots. Brazilian Jiu Jitsu pressure. A clean, welcoming
            room where self defense, community, and personal growth are the whole
            point — not the fine print.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 rise-3">
            <Link href="/contact" className="btn !bg-flow hover:!bg-mat hover:!text-ink">Book a free first class</Link>
            <Link href="/pricing" className="btn-ghost !border-mat !text-mat hover:!bg-mat hover:!text-ink">
              $60/mo · unlimited
            </Link>
          </div>
        </div>
      </section>

      {/* Schedule strip */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-px px-4 py-6 md:grid-cols-4">
          {schedule.map((row) => (
            <div key={row.day + row.time} className="py-3 md:px-4 md:border-l first:border-l-0 border-line">
              <p className="font-mono text-xs uppercase tracking-widest text-flow">{row.day}</p>
              <p className="font-display uppercase text-xl">{row.time}</p>
              <p className="text-sm text-ink/70">{row.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="eyebrow text-flow">Why we train</p>
        <div className="mt-6 grid gap-10 md:grid-cols-3">
          <div>
            <h2 className="display-tight text-3xl">Self defense first</h2>
            <p className="mt-3 text-ink/75">
              Technique that works against real pressure, taught from day one.
              You leave every class a little harder to hold down.
            </p>
          </div>
          <div>
            <h2 className="display-tight text-3xl">Community always</h2>
            <p className="mt-3 text-ink/75">
              Training partners become your people. A clean room, an ego-free
              culture, and coaches who know your name by the second class.
            </p>
          </div>
          <div>
            <h2 className="display-tight text-3xl">Growth forever</h2>
            <p className="mt-3 text-ink/75">
              White to black is measured in years, not weeks. Track your belt
              progress, your attendance, your competitions — watch it stack up.
            </p>
          </div>
        </div>
      </section>

      {/* Coach */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
          <div>
            <p className="eyebrow text-flow">Head instructor</p>
            <h2 className="display-tight mt-3 text-5xl">{s.coachName}</h2>
            <p className="mt-4 text-ink/75">{s.coachBio}</p>
            <blockquote className="mt-6 border-l-4 border-belt-purple pl-4 text-ink/80 italic">
              &ldquo;A clean, welcoming space to train with an emphasis on hygiene
              and safety.&rdquo;
              <span className="not-italic block mt-1 font-mono text-xs uppercase tracking-widest text-ink/50">— student review, Yelp</span>
            </blockquote>
          </div>
          <div className="gi-weave flex aspect-[4/3] items-center justify-center text-mat/40">
            <p className="font-mono text-xs uppercase tracking-widest">Coach photo goes here</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="display-tight text-[clamp(2.5rem,7vw,5rem)]">
          First class is free<span className="text-flow">.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-ink/75">
          No gi? No experience? No problem. Come watch or jump in —
          then it&apos;s $60 a month for unlimited everything.
        </p>
        <div className="mt-8">
          <Link href="/contact" className="btn">Claim your free class</Link>
        </div>
      </section>
    </>
  );
}

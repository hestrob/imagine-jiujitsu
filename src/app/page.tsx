import Link from "next/link";
import { getSettings, parseSchedule } from "@/lib/settings";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";

export default async function HomePage() {
  const s = await getSettings();
  const schedule = parseSchedule(s.schedule);

  const programs = [
    {
      group: "Kids (5–6)",
      badgeClass: "bg-amber-500 text-white border-amber-400",
      title: "Little Grapplers",
      subtitle: "Balance · Coordination · Confidence",
      desc: "Structured mat games, fundamental movement, safe falling, and age-appropriate self defense in an encouraging environment.",
      img: "/photos/kids-warmup.jpg",
      days: "Mon & Wed · 4:00 – 4:45 PM",
    },
    {
      group: "Juniors (7–12)",
      badgeClass: "bg-purple-600 text-white border-purple-400",
      title: "Youth Gi & No-Gi",
      subtitle: "Technique · Discipline · Anti-Bullying",
      desc: "Real Brazilian Jiu Jitsu fundamentals, positional control, and live drilling that build resilience on and off the mat.",
      img: "/photos/kids-lineup.jpg",
      days: "Mon, Wed & Fri · 5:00 – 6:00 PM",
    },
    {
      group: "Adults (13+)",
      badgeClass: "bg-blue-600 text-white border-blue-400",
      title: "Adults Gi, No-Gi & Open Mat",
      subtitle: "Self Defense · Pressure · Community",
      desc: "Traditional roots meet modern Brazilian Jiu Jitsu pressure. Fundamentals, all-levels Gi, Friday No-Gi, and Sunday Dawn Patrol.",
      img: "/photos/nogi-takedown.jpg",
      days: "Mon, Wed, Fri 6:00 PM & Sun 6:30 AM",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden gi-weave text-mat">
        {/* Subtle real photo background texture */}
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.14] mix-blend-luminosity"
          style={{ backgroundImage: "url('/photos/team-gi.jpg')" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/95 to-ink/75"
          aria-hidden
        />
        {/* Watermark Enso Seal */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-seal-light.png"
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute -right-24 -top-24 h-[520px] w-[520px] opacity-[0.05] object-contain"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-12">
          {/* Left Hero Copy & Script Logo */}
          <div className="lg:col-span-7">
            <div className="inline-flex flex-wrap items-center gap-2 border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-sm rise">
              <span className="h-2 w-2 rounded-full bg-crimson-bright" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mat/90">
                Woodland, California · Est. on the Mat
              </span>
            </div>

            {/* Official Imagine Jiu Jitsu Academy Script Logo */}
            <div className="mt-6 rise">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-script-light.png"
                alt="Imagine Jiu Jitsu Academy"
                className="w-full max-w-[460px] h-auto object-contain drop-shadow-lg"
              />
              <h1 className="sr-only">Imagine Jiu Jitsu Academy — Woodland, CA</h1>
            </div>

            <p className="display-tight mt-5 text-[clamp(1.75rem,4vw,3rem)] text-mat/95 rise-2">
              Picture it first. <span className="text-crimson-bright">Then train until it&apos;s true.</span>
            </p>

            <div className="black-belt-bar-light mt-6 max-w-lg rise-2" aria-hidden />

            <p className="mt-6 max-w-xl text-base sm:text-lg text-mat/80 leading-relaxed rise-3">
              Traditional roots. Brazilian Jiu Jitsu pressure. A clean, welcoming
              academy in Woodland where self defense, community, and personal growth
              are the whole point — not the fine print.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5 rise-3">
              <Link href="/contact" className="btn !bg-crimson-bright hover:!bg-white hover:!text-ink">
                Book a Free First Class →
              </Link>
              <Link
                href="/join"
                className="btn-blue !bg-flow hover:!bg-white hover:!text-ink"
              >
                Student &amp; Family Onboarding →
              </Link>
              <Link
                href="/pricing"
                className="btn-ghost !border-mat/40 !text-mat hover:!bg-mat hover:!text-ink"
              >
                $60/mo · Unlimited
              </Link>
            </div>

            {/* Quick Value Highlights */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 max-w-lg rise-3">
              <div>
                <p className="font-display text-2xl sm:text-3xl text-white">$60<span className="text-sm text-mat/60">/mo</span></p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-mat/60">Every class included</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl text-white">1st Week</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-crimson-bright font-bold">100% Free Trial</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl text-white">Ages 5+</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-mat/60">Kids · Juniors · Adults</p>
              </div>
            </div>
          </div>

          {/* Right Hero Editorial Collage + Enso Seal Badge */}
          <div className="relative lg:col-span-5 rise-2">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Photo */}
              <div className="relative overflow-hidden border-2 border-white/20 bg-ink shadow-editorial-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/photos/team-gi.jpg"
                  alt="Coach Sean and the Imagine Jiu Jitsu Gi Team in Woodland, CA"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="bg-ink/90 border-t border-white/10 px-4 py-2.5 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mat/80">
                    Adult Gi &amp; No-Gi · Woodland, CA
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-crimson-bright font-bold">
                    All Belts Welcome
                  </span>
                </div>
              </div>

              {/* Secondary Photos Row */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="overflow-hidden border border-white/15 bg-ink shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/photos/coach-coaching.jpg"
                    alt="Coach Sean teaching technique on the mat"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden border border-white/15 bg-ink shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/photos/kids-lineup.jpg"
                    alt="Imagine Jiu Jitsu Youth and Juniors class"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              </div>

              {/* Floating Official Enso Seal Badge */}
              <div className=" -top-6 -right-4 sm:-right-6 absolute z-10 rounded-full bg-white p-1 shadow-editorial-lg border-2 border-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo-seal-circle.png"
                  alt="Imagine Jiu Jitsu Woodland CA Enso Seal"
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Student & Family Onboarding Callout Bar */}
      <section className="border-b-2 border-ink bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-flow bg-mat/60 p-5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-flow text-white font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5">
                  New &amp; Existing Students
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-ink/60">
                  Takes 60 Seconds · Supports Multiple Family Members
                </span>
              </div>
              <h2 className="font-display uppercase text-2xl sm:text-3xl text-ink">
                Student &amp; Family Onboarding Portal
              </h2>
              <p className="text-sm text-ink/75 max-w-2xl">
                Joining for your first week or already training on the mat? Complete your student or family profile to register your Date of Birth for birthday belt promotions, current rank, and SMS schedule alerts.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/join" className="btn-blue !py-3 !px-6 text-xs">
                Complete Student Onboarding →
              </Link>
              <Link href="/login" className="btn-ghost !py-3 !px-5 text-xs">
                Member Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Weekly Schedule Calendar Section */}
      <section className="border-b border-line bg-mat/40 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <p className="eyebrow text-crimson font-bold">Weekly Training Calendar</p>
              <h2 className="display-tight mt-1 text-4xl sm:text-5xl">The Week on the Mat</h2>
              <p className="mt-2 text-sm text-ink/70 max-w-xl">
                Color-coded by age group so you can spot your class at a glance. Click any group below to filter the calendar.
              </p>
            </div>
            <Link href="/schedule" className="font-mono text-xs uppercase tracking-widest font-bold text-flow hover:text-crimson transition-colors">
              Open Full Schedule Page →
            </Link>
          </div>

          <ScheduleCalendar schedule={schedule} compact />
        </div>
      </section>

      {/* Programs for Every Age */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-crimson font-bold">Programs &amp; Groups</p>
            <h2 className="display-tight mt-2 text-5xl">One Mat. Every Generation.</h2>
          </div>
          <p className="max-w-md text-sm text-ink/70">
            Every membership is a flat $60/month with unlimited training across your
            age group&apos;s classes — no belt testing fees, no multi-tier upsells.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {programs.map((prog) => (
            <article
              key={prog.group}
              className="group flex flex-col overflow-hidden border border-line bg-white shadow-editorial transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prog.img}
                  alt={prog.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className={`absolute top-3 left-3 border px-3 py-1 font-mono text-[11px] uppercase tracking-widest font-bold shadow-sm ${prog.badgeClass}`}>
                  {prog.group}
                </span>
              </div>
              <div className="black-belt-bar" aria-hidden />
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-crimson font-bold">
                    {prog.subtitle}
                  </p>
                  <h3 className="display-tight mt-1 text-3xl">{prog.title}</h3>
                  <p className="mt-3 text-sm text-ink/75 leading-relaxed">{prog.desc}</p>
                </div>
                <div className="mt-6 border-t border-line pt-4 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-ink/60">{prog.days}</span>
                  <Link
                    href="/contact"
                    className="font-mono text-xs uppercase tracking-widest font-bold text-flow hover:text-crimson"
                  >
                    Try Free →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Philosophy Section with Brand Seal Watermark */}
      <section className="relative overflow-hidden border-y border-line bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-seal-dark.png"
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute -left-24 top-1/2 -translate-y-1/2 h-96 w-96 opacity-[0.035] object-contain"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-crimson font-bold">Why We Train</p>
              <h2 className="display-tight mt-2 text-5xl">The Imagine Standard</h2>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-script-dark.png"
              alt="Imagine Jiu Jitsu Academy"
              className="h-12 w-auto object-contain opacity-90"
            />
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="border border-line bg-mat/40 p-7">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-crimson">01 / Pressure Tested</p>
              <h3 className="display-tight mt-2 text-3xl">Self Defense First</h3>
              <p className="mt-3 text-ink/75 leading-relaxed">
                Technique that works against real resistance, taught clearly from day one.
                You leave every class a little calmer under pressure and harder to hold down.
              </p>
            </div>
            <div className="border border-line bg-mat/40 p-7">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-flow">02 / Zero Ego</p>
              <h3 className="display-tight mt-2 text-3xl">Community Always</h3>
              <p className="mt-3 text-ink/75 leading-relaxed">
                Training partners become your people. A spotless mat, an ego-free
                culture, and coaches who know your name by your second class.
              </p>
            </div>
            <div className="border border-line bg-mat/40 p-7">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-belt-purple">03 / The Long Path</p>
              <h3 className="display-tight mt-2 text-3xl">Growth Forever</h3>
              <p className="mt-3 text-ink/75 leading-relaxed">
                White to black is measured in years, not weeks. Track your belt
                progress, your attendance, and your competitions right in your student portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Head Instructor — Coach Sean */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-seal-dark.png"
                alt="Imagine Jiu Jitsu Seal"
                className="h-12 w-12 object-contain"
              />
              <div>
                <p className="eyebrow text-crimson font-bold">Head Instructor</p>
                <p className="font-mono text-xs uppercase tracking-widest text-ink/60">Black Belt · Woodland, CA</p>
              </div>
            </div>

            <h2 className="display-tight text-5xl sm:text-6xl">{s.coachName}</h2>
            <div className="black-belt-bar max-w-xs" aria-hidden />
            <p className="text-base sm:text-lg text-ink/80 leading-relaxed">{s.coachBio}</p>

            <blockquote className="border-l-4 border-crimson bg-white p-5 shadow-sm text-ink/85 italic">
              &ldquo;A clean, welcoming space to train with an emphasis on hygiene,
              safety, and real technique for adults and kids alike.&rdquo;
              <span className="not-italic block mt-2 font-mono text-xs uppercase tracking-widest text-ink/50">
                — Verified Student Review, Yelp
              </span>
            </blockquote>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link href="/about" className="btn-ghost">
                Read Our Story
              </Link>
              <Link href="/contact" className="btn">
                Train With {s.coachName}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-7 overflow-hidden border-2 border-ink bg-white shadow-editorial">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/photos/coach-sean.jpg"
                alt={`${s.coachName} on the mat at Imagine Jiu Jitsu`}
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
            <div className="col-span-5 space-y-4">
              <div className="overflow-hidden border border-line bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/photos/mat-respect.jpg"
                  alt="Respect on the mat with Coach Sean"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="overflow-hidden border border-line bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/photos/kids-coaching.jpg"
                  alt="Coach Sean instructing youth Jiu Jitsu"
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Life on the Mat — Gallery Preview Strip */}
      <section className="border-t border-line bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-flow font-bold">Inside the Room</p>
              <h2 className="display-tight mt-1 text-4xl">Life on the Woodland Mat</h2>
            </div>
            <Link href="/gallery" className="btn-ghost !py-2.5 !px-4 !text-xs">
              Explore Full Gallery →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { src: "/photos/team-nogi.jpg", label: "No-Gi Team Nights" },
              { src: "/photos/kids-rolling.jpg", label: "Youth & Juniors Gi" },
              { src: "/photos/nogi-pressure.jpg", label: "Live Rounds & Pressure" },
              { src: "/photos/coach-standing.jpg", label: "Lineage & Respect" },
            ].map((item) => (
              <Link
                key={item.src}
                href="/gallery"
                className="group relative overflow-hidden border border-line bg-ink"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.label}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="bg-white px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-ink/80 flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="text-crimson">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto max-w-6xl px-4 pt-16">
        <div className="relative overflow-hidden gi-weave text-mat border-2 border-ink p-8 sm:p-14 shadow-editorial-lg">
          <div className="black-belt-bar-light absolute top-0 left-0 right-0" aria-hidden />
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-seal-circle.png"
                alt="Imagine Jiu Jitsu Seal"
                className="h-24 w-24 rounded-full border-2 border-white/20 shadow-md shrink-0"
              />
              <div>
                <p className="eyebrow text-crimson-bright font-bold">Start Your Journey</p>
                <h2 className="display-tight mt-2 text-[clamp(2.25rem,5vw,4rem)]">
                  Your First Week Is Free<span className="text-crimson-bright">.</span>
                </h2>
                <p className="mt-3 max-w-xl text-mat/75">
                  No gi? No experience? No problem. Come watch a class or jump right in —
                  then it&apos;s just $60 a month for unlimited training with zero contracts.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link href="/contact" className="btn !bg-crimson-bright hover:!bg-white hover:!text-ink text-center">
                Claim Your Free Class
              </Link>
              <Link href="/join" className="btn-ghost !border-mat/40 !text-mat hover:!bg-mat hover:!text-ink text-center">
                Student &amp; Family Onboarding →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


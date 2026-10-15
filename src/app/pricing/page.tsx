import Link from "next/link";

export const metadata = { title: "Membership & Pricing — Imagine Jiu Jitsu" };

export default function PricingPage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <p className="eyebrow text-crimson">Simple, Honest Membership</p>
          <h1 className="display-tight mt-3 text-6xl sm:text-7xl">
            One price. Every class.
          </h1>
          <p className="mt-4 text-lg text-ink/75">
            No long-term contracts, no sign-up fees, and no hidden tiers. Every student gets
            a full free week to experience the academy before paying a dime.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* MAIN MEMBERSHIP CARD */}
          <div className="lg:col-span-7 border-2 border-ink bg-white shadow-editorial-lg flex flex-col justify-between">
            <div>
              <div className="black-belt-bar" aria-hidden />
              <div className="p-8 sm:p-10">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
                  <div className="flex items-center gap-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/brand/logo-seal-circle.png"
                      alt="Imagine Jiu Jitsu Seal"
                      className="h-14 w-14 rounded-full ring-1 ring-ink/15"
                    />
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-crimson font-semibold">
                        All-Access Academy Pass
                      </span>
                      <h2 className="font-display text-3xl uppercase tracking-tight text-ink">
                        Unlimited Membership
                      </h2>
                    </div>
                  </div>
                  <span className="inline-block bg-crimson/10 border border-crimson/30 text-crimson px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest">
                    First Week Free
                  </span>
                </div>

                <div className="mt-8 flex items-baseline gap-3">
                  <span className="font-display text-8xl sm:text-9xl leading-none text-ink">$60</span>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-ink/80 font-semibold">
                      per student / per month
                    </p>
                    <p className="text-xs text-ink/55 mt-0.5">
                      Month-to-month · Cancel anytime
                    </p>
                  </div>
                </div>

                <ul className="mt-8 space-y-3.5 text-ink/85">
                  <li className="flex items-start gap-3 border-b border-line pb-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-crimson shrink-0" />
                    <span>
                      <strong>Unlimited weekly training</strong> — attend as many sessions as fit your schedule
                    </span>
                  </li>
                  <li className="flex items-start gap-3 border-b border-line pb-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-crimson shrink-0" />
                    <span>
                      <strong>Gi, No-Gi &amp; Open Mat included</strong> — Kids (5–6), Juniors (7–12), and Adults (13+)
                    </span>
                  </li>
                  <li className="flex items-start gap-3 border-b border-line pb-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-crimson shrink-0" />
                    <span>
                      <strong>Digital Student Portal</strong> — track attendance, belt stripes, and competition history
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-crimson shrink-0" />
                    <span>
                      <strong>Zero initiation or testing fees</strong> — belt &amp; stripe promotions are earned, never sold
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-line bg-mat/60 p-8 sm:px-10">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/join" className="btn flex-1 text-center">
                  Start Student Onboarding
                </Link>
                <Link href="/contact" className="btn-ghost flex-1 text-center">
                  Claim Free Trial Week
                </Link>
              </div>
              <p className="mt-3 text-center font-mono text-[11px] text-ink/55">
                Onboard online in 2 minutes · Pay at the front desk after your free trial week
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: REAL PHOTO + FAQ / VALUE */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="border-2 border-ink bg-white p-2 shadow-editorial">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/photos/class-circle.jpg"
                alt="Imagine Jiu Jitsu team gathered on the mat"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-crimson font-semibold">
                  Community First
                </p>
                <p className="mt-1 text-xs text-ink/70">
                  We keep tuition accessible so entire families in Woodland can train together on the mat.
                </p>
              </div>
            </div>

            <div className="border border-line bg-white p-6 space-y-4 flex-1 flex flex-col justify-center">
              <p className="eyebrow text-crimson">First-Timer Questions</p>
              <div>
                <h3 className="font-display text-2xl uppercase">What do I wear to my first class?</h3>
                <p className="mt-1 text-sm text-ink/70">
                  Comfortable athletic clothes (a rashguard or t-shirt and shorts/sweatpants without zippers
                  or pockets) are all you need for your free trial week.
                </p>
              </div>
              <div className="border-t border-line pt-4">
                <h3 className="font-display text-2xl uppercase">Can parents watch Kids &amp; Juniors classes?</h3>
                <p className="mt-1 text-sm text-ink/70">
                  Absolutely. We have mat-side seating for parents and families, and many parents end up
                  jumping into the Adult class right after.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

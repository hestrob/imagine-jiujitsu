import Link from "next/link";

export const metadata = { title: "Pricing — Imagine Jiu Jitsu" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <p className="eyebrow text-flow">Membership</p>
      <h1 className="display-tight mt-3 text-6xl">One price. Every class.</h1>
      <div className="mx-auto mt-12 max-w-md border border-ink bg-white">
        <div className="belt-line" aria-hidden />
        <div className="p-10">
          <p className="font-display text-8xl">$60</p>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/60">per student / per month</p>
          <ul className="mt-8 space-y-3 text-left text-ink/80">
            <li className="border-b border-line pb-3">Unlimited sessions and trainings</li>
            <li className="border-b border-line pb-3">Gi, no-gi, open mat — all included</li>
            <li className="border-b border-line pb-3">Belt &amp; competition tracking in your student portal</li>
            <li>No contracts, no tiers, no fine print</li>
          </ul>
          <Link href="/join" className="btn mt-8 w-full text-center">Join Imagine</Link>
          <p className="mt-4 text-xs text-ink/50">
            Online payments launch soon — for now, sign up and pay at the front desk.
          </p>
        </div>
      </div>
    </div>
  );
}

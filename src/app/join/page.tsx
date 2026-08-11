import Link from "next/link";
import { AuthForm } from "../login/AuthForm";

export const metadata = { title: "Join — Imagine Jiu Jitsu" };

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="eyebrow text-flow">Join Imagine</p>
      <h1 className="display-tight mt-3 text-5xl">Day one starts here</h1>
      <p className="mt-3 text-ink/70 text-sm">
        Create your student account to track your belt, attendance, and
        competitions. Membership is $60/month — payment at the front desk for
        now, online billing soon.
      </p>
      <div className="mt-8">
        <AuthForm mode="signup" />
      </div>
      <p className="mt-6 text-sm text-ink/60">
        Already a member? <Link className="underline hover:text-flow" href="/login">Sign in</Link>
      </p>
    </div>
  );
}

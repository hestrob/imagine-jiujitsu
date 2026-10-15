import Link from "next/link";
import { OnboardingForm } from "./OnboardingForm";

export const metadata = {
  title: "Student & Family Onboarding — Imagine Jiu Jitsu",
};

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-seal-circle.png"
            alt="Imagine Jiu Jitsu Seal"
            className="h-14 w-14 rounded-full ring-1 ring-ink/15 hidden sm:block mt-1"
          />
          <div>
            <p className="eyebrow text-crimson">Student &amp; Family Onboarding</p>
            <h1 className="display-tight mt-1.5 text-4xl sm:text-5xl">
              New Families &amp; Existing Students
            </h1>
            <p className="mt-2.5 max-w-xl text-sm text-ink/70">
              Use this form to onboard new students or update existing student
              profiles. We collect Dates of Birth (DOB) to track age-based belt
              promotions and parent/contact details to make billing setup and
              schedule notifications effortless.
            </p>
          </div>
        </div>
        <p className="font-mono text-xs text-ink/60">
          Already onboarded?{" "}
          <Link className="underline hover:text-crimson font-semibold text-ink" href="/login">
            Sign in →
          </Link>
        </p>
      </div>

      <div className="mt-8">
        <OnboardingForm />
      </div>
    </div>
  );
}

import Link from "next/link";
import { AuthForm } from "./AuthForm";

export const metadata = { title: "Sign in — Imagine Jiu Jitsu" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-20">
      <div className="border-2 border-ink bg-white shadow-editorial">
        <div className="black-belt-bar" aria-hidden />
        <div className="p-8">
          <div className="flex items-center gap-3.5 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-seal-circle.png"
              alt="Imagine Jiu Jitsu Seal"
              className="h-12 w-12 rounded-full ring-1 ring-ink/15"
            />
            <div>
              <p className="eyebrow text-crimson">Member &amp; Coach Portal</p>
              <h1 className="display-tight text-4xl">Back on the mat</h1>
            </div>
          </div>

          <AuthForm mode="signin" />

          <p className="mt-6 border-t border-line pt-4 text-xs text-ink/60 font-mono">
            New student or family?{" "}
            <Link className="underline hover:text-crimson font-semibold text-ink" href="/join">
              Complete Student Onboarding →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

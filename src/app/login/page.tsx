import Link from "next/link";
import { AuthForm } from "./AuthForm";

export const metadata = { title: "Sign in — Imagine Jiu Jitsu" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="eyebrow text-flow">Members</p>
      <h1 className="display-tight mt-3 text-5xl">Back on the mat</h1>
      <div className="mt-8">
        <AuthForm mode="signin" />
      </div>
      <p className="mt-6 text-sm text-ink/60">
        New here? <Link className="underline hover:text-flow" href="/join">Create an account</Link>
      </p>
    </div>
  );
}

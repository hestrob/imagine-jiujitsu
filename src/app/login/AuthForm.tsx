"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp } from "@/app/actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className="btn w-full" disabled={pending}>{pending ? "One sec…" : label}</button>;
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [state, action] = useFormState(mode === "signin" ? signIn : signUp, undefined);
  return (
    <form action={action} className="space-y-4">
      {mode === "signup" && (
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input className="field" id="name" name="name" required />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="field" id="email" name="email" type="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input className="field" id="password" name="password" type="password" required minLength={6} />
      </div>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <Submit label={mode === "signin" ? "Sign in" : "Create my account"} />
    </form>
  );
}

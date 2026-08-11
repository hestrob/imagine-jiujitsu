"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitInquiry } from "@/app/actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn" disabled={pending}>{pending ? "Sending…" : "Request my free class"}</button>;
}

export function InquiryForm() {
  const [state, action] = useFormState(submitInquiry, undefined);
  if (state?.ok) {
    return (
      <div className="border border-flow bg-white p-6">
        <p className="font-display uppercase text-2xl">You&apos;re on the list.</p>
        <p className="mt-2 text-ink/70">We&apos;ll reach out to set up your first class. See you on the mat.</p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">Name</label>
        <input className="field" id="name" name="name" required />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="field" id="email" name="email" type="email" required />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone (optional)</label>
        <input className="field" id="phone" name="phone" />
      </div>
      <div>
        <label className="label" htmlFor="message">Anything we should know?</label>
        <textarea className="field" id="message" name="message" rows={4} placeholder="Experience level, goals, questions…" />
      </div>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <Submit />
    </form>
  );
}

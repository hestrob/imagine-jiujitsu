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
      <div className="border border-flow bg-white p-6 space-y-4">
        <p className="font-display uppercase text-2xl">You&apos;re on the list!</p>
        <p className="text-ink/70">
          Your request for a free class has been submitted. We will be in touch shortly!
        </p>
        {state.mailtoUrl && (
          <div className="pt-2">
            <a
              href={state.mailtoUrl}
              className="btn inline-block !py-2.5 !px-5 text-sm"
            >
              Click here to send email to imagineawebsite@gmail.com
            </a>
          </div>
        )}
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

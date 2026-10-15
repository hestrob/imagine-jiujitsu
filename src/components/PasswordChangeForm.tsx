"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changePassword } from "@/app/actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn !py-2.5 !px-5 !text-xs">
      {pending ? "Updating Password…" : "Update Password"}
    </button>
  );
}

export function PasswordChangeForm() {
  const [state, action] = useFormState(changePassword, undefined);

  return (
    <form action={action} className="space-y-3">
      {state?.ok && (
        <p className="border border-emerald-500 bg-emerald-50 px-3 py-2 font-mono text-xs text-emerald-900 font-semibold">
          ✓ Password updated! All other active sessions have been signed out.
        </p>
      )}
      {state?.error && (
        <p className="border border-rose-500 bg-rose-50 px-3 py-2 font-mono text-xs text-rose-900 font-semibold">
          {state.error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="currentPassword">
            Current Password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className="field !py-2 !text-xs"
          />
        </div>
        <div>
          <label className="label" htmlFor="newPassword">
            New Password (8+ chars)
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            minLength={8}
            autoComplete="new-password"
            required
            className="field !py-2 !text-xs"
          />
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={8}
            autoComplete="new-password"
            required
            className="field !py-2 !text-xs"
          />
        </div>
      </div>
      <SubmitBtn />
    </form>
  );
}

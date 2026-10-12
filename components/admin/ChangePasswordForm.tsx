"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { changeOwnerPassword, type ActionState } from "@/lib/admin/actions";

const inputCls =
  "w-full rounded-xl border border-espresso/20 bg-white px-4 py-2.5 text-espresso placeholder:text-espresso/30";
const labelCls = "block text-sm font-medium text-espresso mb-1";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-espresso text-ivory font-medium px-6 py-2.5 hover:bg-espresso/90 disabled:opacity-50"
    >
      {pending ? "Changing…" : "Change password"}
    </button>
  );
}

export default function ChangePasswordForm() {
  const [state, formAction] = useFormState<ActionState, FormData>(
    changeOwnerPassword,
    { ok: true }
  );
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (state.ok && state.message) setSuccess(state.message);
    else if (!state.ok) setSuccess(null);
  }, [state]);

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-white border border-espresso/10 p-5 sm:p-6 space-y-4"
    >
      <h2 className="font-medium text-espresso">Change password</h2>
      <div>
        <label htmlFor="new_password" className={labelCls}>
          New password
        </label>
        <input
          id="new_password"
          name="new_password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputCls}
          placeholder="At least 8 characters"
        />
        {state.errors?.new_password && (
          <p className="text-xs text-red-700 mt-1">{state.errors.new_password}</p>
        )}
      </div>
      <div>
        <label htmlFor="confirm_password" className={labelCls}>
          Confirm new password
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          className={inputCls}
        />
        {state.errors?.confirm_password && (
          <p className="text-xs text-red-700 mt-1">{state.errors.confirm_password}</p>
        )}
      </div>
      {success && (
        <p role="status" className="text-sm text-sage bg-sage/10 rounded-xl px-3 py-2">
          {success}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}

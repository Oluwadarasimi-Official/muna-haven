"use client";

import { useState } from "react";
import Link from "next/link";

/** Amber first-login nudge: dismissible, never shows any password. */
export default function PasswordNudge() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div
      role="status"
      className="mx-4 sm:mx-6 lg:mx-8 mt-4 rounded-2xl bg-amber-50 border border-amber-300 px-4 py-3 flex items-start gap-3"
    >
      <p className="text-sm text-amber-900 flex-1">
        You&apos;re signed in with the initial password. Please change it in{" "}
        <Link href="/admin/account" className="font-semibold underline">
          Account settings
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="text-amber-700 hover:text-amber-900 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

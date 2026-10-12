"use client";

import { useState } from "react";

/**
 * Wraps a server action in a confirmation modal (never bare confirm()).
 * Usage:
 *   <ConfirmButton
 *     action={deleteProduct.bind(null, product.id)}
 *     title="Delete product?"
 *     body="This will permanently delete “X”. This cannot be undone."
 *     confirmLabel="Delete"
 *     danger
 *   >
 *     <button ...>Delete</button>
 *   </ConfirmButton>
 */
export default function ConfirmButton({
  action,
  title,
  body,
  confirmLabel = "Confirm",
  danger = false,
  children,
}: {
  action: () => Promise<void>;
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-flex">
        {children}
      </span>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 p-4"
          onClick={() => !busy && setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl text-espresso">{title}</h2>
            <p className="mt-2 text-sm text-espresso/70">{body}</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-espresso/20 px-4 py-2 text-sm text-espresso hover:bg-ivory disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await action();
                  } finally {
                    setBusy(false);
                  }
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                  danger
                    ? "bg-red-700 hover:bg-red-800"
                    : "bg-espresso hover:bg-espresso/90"
                }`}
              >
                {busy ? "Working…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { toggleProductField } from "@/lib/admin/actions";

/** Inline toggle (published / featured / archived) — calls server action. */
export default function ProductToggle({
  id,
  field,
  value,
  label,
}: {
  id: string;
  field: "published" | "featured" | "archived";
  value: boolean;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  const [on, setOn] = useState(value);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const next = !on;
          setOn(next);
          await toggleProductField(id, field, next);
        })
      }
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 ${
        on ? "bg-sage" : "bg-espresso/20"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}

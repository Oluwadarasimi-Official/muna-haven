"use client";

import type { Category } from "@/lib/types";

/** Category pills. `value` is the active slug, or "" for "All". */
export default function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string;
  onChange: (slug: string) => void;
}) {
  const pill = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
      active
        ? "border-espresso bg-espresso text-ivory"
        : "border-espresso/20 bg-white/60 text-espresso/80 hover:border-gold hover:text-espresso"
    }`;

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      <button type="button" className={pill(value === "")} onClick={() => onChange("")}>
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          className={pill(value === c.slug)}
          onClick={() => onChange(c.slug)}
          aria-pressed={value === c.slug}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

"use client";

export default function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-espresso/40"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search pieces or reference…"
        aria-label="Search products"
        className="w-full rounded-full border border-espresso/20 bg-white/70 py-3 pl-11 pr-4 text-[15px] text-espresso placeholder:text-espresso/40 focus:border-gold focus:outline-none"
      />
    </div>
  );
}

import Link from "next/link";

export default function EmptyState({
  title,
  message,
  actionHref,
  actionLabel,
}: {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-espresso/10 bg-white/60 px-8 py-14 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blush/25">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#382724" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </div>
      <h2 className="font-display text-2xl text-espresso">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-espresso/70">{message}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-6 rounded-full bg-espresso px-6 py-2.5 text-sm font-medium text-ivory transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

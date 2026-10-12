import ImageWithFallback from "./ImageWithFallback";
import type { Update } from "@/lib/types";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Single feed update card. Update images render at card width (capped by
 * max-w-2xl column) — sizes="(mobile) 100vw / (desktop) 640px".
 */
export default function UpdateCard({ update }: { update: Update }) {
  const when = formatDate(update.published_at ?? update.created_at);
  return (
    <article className="overflow-hidden rounded-2xl border border-espresso/10 bg-white/70 shadow-[0_2px_16px_rgba(56,39,36,0.06)]">
      {update.image_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f3e9e4]">
          <ImageWithFallback
            src={update.image_url}
            alt={update.title ?? "Mun's Haven update"}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
          />
        </div>
      )}
      <div className="p-5 sm:p-6">
        {update.title && (
          <h2 className="font-display text-xl text-espresso sm:text-2xl">
            {update.title}
          </h2>
        )}
        {when && (
          <p className="mt-1 text-xs tracking-widest text-espresso/50 uppercase">{when}</p>
        )}
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-espresso/85">
          {update.body}
        </p>
        {update.link_url && (
          <a
            href={update.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gold/60 px-4 py-2 text-sm font-medium text-espresso transition-colors hover:bg-gold/10"
          >
            View more
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17L17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}

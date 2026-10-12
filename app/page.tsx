import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { fetchCategories, fetchPublishedProducts } from "@/lib/products";
import { getPublicSettings, SETTING_DEFAULTS } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories, settings] = await Promise.all([
    fetchPublishedProducts(),
    fetchCategories(),
    getPublicSettings(),
  ]);
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const delivery = settings.delivery_notice || SETTING_DEFAULTS.delivery_notice;
  const referral = settings.referral_notice || SETTING_DEFAULTS.referral_notice;

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
          {/* Logo mark at 96px — well under the 640px native file: crisp. */}
          <Image
            src="/logo.jpg"
            alt="Muna's Haven logo"
            width={96}
            height={96}
            sizes="96px"
            priority
            className="h-24 w-24 rounded-full object-cover ring-2 ring-gold/60 shadow-[0_8px_30px_rgba(198,164,106,0.35)]"
          />
          <p className="mt-6 text-xs font-medium tracking-[0.35em] text-gold uppercase">
            Muna&rsquo;s Haven
          </p>
          <h1 className="text-balance mt-4 max-w-2xl font-display text-4xl leading-tight text-espresso sm:text-5xl md:text-6xl">
            Timeless pieces for the modern muse
          </h1>
          <div className="mt-6 flex items-center gap-3" aria-hidden="true">
            <span className="h-px w-16 bg-gold/70" />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="h-px w-16 bg-gold/70" />
          </div>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-espresso/70">
            Curated human hair and jewellery — pieces chosen to make every day
            feel a little more golden.
          </p>
          <Link
            href="/shop"
            className="mt-8 rounded-full bg-espresso px-9 py-3.5 text-base font-medium text-ivory transition-all hover:shadow-[0_8px_30px_rgba(56,39,36,0.35)] hover:opacity-95"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* ── Featured pieces ──────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl text-espresso sm:text-4xl">Featured pieces</h2>
            <div className="mx-auto mt-4 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-12 bg-gold/70" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
              <span className="h-px w-12 bg-gold/70" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/shop"
              className="inline-block rounded-full border border-espresso/30 px-8 py-3 text-sm font-medium text-espresso transition-colors hover:border-gold hover:bg-gold/10"
            >
              View all pieces
            </Link>
          </div>
        </section>
      )}

      {/* ── Categories ───────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="border-t border-espresso/10 bg-white/40">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h2 className="mb-8 text-center font-display text-3xl text-espresso sm:text-4xl">
              Shop by category
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${encodeURIComponent(c.slug)}`}
                  className="group rounded-2xl border border-espresso/10 bg-gradient-to-br from-blush/25 via-ivory to-gold/15 p-6 text-center transition-transform duration-300 hover:-translate-y-1 sm:p-8"
                >
                  <h3 className="font-display text-xl text-espresso sm:text-2xl">{c.name}</h3>
                  {c.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-espresso/60">{c.description}</p>
                  )}
                  <span className="mt-4 inline-block text-sm font-medium tracking-wide text-espresso/80 group-hover:text-espresso">
                    Browse <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Brand intro ──────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <h2 className="font-display text-3xl text-espresso">Welcome to the Haven</h2>
        <div className="mx-auto mt-4 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-12 bg-gold/70" />
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <span className="h-px w-12 bg-gold/70" />
        </div>
        <p className="mt-6 text-[16px] leading-relaxed text-espresso/75">
          Muna&rsquo;s Haven is a boutique for women who love beautiful things —
          quality human hair and jewellery pieces selected with care, so you can
          shop with confidence and wear with pride. Every order is personal:
          simply tap a piece, enquire on WhatsApp, and we&rsquo;ll take it from there.
        </p>
      </section>

      {/* ── Notices ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
          {[delivery, referral].map((notice) => (
            <div
              key={notice}
              className="rounded-2xl border border-gold/40 bg-gold/10 px-6 py-5 text-center text-[15px] text-espresso/85"
            >
              {notice}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

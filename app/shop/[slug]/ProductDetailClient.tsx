"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import PriceTag from "@/components/PriceTag";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildEnquiryLink } from "@/lib/whatsapp";
import type { ProductWithCategory, ProductVariants } from "@/lib/types";

interface VariantGroup {
  name: string;
  options: string[];
}

/** Normalise the two supported jsonb shapes into labelled option groups. */
function normaliseVariants(variants: ProductVariants): VariantGroup[] {
  if (!Array.isArray(variants) || variants.length === 0) return [];
  if (typeof variants[0] === "string") {
    return [{ name: "Variant", options: variants as string[] }];
  }
  return (variants as Array<{ name: string; options: string[] }>)
    .filter((g) => g && Array.isArray(g.options) && g.options.length > 0)
    .map((g) => ({ name: g.name || "Variant", options: g.options }));
}

function stockNote(product: ProductWithCategory): string | null {
  if (product.availability === "out_of_stock")
    return "Currently unavailable — enquire on WhatsApp and we\u2019ll let you know when it\u2019s back.";
  if (product.availability === "preorder")
    return "Made to order — enquire on WhatsApp for the timeline.";
  if (product.availability === "low_stock" && product.stock != null)
    return `Hurry — only ${product.stock} left.`;
  return null;
}

export default function ProductDetailClient({
  product,
  pageUrl,
}: {
  product: ProductWithCategory;
  pageUrl: string;
}) {
  const groups = useMemo(() => normaliseVariants(product.variants), [product.variants]);
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(groups.map((g) => [g.name, g.options[0]]))
  );

  const variantLabel =
    groups.length === 0
      ? undefined
      : groups.map((g) => selection[g.name]).filter(Boolean).join(", ");

  const enquiryHref = buildEnquiryLink({
    name: product.name,
    reference: product.reference,
    priceKobo: product.price_kobo,
    variant: variantLabel,
    pageUrl,
  });

  const note = stockNote(product);
  const images = product.images.length > 0 ? product.images : [null];

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      {/* Image — capped at max-w-xl and aspect-square on desktop so small
          seed thumbnails are never blown up to full-bleed hero size.
          sizes: (mobile) 100vw / (desktop) 576px. */}
      <div>
        <div className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden rounded-3xl border border-espresso/10 bg-[#f3e9e4]">
          <ImageWithFallback
            src={images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 576px"
            priority
          />
        </div>
        {images.length > 1 && (
          <div className="mx-auto mt-3 grid max-w-xl grid-cols-4 gap-3">
            {images.slice(1, 5).map((src, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-xl border border-espresso/10 bg-[#f3e9e4]"
              >
                <ImageWithFallback
                  src={src}
                  alt={`${product.name} — view ${i + 2}`}
                  fill
                  sizes="(max-width: 768px) 25vw, 140px"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col">
        {product.categorySlug ? (
          <Link
            href={`/shop?category=${encodeURIComponent(product.categorySlug)}`}
            className="text-xs font-medium tracking-[0.3em] text-gold uppercase hover:underline"
          >
            {product.categoryName}
          </Link>
        ) : (
          <p className="text-xs font-medium tracking-[0.3em] text-gold uppercase">
            {product.categoryName}
          </p>
        )}
        <h1 className="mt-3 font-display text-3xl leading-tight text-espresso sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-2 text-sm tracking-wider text-espresso/50 uppercase">
          Ref: {product.reference}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <PriceTag priceKobo={product.price_kobo} size="lg" />
          <AvailabilityBadge availability={product.availability} />
        </div>

        {note && <p className="mt-3 text-sm text-espresso/70">{note}</p>}

        {product.description && (
          <p className="mt-6 whitespace-pre-wrap text-[16px] leading-relaxed text-espresso/80">
            {product.description}
          </p>
        )}

        {groups.length > 0 && (
          <div className="mt-6 space-y-4">
            {groups.map((g) => (
              <label key={g.name} className="block">
                <span className="mb-1.5 block text-sm font-medium tracking-wide text-espresso/80">
                  {g.name}
                </span>
                <select
                  value={selection[g.name] ?? ""}
                  onChange={(e) =>
                    setSelection((s) => ({ ...s, [g.name]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-espresso/20 bg-white/70 px-4 py-3 text-[15px] text-espresso focus:border-gold focus:outline-none"
                >
                  {g.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}

        <div className="mt-8">
          <WhatsAppButton href={enquiryHref} className="w-full sm:w-auto" />
          <p className="mt-3 text-sm text-espresso/60">
            Tap to chat with us on WhatsApp — we&rsquo;ll confirm availability and arrange your order.
          </p>
        </div>
      </div>
    </div>
  );
}

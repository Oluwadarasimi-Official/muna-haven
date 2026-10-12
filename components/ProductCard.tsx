import Link from "next/link";
import ImageWithFallback from "./ImageWithFallback";
import PriceTag from "./PriceTag";
import AvailabilityBadge from "./AvailabilityBadge";
import type { ProductWithCategory } from "@/lib/types";

/**
 * Product card. Image container is aspect-square and capped by the grid
 * column width — sizes="(mobile) 50vw / (tablet) 33vw / (desktop) 25vw"
 * so small seed thumbnails are never blown up beyond the card.
 */
export default function ProductCard({ product }: { product: ProductWithCategory }) {
  const image = product.images?.[0] ?? null;
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-espresso/10 bg-white/70 shadow-[0_2px_16px_rgba(56,39,36,0.06)] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#f3e9e4]">
        <ImageWithFallback
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[15px] leading-snug text-espresso sm:text-base">
            {product.name}
          </h3>
        </div>
        <p className="text-[11px] tracking-wider text-espresso/50 uppercase">
          Ref: {product.reference}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <PriceTag priceKobo={product.price_kobo} size="sm" />
          <AvailabilityBadge availability={product.availability} />
        </div>
      </div>
    </Link>
  );
}

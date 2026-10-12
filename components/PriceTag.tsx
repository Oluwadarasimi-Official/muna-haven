import { formatNaira } from "@/lib/format";

/**
 * MANDATORY price display: EVERY price on the storefront renders through
 * this component — dusty blush (#D9A0A7) background, espresso (#382724) text,
 * pill/badge style. No exceptions.
 */
export default function PriceTag({
  priceKobo,
  size = "md",
  className = "",
}: {
  priceKobo: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses =
    size === "sm"
      ? "text-xs px-2.5 py-0.5"
      : size === "lg"
        ? "text-xl sm:text-2xl px-5 py-2"
        : "text-sm px-3.5 py-1";
  return (
    <span
      className={`inline-flex items-center rounded-full bg-blush text-espresso font-semibold tracking-wide ${sizeClasses} ${className}`}
    >
      {formatNaira(priceKobo)}
    </span>
  );
}

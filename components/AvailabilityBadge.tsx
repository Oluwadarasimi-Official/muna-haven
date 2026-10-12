import type { Availability } from "@/lib/types";

const LABELS: Record<Availability, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  preorder: "Pre-order",
};

const STYLES: Record<Availability, string> = {
  in_stock: "bg-sage/15 text-sage border-sage/40",
  low_stock: "bg-gold/15 text-[#8a6d2f] border-gold/50",
  out_of_stock: "bg-espresso/10 text-espresso/70 border-espresso/25",
  preorder: "bg-blush/25 text-espresso border-blush/60",
};

export default function AvailabilityBadge({
  availability,
}: {
  availability: Availability;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${STYLES[availability]}`}
    >
      {LABELS[availability]}
    </span>
  );
}

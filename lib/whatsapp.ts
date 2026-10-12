import { formatNaira } from "./format";

/** WhatsApp business number for enquiries (international format, no "+"). */
export const ENQUIRY_WA_NUMBER = "2347018733485";

export interface EnquiryInput {
  name: string;
  reference: string;
  priceKobo: number;
  /** Selected variant label, e.g. "14 inches". Omit the line when undefined. */
  variant?: string;
  /** Canonical product page URL, e.g. https://muna-haven.vercel.app/shop/slug */
  pageUrl: string;
}

/**
 * Build a pre-filled WhatsApp enquiry link for a product.
 * Newlines are encoded as %0A, ₦ as %E2%82%A6, spaces as %20 by encodeURIComponent.
 */
export function buildEnquiryLink(input: EnquiryInput): string {
  const lines = [
    "Hello Muna's Haven! 👋",
    "I'd like to enquire about this item:",
    `• ${input.name}`,
    `• Ref: ${input.reference}`,
    `• Price: ${formatNaira(input.priceKobo)}`,
  ];
  if (input.variant) {
    lines.push(`• Variant: ${input.variant}`);
  }
  lines.push(`• Link: ${input.pageUrl}`, "Thank you!");
  return `https://wa.me/${ENQUIRY_WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

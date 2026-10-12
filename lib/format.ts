/**
 * Format a kobo amount as Naira, e.g. 2800000 -> "₦28,000".
 * No decimals — boutique prices are whole Naira.
 */
export function formatNaira(kobo: number): string {
  const naira = Math.round(kobo / 100);
  return "₦" + naira.toLocaleString("en-NG");
}

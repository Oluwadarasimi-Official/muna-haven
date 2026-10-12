/**
 * Naira text input → integer kobo (kobo-safe price handling).
 * Used by the admin product/order forms and the server actions.
 */
export function nairaToKobo(raw: string): { kobo?: number; error?: string } {
  const trimmed = raw.trim().replace(/,/g, "");
  if (trimmed === "") return { error: "Price is required." };
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed))
    return { error: "Enter a valid price in naira (e.g. 28500)." };
  const kobo = Math.round(parseFloat(trimmed) * 100);
  if (!Number.isFinite(kobo) || kobo < 0)
    return { error: "Price cannot be negative." };
  return { kobo };
}

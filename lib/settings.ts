import { createServerSupabaseClient } from "./supabaseServer";

/**
 * Server-only helper returning public settings as a plain key->value map.
 * Reads mh_settings where is_public = true. Never throws: on any DB error
 * it returns an empty map so callers can fall back to SETTING_DEFAULTS.
 */
export async function getPublicSettings(): Promise<Record<string, string>> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("mh_settings")
      .select("key, value")
      .eq("is_public", true);
    if (error || !data) return {};
    const map: Record<string, string> = {};
    for (const row of data) {
      if (row.key) map[row.key] = row.value ?? "";
    }
    return map;
  } catch {
    return {};
  }
}

/** Fallback contact/notice values (match the seeded settings contract). */
export const SETTING_DEFAULTS = {
  email: "yzigzag26@gmail.com",
  whatsapp_display: "+234 701 873 3485",
  whatsapp_number: "2347018733485",
  telegram_url: "https://t.me/TrustOSLLC",
  delivery_notice: "Delivery: Coming soon.",
  referral_notice: "Referral programme: Coming soon.",
  whatsapp_channel_url: "",
} as const;

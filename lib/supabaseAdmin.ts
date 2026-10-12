import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Owner-only Supabase client (service role). SERVER ONLY.
 *
 * - The `server-only` import makes any client-side import a build error.
 * - The key comes ONLY from process.env.SUPABASE_SERVICE_ROLE_KEY and is
 *   never committed, never logged, never sent to the browser.
 * - Intended for the future /admin area (owner-only writes). The public
 *   storefront never touches this module.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set — owner-only operations are unavailable."
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

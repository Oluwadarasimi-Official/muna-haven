import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Uses ONLY the public anon key.
 * Reads: published products/categories, due updates, public settings.
 * The anon key is safe to expose; RLS restricts writes to the owner.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

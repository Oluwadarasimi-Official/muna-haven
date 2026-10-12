import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for Server Components / Route Handlers.
 * Read-only usage via the anon key; cookie handling is for session
 * compatibility only (the future /admin area will add its own auth).
 *
 * NOTE for the admin agent: this file is the canonical server client.
 * Owner-only writes should go through lib/supabaseAdmin.ts instead.
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Storefront is read-only; ignore cookie writes.
        },
      },
    }
  );
}

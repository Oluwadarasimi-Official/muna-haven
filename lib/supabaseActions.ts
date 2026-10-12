import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Actions that need the SIGNED-IN OWNER's JWT.
 *
 * Unlike lib/supabaseServer.ts (reads via request cookies only), this client
 * also writes refreshed auth cookies back, so Server Actions run WITH the
 * owner's session. That means RLS `public.is_owner()` policies apply to the
 * owner's own JWT instead of bypassing RLS with the service role.
 *
 * Use lib/supabaseAdmin.ts (service role) ONLY for storage uploads and
 * admin API calls that have no user-scoped equivalent.
 */
export function createActionSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context — cookie writes are not allowed;
            // session reads still work.
          }
        },
      },
    }
  );
}

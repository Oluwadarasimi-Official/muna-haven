import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIX = "/admin";
const LOGIN_PATH = "/admin/login";

/**
 * Protect /admin/*: redirect to /admin/login when there is no session or
 * the signed-in user does not carry app_metadata.role === 'owner'.
 * Non-owner signed-in users are redirected too — admin UI never renders
 * for them. Defense in depth: app/admin/layout.tsx repeats the check
 * server-side.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Tag the request path so the root layout can give /admin its own chrome.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-invoke-path", pathname);

  if (!pathname.startsWith(PROTECTED_PREFIX) || pathname === LOGIN_PATH) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = !!user && user.app_metadata?.role === "owner";
  if (!isOwner) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

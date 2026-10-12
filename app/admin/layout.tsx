import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import AdminNav from "@/components/admin/AdminNav";
import PasswordNudge from "@/components/admin/PasswordNudge";
import FlashToast from "@/components/admin/FlashToast";
import { signOutOwner } from "@/lib/admin/actions";

export const metadata = {
  title: "Owner dashboard — Mun's Haven",
  robots: "noindex, nofollow",
};

/**
 * Defense in depth: the middleware already guards /admin/*, and this layout
 * re-checks the session and owner role server-side before rendering anything.
 * Non-owner signed-in users never see admin UI.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();

  // /admin/login renders its own chrome and must not be auth-guarded
  // (otherwise the guard would redirect it to itself in a loop).
  const pathname = headers().get("x-invoke-path") ?? "";
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "owner") {
    redirect("/admin/login");
  }

  const needsNudge = user.user_metadata?.password_changed !== true;

  return (
    <div className="min-h-screen bg-ivory lg:flex">
      <AdminNav onSignOut={signOutOwner} />
      <div className="flex-1 min-w-0">
        {needsNudge && <PasswordNudge />}
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">{children}</main>
      </div>
      <Suspense>
        <FlashToast />
      </Suspense>
    </div>
  );
}

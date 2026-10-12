import { createServerSupabaseClient } from "@/lib/supabaseServer";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defensive: the layout already redirects unauthenticated visitors, so this
  // only shows if the account truly doesn't exist / couldn't load.
  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl text-espresso">Account</h1>
        <div className="rounded-2xl bg-amber-50 border border-amber-300 p-5 text-sm text-amber-900">
          Account pending provisioning — the owner login isn&apos;t set up yet.
          Ask the developer to finish the one-time setup.
        </div>
      </div>
    );
  }

  const username =
    (user.user_metadata?.username as string | undefined) ?? "OfficialMuna";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Account</h1>
        <p className="text-sm text-espresso/60 mt-1">
          Manage the owner login for this dashboard.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-espresso/10 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-wider text-espresso/50 mb-1">
          Username
        </p>
        <p className="font-display text-xl text-espresso">{username}</p>
        <p className="text-xs text-espresso/50 mt-2">
          Use this username — not an email address — to sign in.
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}

import SettingsForm from "@/components/admin/SettingsForm";
import { getAdminSettings } from "@/lib/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Settings</h1>
        <p className="text-sm text-espresso/60 mt-1">
          Contact details and notices shown across the public site.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}

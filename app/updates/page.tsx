import UpdateCard from "@/components/UpdateCard";
import EmptyState from "@/components/EmptyState";
import WhatsAppButton from "@/components/WhatsAppButton";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getPublicSettings } from "@/lib/settings";
import type { Update } from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchDueUpdates(): Promise<Update[]> {
  try {
    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("mh_updates")
      .select("*")
      .eq("published", true)
      .or(`scheduled_at.is.null,scheduled_at.lte.${now}`)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as Update[];
  } catch {
    return [];
  }
}

export default async function UpdatesPage() {
  const [updates, settings] = await Promise.all([fetchDueUpdates(), getPublicSettings()]);
  const channelUrl = (settings.whatsapp_channel_url ?? "").trim();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10 text-center">
        <p className="text-xs font-medium tracking-[0.35em] text-gold uppercase">Fresh from the Haven</p>
        <h1 className="mt-3 font-display text-4xl text-espresso sm:text-5xl">Updates</h1>
        <div className="mx-auto mt-4 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-12 bg-gold/70" />
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <span className="h-px w-12 bg-gold/70" />
        </div>
        {channelUrl && (
          <div className="mt-6">
            <WhatsAppButton href={channelUrl} label="Follow us on WhatsApp" />
          </div>
        )}
      </div>

      {updates.length === 0 ? (
        <EmptyState
          title="No updates yet"
          message="No updates yet — check back soon."
          actionHref="/shop"
          actionLabel="Browse the shop"
        />
      ) : (
        <div className="space-y-6">
          {updates.map((u) => (
            <UpdateCard key={u.id} update={u} />
          ))}
        </div>
      )}
    </div>
  );
}

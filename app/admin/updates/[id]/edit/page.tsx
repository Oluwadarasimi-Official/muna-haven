import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import UpdateForm from "@/components/admin/UpdateForm";

export const dynamic = "force-dynamic";

export default async function EditUpdatePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabaseClient();
  const { data: update } = await supabase
    .from("mh_updates")
    .select("id, title, body, image_url, link_url, published, scheduled_at")
    .eq("id", params.id)
    .single();

  if (!update) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Edit update</h1>
        <p className="text-sm text-espresso/60 mt-1">
          Changes appear on the public Updates page immediately.
        </p>
      </div>
      <UpdateForm update={update} />
    </div>
  );
}

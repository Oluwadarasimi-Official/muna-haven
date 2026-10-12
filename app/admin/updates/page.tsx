import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import EmptyState from "@/components/EmptyState";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteUpdate } from "@/lib/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminUpdatesPage() {
  const supabase = createServerSupabaseClient();
  const { data: updates } = await supabase
    .from("mh_updates")
    .select("id, title, body, published, scheduled_at, source, created_at")
    .order("created_at", { ascending: false });

  const list = updates ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-espresso">Updates</h1>
          <p className="text-sm text-espresso/60 mt-1">
            Announcements shown on the public Updates page.
          </p>
        </div>
        <Link
          href="/admin/updates/new"
          className="rounded-xl bg-espresso text-ivory text-sm font-medium px-4 py-2.5 hover:bg-espresso/90"
        >
          + New update
        </Link>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No updates yet"
          message="Write your first announcement for customers."
          actionHref="/admin/updates/new"
          actionLabel="Write an update"
        />
      ) : (
        <div className="rounded-2xl bg-white border border-espresso/10 divide-y divide-espresso/10 overflow-hidden">
          {list.map((u) => (
            <div key={u.id} className="p-4 sm:p-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-espresso truncate">
                    {u.title || "(untitled)"}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                      u.published
                        ? "bg-sage/15 text-sage border-sage/40"
                        : "bg-espresso/10 text-espresso/70 border-espresso/25"
                    }`}
                  >
                    {u.published ? "Published" : "Draft"}
                  </span>
                  {u.scheduled_at && (
                    <span className="text-[11px] text-espresso/50">
                      scheduled {new Date(u.scheduled_at).toLocaleString("en-NG")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-espresso/60 mt-1 line-clamp-2">{u.body}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/admin/updates/${u.id}/edit`}
                  className="rounded-lg border border-espresso/20 px-3 py-1.5 text-xs font-medium text-espresso hover:bg-ivory"
                >
                  Edit
                </Link>
                <ConfirmButton
                  action={deleteUpdate.bind(null, u.id)}
                  title="Delete update?"
                  body="This announcement will be permanently deleted."
                  confirmLabel="Delete"
                  danger
                >
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { formatNaira } from "@/lib/format";
import PriceTag from "@/components/PriceTag";
import EmptyState from "@/components/EmptyState";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  confirmed: "Confirmed",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  partly_paid: "Partly paid",
  paid: "Paid",
  refunded: "Refunded",
};

function StatCard({
  title,
  value,
  href,
}: {
  title: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl bg-white border border-espresso/10 p-5 shadow-sm hover:shadow-md transition block"
    >
      <p className="text-xs uppercase tracking-wider text-espresso/50">{title}</p>
      <p className="font-display text-3xl text-espresso mt-1">{value}</p>
    </Link>
  );
}

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient();

  const [
    { count: published },
    { count: draft },
    { count: archived },
    { count: categoryCount },
    ordersRes,
  ] = await Promise.all([
    supabase.from("mh_products").select("id", { count: "exact", head: true }).eq("published", true).eq("archived", false),
    supabase.from("mh_products").select("id", { count: "exact", head: true }).eq("published", false).eq("archived", false),
    supabase.from("mh_products").select("id", { count: "exact", head: true }).eq("archived", true),
    supabase.from("mh_categories").select("id", { count: "exact", head: true }),
    supabase.from("mh_orders").select("id, status, payment_status, subtotal_kobo"),
  ]);

  const orders = ordersRes.data ?? [];
  const byStatus: Record<string, number> = {};
  const byPayment: Record<string, number> = {};
  let revenueKobo = 0;
  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    byPayment[o.payment_status] = (byPayment[o.payment_status] ?? 0) + 1;
    if (o.payment_status === "paid") revenueKobo += o.subtotal_kobo ?? 0;
  }

  const { data: recentOrders } = await supabase
    .from("mh_orders")
    .select("id, order_number, customer_name, subtotal_kobo, status, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-espresso">Dashboard</h1>
        <p className="text-sm text-espresso/60 mt-1">
          Live numbers from your boutique — nothing here is a placeholder.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-espresso/50 mb-3">
          Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Published" value={String(published ?? 0)} href="/admin/products" />
          <StatCard title="Drafts" value={String(draft ?? 0)} href="/admin/products" />
          <StatCard title="Archived" value={String(archived ?? 0)} href="/admin/products" />
          <StatCard title="Categories" value={String(categoryCount ?? 0)} href="/admin/categories" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-espresso/50 mb-3">
          Orders
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Total orders" value={String(orders.length)} href="/admin/orders" />
          <StatCard
            title="Revenue (paid)"
            value={formatNaira(revenueKobo)}
            href="/admin/orders"
          />
          <StatCard title="New" value={String(byStatus["new"] ?? 0)} href="/admin/orders" />
          <StatCard title="Unpaid" value={String(byPayment["unpaid"] ?? 0)} href="/admin/orders" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="rounded-2xl bg-white border border-espresso/10 p-5">
            <h3 className="font-medium text-espresso mb-3">By status</h3>
            {orders.length === 0 ? (
              <p className="text-sm text-espresso/50">No orders yet.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <li key={key} className="flex justify-between">
                    <span className="text-espresso/70">{label}</span>
                    <span className="font-semibold text-espresso">{byStatus[key] ?? 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl bg-white border border-espresso/10 p-5">
            <h3 className="font-medium text-espresso mb-3">By payment</h3>
            {orders.length === 0 ? (
              <p className="text-sm text-espresso/50">No orders yet.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
                  <li key={key} className="flex justify-between">
                    <span className="text-espresso/70">{label}</span>
                    <span className="font-semibold text-espresso">{byPayment[key] ?? 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-espresso/50">
            Recent orders
          </h2>
          <Link href="/admin/orders" className="text-sm text-espresso underline">
            View all
          </Link>
        </div>
        {(recentOrders ?? []).length === 0 ? (
          <EmptyState
            title="No orders yet"
            message="Orders you create will appear here."
          />
        ) : (
          <div className="rounded-2xl bg-white border border-espresso/10 divide-y divide-espresso/10 overflow-hidden">
            {recentOrders!.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-ivory transition"
              >
                <div className="min-w-0">
                  <p className="font-medium text-espresso truncate">
                    {o.order_number} · {o.customer_name}
                  </p>
                  <p className="text-xs text-espresso/50">
                    {STATUS_LABELS[o.status] ?? o.status} ·{" "}
                    {PAYMENT_LABELS[o.payment_status] ?? o.payment_status}
                  </p>
                </div>
                <PriceTag priceKobo={o.subtotal_kobo} size="sm" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import PriceTag from "@/components/PriceTag";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-xl border border-espresso/20 bg-white px-3 py-2 text-sm text-espresso";

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

const STATUS_PILLS: Record<string, string> = {
  new: "bg-blush/25 text-espresso border-blush/60",
  confirmed: "bg-gold/15 text-[#8a6d2f] border-gold/50",
  preparing: "bg-gold/15 text-[#8a6d2f] border-gold/50",
  shipped: "bg-sage/15 text-sage border-sage/40",
  delivered: "bg-sage/25 text-[#3f5236] border-sage/60",
  cancelled: "bg-espresso/10 text-espresso/70 border-espresso/25",
};

const PAYMENT_PILLS: Record<string, string> = {
  unpaid: "bg-red-50 text-red-700 border-red-200",
  partly_paid: "bg-gold/15 text-[#8a6d2f] border-gold/50",
  paid: "bg-sage/15 text-sage border-sage/40",
  refunded: "bg-espresso/10 text-espresso/70 border-espresso/25",
};

function Pill({ text, cls }: { text: string; cls: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {text}
    </span>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; payment?: string; q?: string };
}) {
  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("mh_orders")
    .select("id, order_number, customer_name, customer_phone, subtotal_kobo, status, payment_status, created_at")
    .order("created_at", { ascending: false });

  const status = searchParams.status || "";
  const payment = searchParams.payment || "";
  const q = (searchParams.q || "").trim();

  if (status) query = query.eq("status", status);
  if (payment) query = query.eq("payment_status", payment);
  if (q) {
    query = query.or(
      `order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`
    );
  }

  const { data: orders } = await query.limit(200);
  const list = orders ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-espresso">Orders</h1>
          <p className="text-sm text-espresso/60 mt-1">
            {list.length} order{list.length === 1 ? "" : "s"}
            {status || payment || q ? " matching filters" : ""}.
          </p>
        </div>
        <Link
          href="/admin/orders/new"
          className="rounded-xl bg-espresso text-ivory text-sm font-medium px-4 py-2.5 hover:bg-espresso/90"
        >
          + New order
        </Link>
      </div>

      <form
        method="get"
        className="flex flex-wrap gap-2 items-center rounded-2xl bg-white border border-espresso/10 p-4"
      >
        <select name="status" defaultValue={status} className={inputCls} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="payment" defaultValue={payment} className={inputCls} aria-label="Filter by payment">
          <option value="">All payments</option>
          {Object.entries(PAYMENT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, phone, order no."
          className={inputCls + " flex-1 min-w-[160px]"}
          aria-label="Search orders"
        />
        <button
          type="submit"
          className="rounded-xl bg-espresso text-ivory text-sm font-medium px-4 py-2"
        >
          Filter
        </button>
        {(status || payment || q) && (
          <Link href="/admin/orders" className="text-sm text-espresso underline">
            Clear
          </Link>
        )}
      </form>

      {list.length === 0 ? (
        <EmptyState
          title="No orders found"
          message="Try clearing the filters, or record your first order."
          actionHref="/admin/orders/new"
          actionLabel="Record an order"
        />
      ) : (
        <div className="rounded-2xl bg-white border border-espresso/10 divide-y divide-espresso/10 overflow-hidden">
          {list.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="block px-4 sm:px-5 py-4 hover:bg-ivory/60 transition"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-espresso truncate">
                    {o.order_number} · {o.customer_name}
                  </p>
                  <p className="text-xs text-espresso/50">
                    {o.customer_phone ?? "No phone"}
                  </p>
                </div>
                <PriceTag priceKobo={o.subtotal_kobo} size="sm" />
              </div>
              <div className="flex gap-2 mt-2">
                <Pill text={STATUS_LABELS[o.status] ?? o.status} cls={STATUS_PILLS[o.status] ?? ""} />
                <Pill text={PAYMENT_LABELS[o.payment_status] ?? o.payment_status} cls={PAYMENT_PILLS[o.payment_status] ?? ""} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import PriceTag from "@/components/PriceTag";
import ConfirmButton from "@/components/admin/ConfirmButton";
import OrderForm from "@/components/admin/OrderForm";
import { deleteOrder } from "@/lib/admin/actions";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

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

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabaseClient();
  const [{ data: order }, { data: items }, { data: products }] = await Promise.all([
    supabase.from("mh_orders").select("*").eq("id", params.id).single(),
    supabase
      .from("mh_order_items")
      .select("*")
      .eq("order_id", params.id)
      .order("created_at"),
    supabase
      .from("mh_products")
      .select("*")
      .eq("published", true)
      .eq("archived", false)
      .order("name"),
  ]);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-espresso">
            {order.order_number}
          </h1>
          <p className="text-sm text-espresso/60 mt-1">
            {STATUS_LABELS[order.status] ?? order.status} ·{" "}
            {PAYMENT_LABELS[order.payment_status] ?? order.payment_status}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/orders"
            className="rounded-xl border border-espresso/20 px-4 py-2 text-sm font-medium text-espresso hover:bg-white"
          >
            ← Orders
          </Link>
          <ConfirmButton
            action={deleteOrder.bind(null, order.id)}
            title="Delete order?"
            body={`Order ${order.order_number} and its items will be permanently deleted.`}
            confirmLabel="Delete"
            danger
          >
            <button
              type="button"
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          </ConfirmButton>
        </div>
      </div>

      {/* Read-only summary */}
      <div className="rounded-2xl bg-white border border-espresso/10 p-5">
        <h2 className="font-medium text-espresso mb-3">Order summary</h2>
        <div className="space-y-2 text-sm">
          {(items ?? []).map((it) => (
            <div key={it.id} className="flex justify-between gap-3">
              <span className="text-espresso/80">
                {it.quantity} × {it.product_name}
                {it.variant ? ` (${it.variant})` : ""}
              </span>
              <span className="font-medium text-espresso shrink-0">
                {formatNaira(it.quantity * it.unit_price_kobo)}
              </span>
            </div>
          ))}
          <div className="border-t border-espresso/10 pt-2 flex justify-between">
            <span className="text-espresso/70">Total</span>
            <PriceTag priceKobo={order.subtotal_kobo} size="sm" />
          </div>
        </div>
      </div>

      <OrderForm order={order} items={items ?? []} products={products ?? []} />
    </div>
  );
}

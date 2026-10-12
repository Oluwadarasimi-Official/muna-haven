"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { saveOrder, type ActionState } from "@/lib/admin/actions";
import { nairaToKobo } from "@/lib/money";
import { formatNaira } from "@/lib/format";
import type { Product } from "@/lib/types";

const inputCls =
  "w-full rounded-xl border border-espresso/20 bg-white px-4 py-2.5 text-espresso placeholder:text-espresso/30";
const labelCls = "block text-sm font-medium text-espresso mb-1";

interface ItemRow {
  product_id: string;
  product_name: string;
  product_reference: string;
  variant: string;
  quantity: number;
  unit_price_naira: string;
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-espresso text-ivory font-medium px-6 py-2.5 hover:bg-espresso/90 disabled:opacity-50"
    >
      {pending ? "Saving…" : editing ? "Save changes" : "Create order"}
    </button>
  );
}

export default function OrderForm({
  order,
  items,
  products,
}: {
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string | null;
    customer_contact: string | null;
    status: string;
    payment_status: string;
    notes: string | null;
  } | null;
  items: {
    product_id: string | null;
    product_name: string;
    product_reference: string | null;
    variant: string | null;
    quantity: number;
    unit_price_kobo: number;
  }[];
  products: Product[];
}) {
  const bound = saveOrder.bind(null, order?.id ?? null);
  const [state, formAction] = useFormState<ActionState, FormData>(bound, {
    ok: true,
  });

  const [rows, setRows] = useState<ItemRow[]>(
    items.length > 0
      ? items.map((it) => ({
          product_id: it.product_id ?? "",
          product_name: it.product_name,
          product_reference: it.product_reference ?? "",
          variant: it.variant ?? "",
          quantity: it.quantity,
          unit_price_naira: (it.unit_price_kobo / 100).toString(),
        }))
      : [
          {
            product_id: "",
            product_name: "",
            product_reference: "",
            variant: "",
            quantity: 1,
            unit_price_naira: "",
          },
        ]
  );

  function pickProduct(index: number, productId: string) {
    const p = products.find((x) => x.id === productId);
    setRows((prev) =>
      prev.map((r, j) =>
        j === index
          ? {
              ...r,
              product_id: productId,
              product_name: p?.name ?? "",
              product_reference: p?.reference ?? "",
              unit_price_naira: p ? (p.price_kobo / 100).toString() : r.unit_price_naira,
            }
          : r
      )
    );
  }

  const subtotalKobo = useMemo(() => {
    return rows.reduce((sum, r) => {
      const conv = nairaToKobo(r.unit_price_naira || "0");
      const kobo = conv.kobo ?? 0;
      return sum + (Number.isInteger(r.quantity) && r.quantity > 0 ? r.quantity : 0) * kobo;
    }, 0);
  }, [rows]);

  const itemsJson = JSON.stringify(
    rows.map((r) => {
      const conv = nairaToKobo(r.unit_price_naira || "0");
      return {
        product_id: r.product_id || null,
        product_name: r.product_name || "Custom item",
        product_reference: r.product_reference || null,
        variant: r.variant || null,
        quantity: r.quantity,
        unit_price_kobo: conv.kobo ?? 0,
      };
    })
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="items" value={itemsJson} />

      {order && (
        <div className="rounded-2xl bg-white border border-espresso/10 p-5">
          <p className="text-xs uppercase tracking-wider text-espresso/50">
            Order number
          </p>
          <p className="font-display text-2xl text-espresso">{order.order_number}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="customer_name" className={labelCls}>
            Customer name *
          </label>
          <input
            id="customer_name"
            name="customer_name"
            defaultValue={state.values?.customer_name ?? order?.customer_name ?? ""}
            required
            className={inputCls}
            placeholder="e.g. Adaeze O."
          />
          {state.errors?.customer_name && (
            <p className="text-xs text-red-700 mt-1">{state.errors.customer_name}</p>
          )}
        </div>
        <div>
          <label htmlFor="customer_phone" className={labelCls}>
            Customer phone
          </label>
          <input
            id="customer_phone"
            name="customer_phone"
            defaultValue={state.values?.customer_phone ?? order?.customer_phone ?? ""}
            className={inputCls}
            placeholder="e.g. 0701 234 5678"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="customer_contact" className={labelCls}>
            Other contact
          </label>
          <input
            id="customer_contact"
            name="customer_contact"
            defaultValue={state.values?.customer_contact ?? order?.customer_contact ?? ""}
            className={inputCls}
            placeholder="WhatsApp number, address…"
          />
        </div>
        <div>
          <label htmlFor="status" className={labelCls}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={state.values?.status ?? order?.status ?? "new"}
            className={inputCls}
          >
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {state.errors?.status && (
            <p className="text-xs text-red-700 mt-1">{state.errors.status}</p>
          )}
        </div>
        <div>
          <label htmlFor="payment_status" className={labelCls}>
            Payment status
          </label>
          <select
            id="payment_status"
            name="payment_status"
            defaultValue={state.values?.payment_status ?? order?.payment_status ?? "unpaid"}
            className={inputCls}
          >
            <option value="unpaid">Unpaid</option>
            <option value="partly_paid">Partly paid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
          {state.errors?.payment_status && (
            <p className="text-xs text-red-700 mt-1">{state.errors.payment_status}</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl bg-white border border-espresso/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-espresso">Items</h2>
          <button
            type="button"
            onClick={() =>
              setRows((prev) => [
                ...prev,
                {
                  product_id: "",
                  product_name: "",
                  product_reference: "",
                  variant: "",
                  quantity: 1,
                  unit_price_naira: "",
                },
              ])
            }
            className="rounded-xl border border-espresso/20 px-3 py-1.5 text-xs font-medium text-espresso hover:bg-ivory"
          >
            + Add item
          </button>
        </div>
        {state.errors?.items && (
          <p className="text-xs text-red-700 mb-3">{state.errors.items}</p>
        )}
        <div className="space-y-4">
          {rows.map((r, i) => (
            <div key={i} className="rounded-xl border border-espresso/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-espresso/60">Item {i + 1}</p>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                    className="text-xs text-red-700 underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor={`prod-${i}`}>
                    Product
                  </label>
                  <select
                    id={`prod-${i}`}
                    value={r.product_id}
                    onChange={(e) => pickProduct(i, e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Custom / not in catalogue…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.reference})
                      </option>
                    ))}
                  </select>
                  {!r.product_id && (
                    <input
                      value={r.product_name}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, product_name: e.target.value } : x
                          )
                        )
                      }
                      placeholder="Item name (required for custom)"
                      aria-label="Custom item name"
                      className={inputCls + " mt-2"}
                    />
                  )}
                </div>
                <div>
                  <label className={labelCls} htmlFor={`variant-${i}`}>
                    Variant (optional)
                  </label>
                  <input
                    id={`variant-${i}`}
                    value={r.variant}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, variant: e.target.value } : x
                        )
                      )
                    }
                    placeholder="e.g. 18 inches, Gold"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor={`qty-${i}`}>
                    Quantity
                  </label>
                  <input
                    id={`qty-${i}`}
                    type="number"
                    min={1}
                    step={1}
                    value={r.quantity}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, j) =>
                          j === i
                            ? { ...x, quantity: parseInt(e.target.value, 10) || 0 }
                            : x
                        )
                      )
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor={`unit-${i}`}>
                    Unit price (₦)
                  </label>
                  <input
                    id={`unit-${i}`}
                    inputMode="decimal"
                    value={r.unit_price_naira}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, unit_price_naira: e.target.value } : x
                        )
                      )
                    }
                    placeholder="e.g. 28500"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <p className="text-sm text-espresso/70">
            Total: <span className="font-semibold text-espresso">{formatNaira(subtotalKobo)}</span>
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelCls}>
          Private notes — never shown on the public site
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={state.values?.notes ?? order?.notes ?? ""}
          className={inputCls}
          placeholder="Internal remarks…"
        />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton editing={!!order} />
        <Link
          href={order ? `/admin/orders/${order.id}` : "/admin/orders"}
          className="rounded-xl border border-espresso/20 px-6 py-2.5 text-sm font-medium text-espresso hover:bg-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

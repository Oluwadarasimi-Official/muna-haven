import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import PriceTag from "@/components/PriceTag";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import EmptyState from "@/components/EmptyState";
import ProductToggle from "@/components/admin/ProductToggle";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteProduct, toggleProductField } from "@/lib/admin/actions";

export const dynamic = "force-dynamic";

function categoryName(mh_categories: unknown): string {
  if (Array.isArray(mh_categories))
    return (mh_categories[0] as { name?: string } | undefined)?.name ?? "Uncategorised";
  return (mh_categories as { name?: string } | null | undefined)?.name ?? "Uncategorised";
}

export default async function AdminProductsPage() {
  const supabase = createServerSupabaseClient();
  const { data: products } = await supabase
    .from("mh_products")
    .select("id, reference, name, slug, price_kobo, images, availability, published, featured, archived, mh_categories(name)")
    .order("updated_at", { ascending: false });

  const list = products ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-espresso">Products</h1>
          <p className="text-sm text-espresso/60 mt-1">
            {list.length} product{list.length === 1 ? "" : "s"} in the catalogue.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-espresso text-ivory text-sm font-medium px-4 py-2.5 hover:bg-espresso/90"
        >
          + New product
        </Link>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No products yet"
          message="Add your first product to start building the catalogue."
          actionHref="/admin/products/new"
          actionLabel="Add a product"
        />
      ) : (
        <div className="rounded-2xl bg-white border border-espresso/10 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-espresso/50 border-b border-espresso/10">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3 text-center">Published</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-center">Archived</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/10">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-ivory/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            width={44}
                            height={44}
                            className="rounded-lg object-cover w-11 h-11"
                            unoptimized
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-ivory border border-espresso/10" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-espresso truncate max-w-[220px]">
                            {p.name}
                          </p>
                          <p className="text-xs text-espresso/50">
                            {p.reference} · {categoryName(p.mh_categories)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PriceTag priceKobo={p.price_kobo} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <AvailabilityBadge availability={p.availability} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ProductToggle id={p.id} field="published" value={p.published} label="Published" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ProductToggle id={p.id} field="featured" value={p.featured} label="Featured" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ProductToggle id={p.id} field="archived" value={p.archived} label="Archived" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="rounded-lg border border-espresso/20 px-3 py-1.5 text-xs font-medium text-espresso hover:bg-ivory"
                        >
                          Edit
                        </Link>
                        <ConfirmButton
                          action={async () => {
                            "use server";
                            await toggleProductField(p.id, "archived", !p.archived);
                            const { redirect } = await import("next/navigation");
                            redirect(
                              "/admin/products?flash=" +
                                encodeURIComponent(p.archived ? "Product unarchived." : "Product archived.")
                            );
                          }}
                          title={p.archived ? "Unarchive product?" : "Archive product?"}
                          body={
                            p.archived
                              ? `“${p.name}” will be visible in the dashboard again.`
                              : `“${p.name}” will be hidden from the public site and moved to archived.`
                          }
                          confirmLabel={p.archived ? "Unarchive" : "Archive"}
                        >
                          <button
                            type="button"
                            className="rounded-lg border border-espresso/20 px-3 py-1.5 text-xs font-medium text-espresso hover:bg-ivory"
                          >
                            {p.archived ? "Unarchive" : "Archive"}
                          </button>
                        </ConfirmButton>
                        <ConfirmButton
                          action={deleteProduct.bind(null, p.id)}
                          title="Delete product?"
                          body={`“${p.name}” will be permanently deleted. This cannot be undone.`}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-espresso/10">
            {list.map((p) => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {p.images?.[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      width={52}
                      height={52}
                      className="rounded-lg object-cover w-[52px] h-[52px]"
                      unoptimized
                    />
                  ) : (
                    <div className="w-[52px] h-[52px] rounded-lg bg-ivory border border-espresso/10" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-espresso truncate">{p.name}</p>
                    <p className="text-xs text-espresso/50">{p.reference}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <PriceTag priceKobo={p.price_kobo} size="sm" />
                      <AvailabilityBadge availability={p.availability} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-espresso/70">
                  <label className="flex items-center gap-2">
                    <ProductToggle id={p.id} field="published" value={p.published} label="Published" />
                    Published
                  </label>
                  <label className="flex items-center gap-2">
                    <ProductToggle id={p.id} field="featured" value={p.featured} label="Featured" />
                    Featured
                  </label>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="flex-1 text-center rounded-lg border border-espresso/20 px-3 py-2 text-xs font-medium text-espresso"
                  >
                    Edit
                  </Link>
                  <ConfirmButton
                    action={deleteProduct.bind(null, p.id)}
                    title="Delete product?"
                    body={`“${p.name}” will be permanently deleted. This cannot be undone.`}
                    confirmLabel="Delete"
                    danger
                  >
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700"
                    >
                      Delete
                    </button>
                  </ConfirmButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

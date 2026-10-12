import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabaseClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("mh_products").select("*").eq("id", params.id).single(),
    supabase
      .from("mh_categories")
      .select("id, name, slug, description, sort_order")
      .order("sort_order", { ascending: true })
      .order("name"),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Edit product</h1>
        <p className="text-sm text-espresso/60 mt-1">
          {product.reference} — changes go live on the site as soon as you save.
        </p>
      </div>
      <ProductForm product={product} categories={categories ?? []} />
    </div>
  );
}

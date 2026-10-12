import { createServerSupabaseClient } from "@/lib/supabaseServer";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = createServerSupabaseClient();
  const { data: categories } = await supabase
    .from("mh_categories")
    .select("id, name, slug, description, sort_order")
    .order("sort_order", { ascending: true })
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">New product</h1>
        <p className="text-sm text-espresso/60 mt-1">
          Publish it to make it appear on the public shop immediately.
        </p>
      </div>
      <ProductForm product={null} categories={categories ?? []} />
    </div>
  );
}

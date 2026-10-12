import { createServerSupabaseClient } from "@/lib/supabaseServer";
import CategoryManager from "@/components/admin/CategoryManager";
import { saveCategory, deleteCategory } from "@/lib/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = createServerSupabaseClient();
  const { data: categories } = await supabase
    .from("mh_categories")
    .select("id, name, slug, description, sort_order")
    .order("sort_order", { ascending: true })
    .order("name");

  const counts: Record<string, number> = {};
  for (const c of categories ?? []) {
    const { count } = await supabase
      .from("mh_products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", c.id);
    counts[c.id] = count ?? 0;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Categories</h1>
        <p className="text-sm text-espresso/60 mt-1">
          Organise the shop. A category with products can&apos;t be deleted.
        </p>
      </div>
      <CategoryManager
        categories={categories ?? []}
        counts={counts}
        saveCategory={saveCategory}
        deleteCategory={deleteCategory}
      />
    </div>
  );
}

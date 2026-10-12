import { createServerSupabaseClient } from "./supabaseServer";
import type { Category, ProductWithCategory } from "./types";

/**
 * Read-only storefront queries (anon key; RLS limits to published rows).
 * Used by server components. Safe at request time; data pages are
 * force-dynamic so nothing runs during `next build`.
 */

export async function fetchCategories(): Promise<Category[]> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("mh_categories")
      .select("id, name, slug, description, sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error || !data) return [];
    return data as Category[];
  } catch {
    return [];
  }
}

export async function fetchPublishedProducts(): Promise<ProductWithCategory[]> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("mh_products")
      .select("*, mh_categories(name, slug)")
      .eq("published", true)
      .eq("archived", false)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((row) => {
      const cat = row.mh_categories as { name?: string; slug?: string } | null;
      return {
        ...(row as object),
        images: Array.isArray(row.images) ? (row.images as string[]) : [],
        variants: (row.variants as ProductWithCategory["variants"]) ?? [],
        categoryName: cat?.name ?? "Uncategorised",
        categorySlug: cat?.slug ?? null,
      } as ProductWithCategory;
    });
  } catch {
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const products = await fetchPublishedProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

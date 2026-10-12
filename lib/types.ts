// Shared database-contract types for the storefront (read-only via anon key).
// The `supabase/` directory (migrations/seed) is owned by the database agent;
// this file mirrors that contract verbatim for TypeScript.

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

/** Product variants as stored in mh_products.variants (jsonb, default '[]').
 *  Supports two shapes:
 *  - array of strings, e.g. ["10 inches", "14 inches", "18 inches"]
 *  - array of { name, options[] }, e.g. [{ name: "Length", options: ["14 inches"] }]
 */
export type ProductVariants = string[] | Array<{ name: string; options: string[] }>;

export type Availability = "in_stock" | "low_stock" | "out_of_stock" | "preorder";

export interface Product {
  id: string;
  reference: string;
  name: string;
  slug: string;
  price_kobo: number;
  category_id: string | null;
  description: string | null;
  images: string[];
  variants: ProductVariants;
  stock: number | null;
  availability: Availability;
  published: boolean;
  archived: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  /** Joined category (embedded select `mh_categories(name, slug)`). */
  mh_categories?: { name: string; slug: string } | null;
}

export interface Update {
  id: string;
  title: string | null;
  body: string;
  image_url: string | null;
  link_url: string | null;
  published: boolean;
  published_at: string | null;
  scheduled_at: string | null;
  source: string;
  source_external_id: string | null;
  created_at: string;
}

/** Convenience view model used by pages/components. */
export interface ProductWithCategory extends Product {
  categoryName: string;
  categorySlug: string | null;
}

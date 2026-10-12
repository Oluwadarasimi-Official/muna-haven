"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchInput from "@/components/SearchInput";
import SortSelect, { type SortKey } from "@/components/SortSelect";
import EmptyState from "@/components/EmptyState";
import type { Category, ProductWithCategory } from "@/lib/types";

/**
 * Client island: search / category pills / sort, all local state.
 * Search matches name OR reference, case-insensitive.
 */
export default function ShopClient({
  products,
  categories,
}: {
  products: ProductWithCategory[];
  categories: Category[];
}) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      const matchesQuery =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q);
      const matchesCategory = category === "" || p.categorySlug === category;
      return matchesQuery && matchesCategory;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price_kobo - b.price_kobo;
        case "price-desc":
          return b.price_kobo - a.price_kobo;
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          return b.created_at.localeCompare(a.created_at);
        case "featured":
        default:
          return (
            Number(b.featured) - Number(a.featured) ||
            b.created_at.localeCompare(a.created_at)
          );
      }
    });

    return list;
  }, [products, query, category, sort]);

  const hasFilters = query.trim() !== "" || category !== "" || sort !== "featured";

  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setSort("featured");
  };

  return (
    <div>
      <div className="mb-5">
        <SearchInput value={query} onChange={setQuery} />
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <CategoryFilter categories={categories} value={category} onChange={setCategory} />
        <SortSelect value={sort} onChange={setSort} />
      </div>

      <p className="mb-4 text-sm text-espresso/60" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-3 font-medium text-espresso underline decoration-gold decoration-2 underline-offset-4 hover:text-gold"
          >
            Clear filters
          </button>
        )}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          title="No pieces found"
          message="No pieces match your search. Try a different name, reference, or category."
          actionHref="/shop"
          actionLabel="View all pieces"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

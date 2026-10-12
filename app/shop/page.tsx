import { Suspense } from "react";
import { fetchCategories, fetchPublishedProducts } from "@/lib/products";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    fetchPublishedProducts(),
    fetchCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium tracking-[0.35em] text-gold uppercase">The boutique</p>
        <h1 className="mt-3 font-display text-4xl text-espresso sm:text-5xl">Shop all pieces</h1>
        <div className="mx-auto mt-4 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-12 bg-gold/70" />
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <span className="h-px w-12 bg-gold/70" />
        </div>
      </div>

      <Suspense fallback={<p className="py-16 text-center text-espresso/60">Loading pieces…</p>}>
        <ShopClient products={products} categories={categories} />
      </Suspense>
    </div>
  );
}

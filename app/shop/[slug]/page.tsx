import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { fetchProductBySlug } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await fetchProductBySlug(params.slug);
  if (!product) notFound();

  // Canonical page URL for the WhatsApp enquiry message.
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : "");
  const pageUrl = `${base}/shop/${product.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-espresso/60">
        <Link href="/" className="hover:text-espresso">Home</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <Link href="/shop" className="hover:text-espresso">Shop</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-espresso" aria-current="page">{product.name}</span>
      </nav>

      <ProductDetailClient product={product} pageUrl={pageUrl} />
    </div>
  );
}

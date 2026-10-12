"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { saveProduct, uploadAdminImage, deleteAdminImage, type ActionState } from "@/lib/admin/actions";
import type { Availability, Category, Product, ProductVariants } from "@/lib/types";

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "preorder", label: "Pre-order" },
];

interface VariantRow {
  name: string;
  options: string;
}

function variantsToRows(variants: ProductVariants): VariantRow[] {
  return (variants as Array<string | { name: string; options: string[] }>).map(
    (v) =>
      typeof v === "string"
        ? { name: "Option", options: v }
        : { name: v.name ?? "Option", options: (v.options ?? []).join(", ") }
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-700 mt-1">{message}</p>;
}

const inputCls =
  "w-full rounded-xl border border-espresso/20 bg-white px-4 py-2.5 text-espresso placeholder:text-espresso/30";
const labelCls = "block text-sm font-medium text-espresso mb-1";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-espresso text-ivory font-medium px-6 py-2.5 hover:bg-espresso/90 disabled:opacity-50"
    >
      {pending ? "Saving…" : editing ? "Save changes" : "Create product"}
    </button>
  );
}

export default function ProductForm({
  product,
  categories,
}: {
  product: Product | null;
  categories: Category[];
}) {
  const bound = saveProduct.bind(null, product?.id ?? null);
  const [state, formAction] = useFormState<ActionState, FormData>(bound, {
    ok: true,
  });

  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [variantRows, setVariantRows] = useState<VariantRow[]>(
    product ? variantsToRows(product.variants ?? []) : []
  );

  const priceKoboToNaira = (k: number) => (k / 100).toString();

  function onNameChange(name: string) {
    if (!slugTouched) {
      setSlug(
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/[\s_]+/g, "-")
          .replace(/-+/g, "-")
      );
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadAdminImage(fd, "products");
    setUploading(false);
    if (res.ok) setImages((imgs) => [...imgs, res.url]);
    else setUploadError(res.error);
  }

  async function removeImage(url: string) {
    setImages((imgs) => imgs.filter((u) => u !== url));
    // Best-effort bucket cleanup; ignore the outcome.
    deleteAdminImage(url).catch(() => {});
  }

  function moveImage(index: number, dir: -1 | 1) {
    setImages((imgs) => {
      const next = [...imgs];
      const j = index + dir;
      if (j < 0 || j >= next.length) return imgs;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function addVariantRow() {
    setVariantRows((rows) => [...rows, { name: "", options: "" }]);
  }

  const variantsJson = JSON.stringify(
    variantRows
      .map((r) => ({
        name: r.name.trim() || "Option",
        options: r.options
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
      }))
      .filter((r) => r.options.length > 0)
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="variants" value={variantsJson} />

      {state.errors?.items && <FieldError message={state.errors.items} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelCls}>
            Product name *
          </label>
          <input
            id="name"
            name="name"
            defaultValue={state.values?.name ?? product?.name ?? ""}
            onChange={(e) => onNameChange(e.target.value)}
            required
            className={inputCls}
            placeholder="e.g. 14″ Bone Straight Wig"
          />
          <FieldError message={state.errors?.name} />
        </div>
        <div>
          <label htmlFor="slug" className={labelCls}>
            Slug *
          </label>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            required
            className={inputCls}
            placeholder="auto-generated from name"
          />
          <FieldError message={state.errors?.slug} />
        </div>
        <div>
          <label htmlFor="reference" className={labelCls}>
            Reference * <span className="font-normal text-espresso/50">(unique)</span>
          </label>
          <input
            id="reference"
            name="reference"
            defaultValue={state.values?.reference ?? product?.reference ?? ""}
            required
            className={inputCls}
            placeholder="e.g. MH-HAIR-014"
          />
          <FieldError message={state.errors?.reference} />
        </div>
        <div>
          <label htmlFor="price" className={labelCls}>
            Price (₦) *
          </label>
          <input
            id="price"
            name="price"
            inputMode="decimal"
            defaultValue={
              state.values?.price ??
              (product ? priceKoboToNaira(product.price_kobo) : "")
            }
            required
            className={inputCls}
            placeholder="e.g. 28500"
          />
          <FieldError message={state.errors?.price} />
        </div>
        <div>
          <label htmlFor="category_id" className={labelCls}>
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={state.values?.category_id ?? product?.category_id ?? ""}
            className={inputCls}
          >
            <option value="">Uncategorised</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="availability" className={labelCls}>
            Availability
          </label>
          <select
            id="availability"
            name="availability"
            defaultValue={state.values?.availability ?? product?.availability ?? "in_stock"}
            className={inputCls}
          >
            {AVAILABILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldError message={state.errors?.availability} />
        </div>
        <div>
          <label htmlFor="stock" className={labelCls}>
            Stock <span className="font-normal text-espresso/50">(leave blank = untracked)</span>
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            step={1}
            defaultValue={state.values?.stock ?? product?.stock ?? ""}
            className={inputCls}
            placeholder="e.g. 12"
          />
          <FieldError message={state.errors?.stock} />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelCls}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={state.values?.description ?? product?.description ?? ""}
          className={inputCls}
          placeholder="Fabric, length, care notes…"
        />
      </div>

      {/* Images */}
      <div className="rounded-2xl bg-white border border-espresso/10 p-5">
        <h2 className="font-medium text-espresso mb-1">Images</h2>
        <p className="text-xs text-espresso/50 mb-4">
          The first image is the primary one shown on the shop page.
        </p>
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
            {images.map((url, i) => (
              <div key={url + i} className="relative group">
                <Image
                  src={url}
                  alt={`Product image ${i + 1}`}
                  width={120}
                  height={120}
                  className="rounded-xl object-cover w-full aspect-square"
                  unoptimized
                />
                {i === 0 && (
                  <span className="absolute top-1 left-1 rounded-full bg-espresso text-ivory text-[10px] px-2 py-0.5">
                    Primary
                  </span>
                )}
                <div className="absolute inset-x-1 bottom-1 flex gap-1 justify-center">
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    aria-label="Move image left"
                    className="rounded-full bg-white/90 text-espresso text-xs px-2 py-0.5 disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === images.length - 1}
                    aria-label="Move image right"
                    className="rounded-full bg-white/90 text-espresso text-xs px-2 py-0.5 disabled:opacity-30"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    aria-label="Remove image"
                    className="rounded-full bg-white/90 text-red-700 text-xs px-2 py-0.5"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <label className="rounded-xl border border-espresso/20 px-4 py-2.5 text-sm font-medium text-espresso cursor-pointer hover:bg-ivory">
            {uploading ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onUpload}
              disabled={uploading}
            />
          </label>
          <button
            type="button"
            onClick={() => setImages((imgs) => [...imgs, ""])}
            className="rounded-xl border border-espresso/20 px-4 py-2.5 text-sm font-medium text-espresso hover:bg-ivory"
          >
            Add image URL
          </button>
          <span className="text-xs text-espresso/50">Max 5MB per image. Original quality kept.</span>
        </div>
        {uploadError && <FieldError message={uploadError} />}
        {images.map((url, i) => (
          <input
            key={`url-${i}`}
            type="url"
            value={url}
            onChange={(e) =>
              setImages((imgs) =>
                imgs.map((u, j) => (j === i ? e.target.value : u))
              )
            }
            placeholder="https://…"
            aria-label={`Image URL ${i + 1}`}
            className={`${inputCls} mt-2`}
          />
        ))}
      </div>

      {/* Variants */}
      <div className="rounded-2xl bg-white border border-espresso/10 p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-medium text-espresso">Variants</h2>
          <button
            type="button"
            onClick={addVariantRow}
            className="rounded-xl border border-espresso/20 px-3 py-1.5 text-xs font-medium text-espresso hover:bg-ivory"
          >
            + Add option set
          </button>
        </div>
        <p className="text-xs text-espresso/50 mb-4">
          e.g. set name “Length”, values “14 inches, 18 inches, 22 inches”.
        </p>
        {variantRows.length === 0 ? (
          <p className="text-sm text-espresso/50">No variants — the product sells as-is.</p>
        ) : (
          <div className="space-y-3">
            {variantRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  value={row.name}
                  onChange={(e) =>
                    setVariantRows((rows) =>
                      rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r))
                    )
                  }
                  placeholder="Option set name"
                  aria-label="Option set name"
                  className={inputCls}
                />
                <input
                  value={row.options}
                  onChange={(e) =>
                    setVariantRows((rows) =>
                      rows.map((r, j) => (j === i ? { ...r, options: e.target.value } : r))
                    )
                  }
                  placeholder="Comma-separated values"
                  aria-label="Option values"
                  className={inputCls + " flex-[2]"}
                />
                <button
                  type="button"
                  onClick={() => setVariantRows((rows) => rows.filter((_, j) => j !== i))}
                  aria-label="Remove option set"
                  className="rounded-xl border border-red-200 text-red-700 px-3 py-2.5 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flags */}
      <div className="rounded-2xl bg-white border border-espresso/10 p-5 flex flex-wrap gap-6">
        {(
          [
            { name: "published", label: "Published (visible on site)", value: product?.published ?? false },
            { name: "featured", label: "Featured (homepage spotlight)", value: product?.featured ?? false },
            { name: "archived", label: "Archived (hidden everywhere)", value: product?.archived ?? false },
          ] as const
        ).map((f) => (
          <label key={f.name} className="flex items-center gap-2 text-sm text-espresso">
            <input
              type="checkbox"
              name={f.name}
              defaultChecked={f.value}
              className="h-4 w-4 accent-[#382724]"
            />
            {f.label}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton editing={!!product} />
        <Link
          href="/admin/products"
          className="rounded-xl border border-espresso/20 px-6 py-2.5 text-sm font-medium text-espresso hover:bg-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createActionSupabaseClient } from "@/lib/supabaseActions";
import { createAdminClient } from "@/lib/supabaseAdmin";
import { nairaToKobo } from "@/lib/money";
import { SETTING_FIELDS } from "@/lib/admin/setting-fields";
import type { Availability, ProductVariants } from "@/lib/types";

export type FieldErrors = Record<string, string>;
export type ActionState = {
  ok: boolean;
  errors?: FieldErrors;
  values?: Record<string, string>;
  message?: string;
};

const PUBLIC_PATHS = ["/", "/shop", "/updates"];

/* ── helpers ─────────────────────────────────────────────── */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Owner-scoped client (carries the owner's JWT; RLS applies). */
export async function requireOwner() {
  const supabase = createActionSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "owner") {
    throw new Error("Not authorized.");
  }
  return { supabase, user };
}

function revalidateStorefront(slug?: string) {
  for (const p of PUBLIC_PATHS) revalidatePath(p, "page");
  if (slug) revalidatePath(`/shop/${slug}`, "page");
}

function flash(to: string, message: string): never {
  redirect(`${to}?flash=${encodeURIComponent(message)}`);
}

/* ── image upload (storage via service-role, server-only) ── */

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadAdminImage(
  formData: FormData,
  folder: "products" | "updates"
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await requireOwner();
  } catch {
    return { ok: false, error: "Not authorized." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image file first." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Only image files are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image must be 5MB or smaller." };
  }
  const ext = file.type.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "jpg";
  const path = `${folder}/${randomUUID()}.${ext}`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("muna-haven")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { ok: false, error: `Upload failed: ${error.message}` };

  const {
    data: { publicUrl },
  } = admin.storage.from("muna-haven").getPublicUrl(path);
  return { ok: true, url: publicUrl };
}

/** Remove an uploaded image from the bucket (best-effort, ignores errors). */
export async function deleteAdminImage(
  url: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireOwner();
  } catch {
    return { ok: false, error: "Not authorized." };
  }
  const marker = "/muna-haven/";
  const idx = url.indexOf(marker);
  if (idx === -1) return { ok: false, error: "Not a bucket image URL." };
  const path = url.slice(idx + marker.length);
  const admin = createAdminClient();
  const { error } = await admin.storage.from("muna-haven").remove([path]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/* ── products ────────────────────────────────────────────── */

const AVAILABILITIES: Availability[] = [
  "in_stock",
  "low_stock",
  "out_of_stock",
  "preorder",
];

function parseVariants(raw: string): ProductVariants {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export async function saveProduct(
  id: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireOwner();
  const errors: FieldErrors = {};
  const values: Record<string, string> = {};

  const str = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    values[k] = v;
    return v;
  };

  const name = str("name");
  const slug = str("slug") || slugify(name);
  const reference = str("reference");
  const priceRaw = str("price");
  const categoryId = str("category_id") || null;
  const description = str("description") || null;
  const availability = (str("availability") || "in_stock") as Availability;
  const stockRaw = str("stock");
  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";
  const archived = formData.get("archived") === "on";

  if (!name) errors.name = "Product name is required.";
  if (!reference) errors.reference = "Reference is required (e.g. MH-HAIR-014).";
  if (!slug) errors.slug = "Slug is required.";

  const { kobo, error: priceError } = nairaToKobo(priceRaw);
  if (priceError) errors.price = priceError;

  if (!AVAILABILITIES.includes(availability))
    errors.availability = "Choose a valid availability.";

  let stock: number | null = null;
  if (stockRaw !== "") {
    const n = Number(stockRaw);
    if (!Number.isInteger(n) || n < 0)
      errors.stock = "Stock must be a whole number, 0 or more.";
    else stock = n;
  }

  let images: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("images") ?? "[]"));
    if (Array.isArray(parsed))
      images = parsed.filter((u) => typeof u === "string" && u.trim() !== "");
  } catch {
    /* keep [] */
  }
  const variants = parseVariants(String(formData.get("variants") ?? "[]"));

  if (Object.keys(errors).length > 0) return { ok: false, errors, values };

  const row = {
    name,
    slug,
    reference,
    price_kobo: kobo!,
    category_id: categoryId,
    description,
    images,
    variants,
    stock,
    availability,
    published,
    featured,
    archived,
  };

  let result;
  if (id) {
    result = await supabase.from("mh_products").update(row).eq("id", id);
  } else {
    result = await supabase.from("mh_products").insert(row);
  }

  if (result.error) {
    const msg = result.error.message.toLowerCase();
    if (msg.includes("mh_products_reference_key") || msg.includes("duplicate") || msg.includes("unique"))
      errors.reference = "That reference is already used by another product.";
    else if (msg.includes("slug"))
      errors.slug = "That slug is already used by another product.";
    else errors.name = `Could not save: ${result.error.message}`;
    return { ok: false, errors, values };
  }

  revalidateStorefront(slug);
  flash("/admin/products", id ? "Product updated." : "Product created.");
}

export async function toggleProductField(
  id: string,
  field: "published" | "featured" | "archived",
  value: boolean
): Promise<void> {
  const { supabase } = await requireOwner();
  await supabase.from("mh_products").update({ [field]: value }).eq("id", id);
  const { data } = await supabase.from("mh_products").select("slug").eq("id", id).single();
  revalidateStorefront(data?.slug);
}

export async function deleteProduct(id: string): Promise<void> {
  const { supabase } = await requireOwner();
  const { data } = await supabase.from("mh_products").select("slug").eq("id", id).single();
  await supabase.from("mh_products").delete().eq("id", id);
  revalidateStorefront(data?.slug);
  redirect("/admin/products?flash=" + encodeURIComponent("Product deleted."));
}

/* ── categories ──────────────────────────────────────────── */

export async function saveCategory(
  id: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireOwner();
  const errors: FieldErrors = {};
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  const description = String(formData.get("description") ?? "").trim() || null;
  const sortOrderRaw = String(formData.get("sort_order") ?? "").trim();
  const values: Record<string, string> = { name, slug, description: description ?? "", sort_order: sortOrderRaw };

  if (!name) errors.name = "Category name is required.";
  if (!slug) errors.slug = "Slug is required.";
  let sort_order = 0;
  if (sortOrderRaw !== "") {
    const n = Number(sortOrderRaw);
    if (!Number.isInteger(n)) errors.sort_order = "Sort order must be a whole number.";
    else sort_order = n;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors, values };

  const row = { name, slug, description, sort_order };
  const result = id
    ? await supabase.from("mh_categories").update(row).eq("id", id)
    : await supabase.from("mh_categories").insert(row);

  if (result.error) {
    const msg = result.error.message.toLowerCase();
    if (msg.includes("duplicate") || msg.includes("unique")) {
      errors.slug = "That slug is already used by another category.";
    } else {
      errors.name = `Could not save: ${result.error.message}`;
    }
    return { ok: false, errors, values };
  }
  revalidateStorefront();
  flash("/admin/categories", id ? "Category updated." : "Category created.");
}

export async function deleteCategory(id: string): Promise<void> {
  const { supabase } = await requireOwner();
  const { count } = await supabase
    .from("mh_products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if ((count ?? 0) > 0) {
    redirect(
      "/admin/categories?flash=" +
        encodeURIComponent(`Cannot delete: ${count} product(s) still use this category.`)
    );
  }
  await supabase.from("mh_categories").delete().eq("id", id);
  revalidateStorefront();
  redirect("/admin/categories?flash=" + encodeURIComponent("Category deleted."));
}

/* ── orders ──────────────────────────────────────────────── */

const ORDER_STATUSES = ["new", "confirmed", "preparing", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_STATUSES = ["unpaid", "partly_paid", "paid", "refunded"] as const;

interface OrderItemInput {
  product_id: string | null;
  product_name: string;
  product_reference: string | null;
  variant: string | null;
  quantity: number;
  unit_price_kobo: number;
}

export async function saveOrder(
  id: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireOwner();
  const errors: FieldErrors = {};
  const customer_name = String(formData.get("customer_name") ?? "").trim();
  const customer_phone = String(formData.get("customer_phone") ?? "").trim() || null;
  const customer_contact = String(formData.get("customer_contact") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "new");
  const payment_status = String(formData.get("payment_status") ?? "unpaid");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const values: Record<string, string> = {
    customer_name,
    customer_phone: customer_phone ?? "",
    customer_contact: customer_contact ?? "",
    status,
    payment_status,
    notes: notes ?? "",
  };

  if (!customer_name) errors.customer_name = "Customer name is required.";
  if (!(ORDER_STATUSES as readonly string[]).includes(status))
    errors.status = "Invalid status.";
  if (!(PAYMENT_STATUSES as readonly string[]).includes(payment_status))
    errors.payment_status = "Invalid payment status.";

  let items: OrderItemInput[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("items") ?? "[]"));
    if (Array.isArray(parsed)) items = parsed;
  } catch {
    /* handled below */
  }
  const cleanItems: OrderItemInput[] = [];
  items.forEach((it, i) => {
    const quantity = Number(it?.quantity);
    const unit_price_kobo = Number(it?.unit_price_kobo);
    if (!it?.product_name || !Number.isInteger(quantity) || quantity <= 0)
      errors[`items`] = `Item ${i + 1}: pick a product and set quantity ≥ 1.`;
    if (!Number.isInteger(unit_price_kobo) || unit_price_kobo < 0)
      errors[`items`] = `Item ${i + 1}: unit price must be 0 or more (kobo).`;
    cleanItems.push({
      product_id: it?.product_id || null,
      product_name: String(it?.product_name ?? ""),
      product_reference: it?.product_reference ? String(it.product_reference) : null,
      variant: it?.variant ? String(it.variant) : null,
      quantity,
      unit_price_kobo,
    });
  });
  if (cleanItems.length === 0) errors.items = "Add at least one item.";

  if (Object.keys(errors).length > 0) return { ok: false, errors, values };

  const subtotal_kobo = cleanItems.reduce(
    (sum, it) => sum + it.quantity * it.unit_price_kobo,
    0
  );

  const row = {
    customer_name,
    customer_phone,
    customer_contact,
    status,
    payment_status,
    subtotal_kobo,
    notes,
    source: "manual",
  };

  let orderId = id;
  if (id) {
    const { error } = await supabase.from("mh_orders").update(row).eq("id", id);
    if (error) {
      errors.customer_name = `Could not save order: ${error.message}`;
      return { ok: false, errors, values };
    }
    // Replace items wholesale.
    await supabase.from("mh_order_items").delete().eq("order_id", id);
  } else {
    const { data, error } = await supabase
      .from("mh_orders")
      .insert(row)
      .select("id, order_number")
      .single();
    if (error || !data) {
      errors.customer_name = `Could not create order: ${error?.message ?? "unknown error"}`;
      return { ok: false, errors, values };
    }
    orderId = data.id;
  }

  const { error: itemError } = await supabase.from("mh_order_items").insert(
    cleanItems.map((it) => ({ order_id: orderId!, ...it }))
  );
  if (itemError) {
    errors.items = `Could not save items: ${itemError.message}`;
    return { ok: false, errors, values };
  }

  flash(`/admin/orders/${orderId}`, id ? "Order updated." : "Order created.");
}

export async function deleteOrder(id: string): Promise<void> {
  const { supabase } = await requireOwner();
  await supabase.from("mh_orders").delete().eq("id", id);
  redirect("/admin/orders?flash=" + encodeURIComponent("Order deleted."));
}

/* ── updates ─────────────────────────────────────────────── */

export async function saveUpdate(
  id: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireOwner();
  const errors: FieldErrors = {};
  const title = String(formData.get("title") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();
  const image_url = String(formData.get("image_url") ?? "").trim() || null;
  const link_url = String(formData.get("link_url") ?? "").trim() || null;
  const published = formData.get("published") === "on";
  const scheduledRaw = String(formData.get("scheduled_at") ?? "").trim();
  const values: Record<string, string> = {
    title: title ?? "",
    body,
    image_url: image_url ?? "",
    link_url: link_url ?? "",
    scheduled_at: scheduledRaw,
  };

  if (!body) errors.body = "Write something for the update body.";
  let scheduled_at: string | null = null;
  if (scheduledRaw) {
    const d = new Date(scheduledRaw);
    if (Number.isNaN(d.getTime())) errors.scheduled_at = "Invalid date/time.";
    else scheduled_at = d.toISOString();
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors, values };

  let published_at: string | null = null;
  if (id) {
    const { data } = await supabase
      .from("mh_updates")
      .select("published_at")
      .eq("id", id)
      .single();
    published_at = data?.published_at ?? null;
  }
  if (published && !published_at && !scheduled_at) {
    published_at = new Date().toISOString();
  }

  const row = {
    title,
    body,
    image_url,
    link_url,
    published,
    published_at,
    scheduled_at,
    source: "manual",
  };

  const result = id
    ? await supabase.from("mh_updates").update(row).eq("id", id)
    : await supabase.from("mh_updates").insert(row);

  if (result.error) {
    errors.body = `Could not save: ${result.error.message}`;
    return { ok: false, errors, values };
  }
  revalidateStorefront();
  flash("/admin/updates", id ? "Update saved." : "Update created.");
}

export async function deleteUpdate(id: string): Promise<void> {
  const { supabase } = await requireOwner();
  await supabase.from("mh_updates").delete().eq("id", id);
  revalidateStorefront();
  redirect("/admin/updates?flash=" + encodeURIComponent("Update deleted."));
}

export async function getAdminSettings(): Promise<Record<string, string>> {
  const { supabase } = await requireOwner();
  const { data } = await supabase.from("mh_settings").select("key, value");
  const out: Record<string, string> = {};
  for (const row of data ?? []) out[row.key] = row.value ?? "";
  return out;
}

export async function saveSettings(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireOwner();
  const errors: FieldErrors = {};
  const email = String(formData.get("contact_email") ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.contact_email = "Enter a valid email address.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  for (const field of SETTING_FIELDS) {
    const value = String(formData.get(field.key) ?? "");
    const { error } = await supabase
      .from("mh_settings")
      .upsert({ key: field.key, value, is_public: true });
    if (error) {
      return {
        ok: false,
        errors: { [field.key]: `Could not save: ${error.message}` },
      };
    }
  }
  revalidateStorefront();
  flash("/admin/settings", "Settings saved.");
}

/* ── account ─────────────────────────────────────────────── */

export async function changeOwnerPassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireOwner();
  const errors: FieldErrors = {};
  const next = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (next.length < 8) errors.new_password = "Password must be at least 8 characters.";
  if (next !== confirm) errors.confirm_password = "Passwords do not match.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) {
    return { ok: false, errors: { new_password: `Could not change password: ${error.message}` } };
  }
  await supabase.auth.updateUser({ data: { password_changed: true } });
  return { ok: true, message: "Password changed successfully." };
}

export async function signOutOwner(): Promise<void> {
  const supabase = createActionSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

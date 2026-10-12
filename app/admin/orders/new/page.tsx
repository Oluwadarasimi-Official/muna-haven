import { createServerSupabaseClient } from "@/lib/supabaseServer";
import OrderForm from "@/components/admin/OrderForm";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const supabase = createServerSupabaseClient();
  const { data: products } = await supabase
    .from("mh_products")
    .select("*")
    .eq("published", true)
    .eq("archived", false)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">New order</h1>
        <p className="text-sm text-espresso/60 mt-1">
          Record an order taken by phone or chat. An order number is generated
          automatically when you save.
        </p>
      </div>
      <OrderForm order={null} items={[]} products={products ?? []} />
    </div>
  );
}

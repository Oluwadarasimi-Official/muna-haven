-- Muna's Haven boutique — schema migration 01
-- Creates mh_ tables, helpers, triggers, RLS policies, storage bucket.
-- Project ref: vtappsupjgsuzhemypkq (task brief said vtbappsupjgsuzhemypkq; the live project list showed vtappsupjgsuzhemypkq — used the live one)

-- ============ helpers ============

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner', false)
$$;

CREATE OR REPLACE FUNCTION public.mh_touch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ tables ============

CREATE TABLE IF NOT EXISTS public.mh_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mh_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price_kobo integer NOT NULL CHECK (price_kobo >= 0),
  category_id uuid REFERENCES public.mh_categories(id) ON DELETE SET NULL,
  description text,
  images text[] NOT NULL DEFAULT '{}',
  variants jsonb NOT NULL DEFAULT '[]',
  stock integer,
  availability text NOT NULL DEFAULT 'in_stock'
    CHECK (availability IN ('in_stock','low_stock','out_of_stock','preorder')),
  published boolean NOT NULL DEFAULT false,
  archived boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mh_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_contact text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','confirmed','preparing','shipped','delivered','cancelled')),
  payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','partly_paid','paid','refunded')),
  subtotal_kobo integer NOT NULL DEFAULT 0 CHECK (subtotal_kobo >= 0),
  notes text,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mh_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.mh_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.mh_products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_reference text,
  variant text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_kobo integer NOT NULL CHECK (unit_price_kobo >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mh_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  body text NOT NULL,
  image_url text,
  link_url text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  scheduled_at timestamptz,
  source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual','whatsapp_channel')),
  source_external_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mh_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ order-number sequence + trigger ============

CREATE SEQUENCE IF NOT EXISTS public.mh_order_seq;

CREATE OR REPLACE FUNCTION public.mh_order_number_default()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'MH-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.mh_order_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mh_orders_order_number_default ON public.mh_orders;
CREATE TRIGGER mh_orders_order_number_default
  BEFORE INSERT ON public.mh_orders
  FOR EACH ROW EXECUTE FUNCTION public.mh_order_number_default();

-- ============ updated_at triggers ============

DROP TRIGGER IF EXISTS mh_categories_touch ON public.mh_categories;
CREATE TRIGGER mh_categories_touch
  BEFORE UPDATE ON public.mh_categories
  FOR EACH ROW EXECUTE FUNCTION public.mh_touch();

DROP TRIGGER IF EXISTS mh_products_touch ON public.mh_products;
CREATE TRIGGER mh_products_touch
  BEFORE UPDATE ON public.mh_products
  FOR EACH ROW EXECUTE FUNCTION public.mh_touch();

DROP TRIGGER IF EXISTS mh_orders_touch ON public.mh_orders;
CREATE TRIGGER mh_orders_touch
  BEFORE UPDATE ON public.mh_orders
  FOR EACH ROW EXECUTE FUNCTION public.mh_touch();

DROP TRIGGER IF EXISTS mh_updates_touch ON public.mh_updates;
CREATE TRIGGER mh_updates_touch
  BEFORE UPDATE ON public.mh_updates
  FOR EACH ROW EXECUTE FUNCTION public.mh_touch();

DROP TRIGGER IF EXISTS mh_settings_touch ON public.mh_settings;
CREATE TRIGGER mh_settings_touch
  BEFORE UPDATE ON public.mh_settings
  FOR EACH ROW EXECUTE FUNCTION public.mh_touch();

-- ============ RLS ============

ALTER TABLE public.mh_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mh_products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mh_orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mh_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mh_updates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mh_settings    ENABLE ROW LEVEL SECURITY;

-- drop old policies (idempotent re-runs)
DROP POLICY IF EXISTS mh_public_read ON public.mh_categories;
DROP POLICY IF EXISTS mh_owner_all   ON public.mh_categories;
DROP POLICY IF EXISTS mh_public_read ON public.mh_products;
DROP POLICY IF EXISTS mh_owner_all   ON public.mh_products;
DROP POLICY IF EXISTS mh_owner_all   ON public.mh_orders;
DROP POLICY IF EXISTS mh_owner_all   ON public.mh_order_items;
DROP POLICY IF EXISTS mh_public_read ON public.mh_updates;
DROP POLICY IF EXISTS mh_owner_all   ON public.mh_updates;
DROP POLICY IF EXISTS mh_public_read ON public.mh_settings;
DROP POLICY IF EXISTS mh_owner_all   ON public.mh_settings;

-- public reads
CREATE POLICY mh_public_read ON public.mh_categories
  FOR SELECT USING (true);
CREATE POLICY mh_public_read ON public.mh_products
  FOR SELECT USING (published AND NOT archived);
CREATE POLICY mh_public_read ON public.mh_updates
  FOR SELECT USING (published AND (scheduled_at IS NULL OR scheduled_at <= now()));
CREATE POLICY mh_public_read ON public.mh_settings
  FOR SELECT USING (is_public);

-- owner full access on every mh_ table (no public policy on orders/order_items)
CREATE POLICY mh_owner_all ON public.mh_categories
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY mh_owner_all ON public.mh_products
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY mh_owner_all ON public.mh_orders
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY mh_owner_all ON public.mh_order_items
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY mh_owner_all ON public.mh_updates
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY mh_owner_all ON public.mh_settings
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());

-- ============ storage bucket + policies ============

INSERT INTO storage.buckets (id, name, public)
VALUES ('muna-haven', 'muna-haven', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS mh_storage_public_read ON storage.objects;
DROP POLICY IF EXISTS mh_storage_owner_write ON storage.objects;

CREATE POLICY mh_storage_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'muna-haven');

CREATE POLICY mh_storage_owner_write ON storage.objects
  FOR ALL
  USING (bucket_id = 'muna-haven' AND public.is_owner())
  WITH CHECK (bucket_id = 'muna-haven' AND public.is_owner());

NOTIFY pgrst, 'reload schema';

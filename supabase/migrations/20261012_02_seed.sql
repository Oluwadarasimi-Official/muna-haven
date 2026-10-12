-- Muna's Haven boutique — seed migration 02
-- Categories, settings, initial products (idempotent).
-- Project ref: vtbappsupjgsuzhemypkq

-- ============ categories ============

INSERT INTO public.mh_categories (name, slug, description, sort_order)
VALUES
  ($$Hair$$, $$hair$$, NULL, 0),
  ($$Jewellery$$, $$jewellery$$, NULL, 1)
ON CONFLICT (slug) DO NOTHING;

-- ============ settings ============

INSERT INTO public.mh_settings (key, value, is_public)
VALUES
  ($$contact_email$$,      $$yzigzag26@gmail.com$$, true),
  ($$whatsapp_display$$,   $$+234 701 873 3485$$, true),
  ($$whatsapp_number$$,    $$2347018733485$$, true),
  ($$telegram_url$$,       $$https://t.me/TrustOSLLC$$, true),
  ($$delivery_notice$$,    $$Delivery: Coming soon.$$ , true),
  ($$referral_notice$$,    $$Referral programme: Coming soon.$$ , true),
  ($$whatsapp_channel_url$$, $$$$, true),
  ($$channel_sync_status$$, $$Manual publishing — no automatic sync; no official WhatsApp Channel API available.$$ , true),
  ($$brand_name$$,         $$Muna's Haven$$, true)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  is_public = EXCLUDED.is_public,
  updated_at = now();

-- ============ products ============

INSERT INTO public.mh_products
  (reference, name, slug, price_kobo, category_id, description, images, variants,
   availability, published, archived, featured)
VALUES
  (
    $$MH-HAIR-001$$,
    $$Pure Human Hair — Full Bob Closure$$,
    $$pure-human-hair-full-bob-closure$$,
    2800000,
    (SELECT id FROM public.mh_categories WHERE slug = $$hair$$),
    NULL,
    ARRAY[$$https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKu6zZdeZbKgfBkfFl3XLdFhCutcu9BVsQu1BYL4YN18Js-IMaLOhsPLPrDQ&s$$],
    $$[]$$::jsonb,
    $$in_stock$$,
    true,
    false,
    true
  ),
  (
    $$MH-JEW-001$$,
    $$Ladies Set with Ring$$,
    $$ladies-set-with-ring$$,
    350000,
    (SELECT id FROM public.mh_categories WHERE slug = $$jewellery$$),
    NULL,
    ARRAY[$$https://images.openai.com/static-rsc-4/J65fK5XPilveOuJL-bK1pye3xy0k4yHRdeTWHTYAok0HLY3obdT7IaQlkykla5KMfwabuvgaK3pNCGyPZnLxRWkhxdFivefw12C-i1eG0HgstuV92br4-eQI3yc03TDgkQwiSNeldoDQhxExrFqNUYJrJ0i5ZSEskvzaLdugqF-Lftvps3ArBoKQnjAik3oi?purpose=fullsize$$],
    $$[]$$::jsonb,
    $$in_stock$$,
    true,
    false,
    true
  ),
  (
    $$MH-JEW-002$$,
    $$Diamond Ball Set$$,
    $$diamond-ball-set$$,
    550000,
    (SELECT id FROM public.mh_categories WHERE slug = $$jewellery$$),
    $$Perfect for Owambe, wedding guests, dinner, church, and that rich-aunty look.$$,
    ARRAY[$$https://images.openai.com/static-rsc-4/_fuRpwkB5m-SdjJvxR-OZe5ET8x0xrFEoAlgfb2jcxakCdNJ5xzUxVnmI__m56skg1rLPm8oFoQ3eR82QaJRhxqFsORElisyddnluHw-9edsO3OW9L7utjEuAttEksp-4gG8ruULL9moDwaPoYaInsvgFrEW5FA58uhzJpVtvV_61FX1k0gf71FYjWhVinCk?purpose=fullsize$$],
    $$[]$$::jsonb,
    $$in_stock$$,
    true,
    false,
    true
  )
ON CONFLICT (reference) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price_kobo = EXCLUDED.price_kobo,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  variants = EXCLUDED.variants,
  availability = EXCLUDED.availability,
  published = EXCLUDED.published,
  archived = EXCLUDED.archived,
  featured = EXCLUDED.featured,
  updated_at = now();

NOTIFY pgrst, 'reload schema';

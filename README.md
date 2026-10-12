# Mun's Haven — Boutique Storefront

A full-stack Next.js 14 e-commerce site for **Mun's Haven** boutique: product
catalog, WhatsApp ordering, store updates/blog, and an `/admin` dashboard.

- Storefront: home (hero, featured products), `/shop` (search, category filter,
  sort), product pages (`/shop/[slug]`) with WhatsApp enquiry buttons,
  `/updates`, `/about`, `/contact`.
- Admin (`/admin`): login-protected dashboard to manage products, orders, and
  site settings.
- Database: Supabase Postgres (schema in `supabase/migrations/`), RLS enabled.
- Branding: blush pink (`#D9A0A7`), deep navy, gold accents; logo at
  `public/logo.jpg`.

## Setup

```bash
git clone https://github.com/Oluwadarasimi-Official/muna-haven.git
cd muna-haven
npm install
cp .env.example .env.local
```

Fill in `.env.local` (see `.env.example` for the variable list — it contains
**no real secrets**, only blanks). The real keys are in the Vercel project's
production environment variables, never in git.

Apply the database migrations to the shared Supabase project
(`vtappsupjgsuzhemypkq`) using the stored run-sql CLI (it never prints raw
credentials):

```bash
~/workspace/skills/supabase/bin/run-sql --ref vtappsupjgsuzhemypkq \
  --file supabase/migrations/20261012_01_schema.sql
```

> Do NOT touch any existing tables in the shared project — the migrations only
> create the `mh_*` tables this app owns.

Then start dev:

```bash
npm run dev
```

Open http://localhost:3000. `.env.local` is for local dev only and must never
hold production keys.

## Deployment

- Hosted on Vercel: **https://munshaven.vercel.app**
- GitHub: https://github.com/Oluwadarasimi-Official/muna-haven
- The Vercel project (`muna-haven`) is deployed from uploaded source; env vars
  are set on the project as production-only, encrypted variables:
  - `NEXT_PUBLIC_SUPABASE_URL` — https://vtappsupjgsuzhemypkq.supabase.co
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key
  - `SUPABASE_SERVICE_ROLE_KEY` — server-only (used by `lib/supabaseAdmin.ts`)
  - `NEXT_PUBLIC_SITE_URL` — the production URL above (used to build the
    shareable product link inside WhatsApp enquiry messages)
- Deployment protection / SSO is disabled so the storefront is public.
- After changing any `NEXT_PUBLIC_*` variable, trigger a redeploy — they are
  inlined at build time.

## Troubleshooting

- **Empty pages / products missing in production:** env vars are not set on
  the Vercel project (or were added after the last build). Add them as
  *production* variables and redeploy.
- **401s / RLS errors from Supabase:** check that `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  matches the shared project's current anon key and that the `mh_*` tables'
  policies allow reads.
- **Product images not loading:** `next.config.mjs` uses `images.remotePatterns`
  for the Supabase storage host — if the storage host changes, update it there.
- **`/admin` redirects to `/admin/login` unexpectedly:** the middleware guards
  `/admin/*`; the session cookie is missing or expired — sign in again.
- **`/admin` 404s on a fresh deploy:** confirm the admin routes were included
  in the deployment file set.

## Still pending

- **WhatsApp Channel URL** — waiting on David to send it; then wire it into
  the channel-sync flow.
- **Brand** — "Mun's Haven" everywhere (site text matches the official logo, which reads "Mun's Haven"). The logo file itself is used byte-identical, never redrawn.
- **Owner account** — provisioned and verified 2026-10-12: the shared Supabase project's legacy `handle_new_user()` trigger was repaired (it now mints a unique `referral_code` per new profile instead of failing NOT NULL), the `OfficialMuna` owner login was created, and sign-in + owner RLS write/delete were verified end-to-end against production.
